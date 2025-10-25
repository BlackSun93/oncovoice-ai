import OpenAI from "openai";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY environment variable is not set");
}

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Transcribe audio file using OpenAI Whisper API
 * Accepts either a file path (server-side) or Buffer/Blob
 */
export async function transcribeAudio(
  audioPathOrBuffer: string | Buffer,
  contentType?: string,
  fileName?: string
): Promise<string> {
  try {
    let audioFile: File;

    if (typeof audioPathOrBuffer === "string") {
      // Server-side: Read file from filesystem
      const fs = await import("fs/promises");
      const path = await import("path");

      console.log(`Reading audio file from: ${audioPathOrBuffer}`);

      // If it's a URL, extract the file path
      let filePath = audioPathOrBuffer;
      if (audioPathOrBuffer.startsWith("http")) {
        // Extract /uploads/filename from URL
        const urlPath = new URL(audioPathOrBuffer).pathname;
        filePath = path.join(process.cwd(), "public", urlPath);
      }

      console.log(`File system path: ${filePath}`);
      const fileBuffer = await fs.readFile(filePath);
      console.log(`Read ${fileBuffer.length} bytes from file`);

      // Determine file extension and MIME type from file path or contentType
      const ext = fileName?.split(".").pop() || filePath.split(".").pop() || "mp3";
      const mimeType = contentType || `audio/${ext === "m4a" ? "mp4" : ext}`;
      const finalFileName = fileName || `audio.${ext}`;

      console.log(`Creating File object: ${finalFileName} (${mimeType})`);
      // Convert Buffer to Uint8Array for File API compatibility
      const uint8Array = new Uint8Array(fileBuffer);
      audioFile = new File([uint8Array], finalFileName, { type: mimeType });
    } else {
      // Buffer passed directly
      const mimeType = contentType || "audio/mpeg";
      const ext = mimeType.split("/")[1] || "mp3";
      const finalFileName = fileName || `audio.${ext}`;

      console.log(`Creating File object from buffer: ${finalFileName} (${mimeType})`);
      // Convert Buffer to Uint8Array for File API compatibility
      const uint8Array = new Uint8Array(audioPathOrBuffer);
      audioFile = new File([uint8Array], finalFileName, { type: mimeType });
    }

    console.log(`File object created: ${audioFile.name}, size: ${audioFile.size} bytes, type: ${audioFile.type}`);

    // Call Whisper API
    console.log("Calling OpenAI Whisper API...");
    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "ar", // Arabic, but Whisper handles mixed languages well
    });

    console.log(`Transcription successful: ${transcription.text.length} characters`);
    return transcription.text;
  } catch (error) {
    // Detailed error logging
    console.error("Transcription error details:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      audioPathOrBuffer: typeof audioPathOrBuffer === "string" ? audioPathOrBuffer : `Buffer(${audioPathOrBuffer.length} bytes)`,
      contentType,
      fileName,
    });

    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("ENOENT") || error.message.includes("no such file")) {
        throw new Error(`Audio file not found: ${error.message}`);
      } else if (error.message.includes("API")) {
        throw new Error(`OpenAI API error: ${error.message}`);
      } else {
        throw new Error(`Transcription error: ${error.message}`);
      }
    }

    throw new Error("Failed to transcribe audio: Unknown error");
  }
}

/**
 * Analyze transcript with PDF source using GPT-5 via Assistants API
 * Uses OpenAI Assistants API which natively supports PDF files
 * GPT-5 can understand both text AND visual elements (diagrams, charts, tables)
 */
