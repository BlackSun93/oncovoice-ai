import OpenAI, { toFile } from "openai";
import { createReadStream } from "fs";
import { promises as fs } from "fs";
import path from "path";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const TRANSCRIPTION_MODEL = process.env.OPENAI_TRANSCRIPTION_MODEL ?? "whisper-1";
const ANALYSIS_MODEL = process.env.OPENAI_ANALYSIS_MODEL ?? "gpt-4.1-mini";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AUDIO_BUFFER_FALLBACK_EXTENSION = "mp3";

/**
 * Resolve a local filesystem path from an upload reference which may be an absolute
 * path, a relative path, or a URL such as `/uploads/foo.m4a` or
 * `http://localhost:3000/uploads/foo.m4a`.
 */
function resolveLocalFilePath(reference: string): string {
  let target = reference.trim();

  if (target.startsWith("http://") || target.startsWith("https://")) {
    target = new URL(target).pathname;
  }

  target = target.replace(/[?#].*$/, "");

  if (path.isAbsolute(target)) {
    return target;
  }

  // Remove any leading slash so joins treat it as relative.
  const withoutLeadingSlash = target.replace(/^\/+/, "");

  if (withoutLeadingSlash.startsWith("public/")) {
    return path.resolve(process.cwd(), withoutLeadingSlash);
  }

  return path.resolve(process.cwd(), "public", withoutLeadingSlash);
}

/**
 * Basic helper to infer a sensible file extension for buffers when we can't rely on
 * an explicit file name.
 */
function inferExtension(contentType?: string, fallback = AUDIO_BUFFER_FALLBACK_EXTENSION): string {
  if (!contentType) return fallback;
  const subtype = contentType.split("/")[1];
  if (!subtype) return fallback;
  if (subtype === "mp4") return "m4a";
  return subtype;
}

/**
 * Transcribe an audio file using the OpenAI Whisper / transcription models.
 * Accepts either a filesystem reference (string) or a Buffer.
 */
export async function transcribeAudio(
  audioPathOrBuffer: string | Buffer,
  contentType?: string,
  fileName?: string
): Promise<string> {
  try {
    const uploadable =
      typeof audioPathOrBuffer === "string"
        ? (() => {
            const resolvedPath = resolveLocalFilePath(audioPathOrBuffer);
            console.log(`Reading audio file from: ${resolvedPath}`);
            return createReadStream(resolvedPath);
          })()
        : await toFile(
            audioPathOrBuffer,
            fileName ?? `audio.${inferExtension(contentType, AUDIO_BUFFER_FALLBACK_EXTENSION)}`
          );

    console.log(`Calling OpenAI transcription model (${TRANSCRIPTION_MODEL})...`);
    const transcription = await openai.audio.transcriptions.create({
      file: uploadable,
      model: TRANSCRIPTION_MODEL,
      language: "ar", // Whisper handles mixed Arabic-English conversations well
    });

    console.log(`Transcription successful with ${transcription.text.length} characters`);
    return transcription.text;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Transcription error details:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      sourceType: typeof audioPathOrBuffer,
      contentType,
      fileName,
    });

    if (error instanceof Error && /ENOENT|no such file/i.test(error.message)) {
      throw new Error(`Audio file not found: ${error.message}`);
    }
    if (error instanceof Error && /API/i.test(error.message)) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    if (error instanceof Error) {
      throw new Error(`Transcription error: ${error.message}`);
    }

    throw new Error("Failed to transcribe audio: unknown error");
  }
}

/**
 * Analyze a transcript against an accompanying PDF by calling the OpenAI
 * Responses API and asking for structured JSON output.
 */
type AnalysisStructuredOutput = {
  summary: string;
  conclusion: string;
  criticism: string;
};

export async function analyzeWithGPT5(
  transcript: string,
  pdfPath: string
): Promise<AnalysisStructuredOutput> {
  let uploadedFileId: string | null = null;

  try {
    const resolvedPdfPath = resolveLocalFilePath(pdfPath);
    const pdfStats = await fs.stat(resolvedPdfPath);
    console.log(`Preparing PDF for analysis: ${resolvedPdfPath} (${pdfStats.size} bytes)`);

    uploadedFileId = (
      await openai.files.create({
        file: createReadStream(resolvedPdfPath),
        purpose: "assistants",
      })
    ).id;

    console.log(`PDF uploaded successfully. File ID: ${uploadedFileId}`);

    const response = await openai.responses.parse({
      model: ANALYSIS_MODEL,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: "You are an expert oncology clinician and researcher. Provide thorough, evidence-based analysis of clinical discussions and clearly reference insights from the attached scientific PDF.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Review the attached PDF alongside the following transcript of a mixed Arabic-English oncology discussion, then deliver the requested analysis.\n\nTRANSCRIPT:\n${transcript}`,
            },
            {
              type: "input_file",
              file_id: uploadedFileId,
              filename: path.basename(resolvedPdfPath),
            },
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "oncology_analysis",
          description: "Structured analysis of the clinical discussion compared with the scientific PDF.",
          schema: {
            type: "object",
            additionalProperties: false,
            required: ["summary", "conclusion", "criticism"],
            properties: {
              summary: {
                type: "string",
                description: "Two to three paragraph summary of the discussion highlights.",
              },
              conclusion: {
                type: "string",
                description: "Key takeaways, outcomes, or recommended next steps from the conversation.",
              },
              criticism: {
                type: "string",
                description:
                  "Critical comparison between the discussion and the scientific PDF, covering strengths, gaps, discrepancies, and references to specific evidence.",
              },
            },
          },
          strict: true,
        },
      },
    });

    const analysis = response.output_parsed as AnalysisStructuredOutput | null;

    if (!analysis || !analysis.summary || !analysis.conclusion || !analysis.criticism) {
      const fallback = response.output_text?.trim();

      console.error("Structured analysis response missing fields", {
        hasParsed: Boolean(analysis),
        fallback,
      });

      if (fallback) {
        throw new Error("OpenAI returned unstructured analysis output. Please review fallback text in logs.");
      }

      throw new Error("Analysis response was missing required fields");
    }

    console.log("Analysis completed successfully");
    return analysis;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("Analysis error details:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      pdfPath,
    });

    if (error instanceof Error && /ENOENT|no such file/i.test(error.message)) {
      throw new Error(`PDF file not found: ${error.message}`);
    }
    if (error instanceof Error && /API/i.test(error.message)) {
      throw new Error(`OpenAI API error: ${error.message}`);
    }
    if (error instanceof Error) {
      throw new Error(`Analysis error: ${error.message}`);
    }

    throw new Error("Failed to analyze content with OpenAI");
  } finally {
    if (uploadedFileId) {
      try {
        await openai.files.delete(uploadedFileId);
        console.log(`Deleted uploaded file: ${uploadedFileId}`);
      } catch (cleanupError) {
        console.warn("Failed to delete uploaded file:", cleanupError);
      }
    }
  }
}
