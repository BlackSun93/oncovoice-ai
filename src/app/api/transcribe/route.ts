import { NextRequest, NextResponse } from "next/server";
import { transcribeAudio } from "@/lib/openai";

export async function POST(request: NextRequest) {
  try {
    const { audioUrl, contentType, fileName } = await request.json();

    if (!audioUrl) {
      return NextResponse.json(
        { error: "Audio URL is required" },
        { status: 400 }
      );
    }

    console.log(`Transcribe API called:`, { audioUrl, contentType, fileName });

    // Transcribe audio using OpenAI Whisper
    // The transcribeAudio function will read the file from the filesystem
    const transcript = await transcribeAudio(audioUrl, contentType, fileName);

    return NextResponse.json({
      success: true,
      transcript,
    });
  } catch (error) {
    // Log detailed error
    console.error("Transcription API error:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    // Return detailed error message
    const errorMessage = error instanceof Error ? error.message : "Transcription failed";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