export async function analyzeWithGPT5(
  transcript: string,
  pdfPath: string
): Promise<{ summary: string; conclusion: string; criticism: string }> {
  try {
    const fs = await import("fs/promises");
    const path = await import("path");

    console.log(`Reading PDF file for GPT-5 analysis: ${pdfPath}`);

    // If it's a URL, extract the file path
    let filePath = pdfPath;
    if (pdfPath.startsWith("http")) {
      const urlPath = new URL(pdfPath).pathname;
      filePath = path.join(process.cwd(), "public", urlPath);
    }

    console.log(`File system path: ${filePath}`);

    // Read PDF file as buffer
    const pdfBuffer = await fs.readFile(filePath);
    console.log(`Read ${pdfBuffer.length} bytes from PDF file`);

    // Create File object from buffer for upload
    const uint8Array = new Uint8Array(pdfBuffer);
    const pdfFile = new File([uint8Array], "scientific-paper.pdf", { type: "application/pdf" });
    console.log(`Created PDF File object: ${pdfFile.size} bytes`);

    // Upload PDF file to OpenAI for Assistants
    console.log("Uploading PDF to OpenAI Files API...");
    const uploadedFile = await openai.files.create({
      file: pdfFile,
      purpose: "assistants",
    });
    console.log(`PDF uploaded successfully. File ID: ${uploadedFile.id}`);

    // Create an Assistant with file_search capability
    console.log("Creating GPT-5 assistant for document analysis...");
    const assistant = await openai.beta.assistants.create({
      model: "gpt-5",
      name: "Oncology Analysis Assistant",
      instructions: "You are an expert medical AI assistant specializing in oncology. You provide thorough, evidence-based analysis of clinical discussions. You can analyze both text content and visual elements (diagrams, charts, tables, figures) in medical documents.",
      tools: [{ type: "file_search" }],
    });
    console.log(`Assistant created: ${assistant.id}`);

    // Create a thread
    console.log("Creating conversation thread...");
    const thread = await openai.beta.threads.create({
      messages: [
        {
          role: "user",
          content: `You are analyzing a clinical discussion recording for oncology professionals. The recording is a mixed Arabic and English conversation.

TRANSCRIPT OF THE RECORDING:
${transcript}

TASK:
Please analyze the recording by comparing it with the scientific source PDF attached. The PDF contains important medical literature, including text, diagrams, charts, tables, and figures that are relevant to the discussion.

Please provide a comprehensive analysis in English with the following sections:

1. SUMMARY (2-3 paragraphs)
Summarize the main points discussed in the recording.

2. CONCLUSION (1-2 paragraphs)
What are the key takeaways and conclusions from this clinical discussion?

3. CRITICAL ANALYSIS & COMPARISON (2-3 paragraphs)
Critically analyze the content of the recording by comparing it with the scientific source PDF (including any diagrams, tables, charts, and figures). Identify:
- Areas of alignment with the scientific source
- Contradictions or discrepancies with evidence-based practices
- Missing critical information that should have been discussed (reference specific figures/tables if relevant)
- Strengths of the discussion
- Areas for improvement

Provide your response in a clear, professional, structured format suitable for medical professionals.`,
          attachments: [
            {
              file_id: uploadedFile.id,
              tools: [{ type: "file_search" }],
            },
          ],
        },
      ],
    });
    console.log(`Thread created: ${thread.id}`);

    // Run the assistant
    console.log("Running GPT-5 assistant analysis...");
    const run = await openai.beta.threads.runs.createAndPoll(thread.id, {
      assistant_id: assistant.id,
    });
    console.log(`Run completed with status: ${run.status}`);

    if (run.status === "completed") {
      // Retrieve the assistant's response
      const messages = await openai.beta.threads.messages.list(thread.id);
      const assistantMessage = messages.data.find((msg) => msg.role === "assistant");

      if (!assistantMessage || !assistantMessage.content[0] || assistantMessage.content[0].type !== "text") {
        throw new Error("No valid response from assistant");
      }

      const response = assistantMessage.content[0].text.value;
      console.log("GPT-5 analysis completed successfully");

      // Parse the response to extract sections
      const summaryMatch = response.match(/1\.\s*SUMMARY[\s\S]*?\n\n([\s\S]*?)(?=\n\n2\.|\n2\.)/i);
      const conclusionMatch = response.match(/2\.\s*CONCLUSION[\s\S]*?\n\n([\s\S]*?)(?=\n\n3\.|\n3\.)/i);
      const criticismMatch = response.match(/3\.\s*CRITICAL ANALYSIS[\s\S]*?\n\n([\s\S]*)/i);

      const summary = summaryMatch?.[1]?.trim() || response.split("\n\n")[0];
      const conclusion = conclusionMatch?.[1]?.trim() || response.split("\n\n")[1] || "";
      const criticism = criticismMatch?.[1]?.trim() || response.split("\n\n")[2] || "";

      // Clean up resources
      try {
        await openai.beta.assistants.delete(assistant.id);
        console.log(`Cleaned up assistant: ${assistant.id}`);
        await openai.beta.threads.delete(thread.id);
        console.log(`Cleaned up thread: ${thread.id}`);
        await openai.files.delete(uploadedFile.id);
        console.log(`Cleaned up file: ${uploadedFile.id}`);
      } catch (cleanupError) {
        console.warn("Failed to cleanup resources:", cleanupError);
        // Non-critical error, continue
      }

      return {
        summary,
        conclusion,
        criticism,
      };
    } else {
      throw new Error(`Assistant run failed with status: ${run.status}`);
    }
  } catch (error) {
    console.error("GPT-5 analysis error details:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      pdfPath,
    });

    if (error instanceof Error) {
      if (error.message.includes("ENOENT") || error.message.includes("no such file")) {
        throw new Error(`PDF file not found: ${error.message}`);
      } else if (error.message.includes("API")) {
        throw new Error(`OpenAI API error: ${error.message}`);
      } else {
        throw new Error(`Analysis error: ${error.message}`);
      }
    }

    throw new Error("Failed to analyze content with GPT-5");
  }
}
