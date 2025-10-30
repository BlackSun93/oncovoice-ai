import OpenAI, { toFile } from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

const TRANSCRIPTION_MODEL = process.env.OPENAI_TRANSCRIPTION_MODEL ?? "whisper-1";
const ANALYSIS_MODEL = process.env.OPENAI_ANALYSIS_MODEL ?? "gpt-5";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const AUDIO_BUFFER_FALLBACK_EXTENSION = "mp3";

/**
 * Fetch a file from a URL and return it as a Buffer
 */
async function fetchFileFromUrl(url: string): Promise<Buffer> {
  console.log(`Fetching file from URL: ${url}`);
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to fetch file from ${url}: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  console.log(`Fetched ${buffer.length} bytes from ${url}`);

  return buffer;
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
 * Extract filename from a URL
 */
function getFilenameFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const parts = pathname.split('/');
    return parts[parts.length - 1] || 'file';
  } catch {
    return 'file';
  }
}

/**
 * Transcribe an audio file using the OpenAI Whisper / transcription models.
 * Accepts either a URL (string) or a Buffer.
 */
export async function transcribeAudio(
  audioUrlOrBuffer: string | Buffer,
  contentType?: string,
  fileName?: string
): Promise<string> {
  try {
    let buffer: Buffer;
    let finalFileName: string;

    // If it's a string, treat it as a URL and fetch the file
    if (typeof audioUrlOrBuffer === "string") {
      console.log(`Fetching audio file from URL: ${audioUrlOrBuffer}`);
      buffer = await fetchFileFromUrl(audioUrlOrBuffer);
      finalFileName = fileName || getFilenameFromUrl(audioUrlOrBuffer);
    } else {
      // It's already a buffer
      buffer = audioUrlOrBuffer;
      finalFileName = fileName ?? `audio.${inferExtension(contentType, AUDIO_BUFFER_FALLBACK_EXTENSION)}`;
    }

    console.log(`Preparing audio file for transcription: ${finalFileName} (${buffer.length} bytes)`);

    // Convert buffer to File object for OpenAI
    const uploadable = await toFile(buffer, finalFileName);

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
      sourceType: typeof audioUrlOrBuffer,
      contentType,
      fileName,
    });

    if (error instanceof Error && /fetch|network/i.test(error.message)) {
      throw new Error(`Failed to fetch audio file: ${error.message}`);
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

/**
 * Generate professional male speech audio from text using OpenAI TTS.
 * Returns audio as a Buffer (MP3 format).
 */
export async function generateCriticismAudio(criticismText: string): Promise<Buffer> {
  try {
    console.log(`Generating TTS audio for criticism text (${criticismText.length} characters)...`);

    const response = await openai.audio.speech.create({
      model: "gpt-4o-mini-tts", // GPT-4o Mini TTS model
      voice: "ash", // Ash voice
      input: criticismText,
      response_format: "mp3",
      speed: 1.0, // Normal speed
    });

    // Convert response to Buffer
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`TTS audio generated successfully (${buffer.length} bytes)`);
    return buffer;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error("TTS generation error details:", {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      textLength: criticismText.length,
    });

    if (error instanceof Error && /API/i.test(error.message)) {
      throw new Error(`OpenAI TTS API error: ${error.message}`);
    }
    if (error instanceof Error) {
      throw new Error(`TTS generation error: ${error.message}`);
    }

    throw new Error("Failed to generate audio from text");
  }
}

export async function analyzeWithGPT5(
  transcript: string,
  pdfUrlOrBuffer: string | Buffer
): Promise<AnalysisStructuredOutput> {
  let uploadedFileId: string | null = null;

  try {
    let pdfBuffer: Buffer;
    let pdfFileName: string;

    // If it's a string, treat it as a URL and fetch the file
    if (typeof pdfUrlOrBuffer === "string") {
      console.log(`Fetching PDF from URL: ${pdfUrlOrBuffer}`);
      pdfBuffer = await fetchFileFromUrl(pdfUrlOrBuffer);
      pdfFileName = getFilenameFromUrl(pdfUrlOrBuffer);
    } else {
      // It's already a buffer
      pdfBuffer = pdfUrlOrBuffer;
      pdfFileName = "document.pdf";
    }

    console.log(`Preparing PDF for analysis: ${pdfFileName} (${pdfBuffer.length} bytes)`);

    // Upload PDF to OpenAI for assistant processing
    const pdfFile = await toFile(pdfBuffer, pdfFileName);
    uploadedFileId = (
      await openai.files.create({
        file: pdfFile,
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
              text: "You are an expert oncology clinician and researcher with comprehensive knowledge of current oncology literature and evidence-based practice. Provide thorough, evidence-based analysis of clinical discussions.",
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze the following transcript of a mixed Arabic-English oncology discussion using your knowledge base, then deliver the requested analysis.\n\nTRANSCRIPT:\n${transcript}`,
            },
            {
              type: "input_file",
              file_id: uploadedFileId,
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
                  "Start by thanking the team for their discussion. Then provide critical analysis based on evidence-based oncology knowledge (approximately 120 words for 50-second reading time). Focus on the most important: alignment with current evidence, key contradictions or gaps, and significant strengths or weaknesses. Be concise and prioritize clinical relevance.",
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
      pdfSource: typeof pdfUrlOrBuffer === "string" ? pdfUrlOrBuffer : "Buffer",
    });

    if (error instanceof Error && /fetch|network/i.test(error.message)) {
      throw new Error(`Failed to fetch PDF file: ${error.message}`);
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
