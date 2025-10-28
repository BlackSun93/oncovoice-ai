import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGPT5, generateCriticismAudio } from "@/lib/openai";
import { saveResult } from "@/lib/storage";
import { TEAMS } from "@/lib/constants";
import { getPdfUrlForTeam } from "@/lib/pdf-mapping";
import { put } from "@vercel/blob";

export async function POST(request: NextRequest) {
  try {
    const { teamId, transcript } = await request.json();

    console.log("Analysis API called:", { teamId, transcriptLength: transcript?.length });

    if (!teamId || !transcript) {
      return NextResponse.json(
        { error: "Missing required fields (teamId, transcript)" },
        { status: 400 }
      );
    }

    // Get PDF URL for this team from Vercel Blob
    console.log("Step 1: Getting PDF URL for team", teamId);
    const pdfUrl = getPdfUrlForTeam(teamId);
    console.log("PDF URL:", pdfUrl);

    // Fetch PDF from Vercel Blob
    console.log("Fetching PDF from Vercel Blob...");
    const pdfResponse = await fetch(pdfUrl);

    if (!pdfResponse.ok) {
      console.error("Failed to fetch PDF:", pdfResponse.status, pdfResponse.statusText);
      return NextResponse.json(
        { error: `Failed to fetch PDF for team ${teamId}` },
        { status: 404 }
      );
    }

    // Convert to buffer
    const pdfArrayBuffer = await pdfResponse.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfArrayBuffer);
    console.log("PDF fetched successfully:", pdfBuffer.length, "bytes");

    // Find team name
    const team = TEAMS.find((t) => t.id === parseInt(teamId));
    const teamName = team?.name || `Team ${teamId}`;

    // Save initial "processing" status immediately
    console.log("Saving initial processing status...");
    await saveResult(parseInt(teamId), {
      teamId: parseInt(teamId),
      teamName,
      transcript,
      summary: "",
      conclusion: "",
      criticism: "",
      createdAt: new Date().toISOString(),
      status: "processing" as const,
    });

    // Return immediately to client (avoids timeout issues)
    console.log("Returning immediate success response to client...");
    const response = NextResponse.json({
      success: true,
      status: "processing",
      message: "Analysis started. Results will be available on the dashboard shortly.",
    });

    // Continue processing in background (after response is sent)
    // This runs asynchronously without blocking the response
    (async () => {
      try {
        console.log("Step 2: Analyzing with GPT-5 (including native PDF processing)...");
        const analysis = await analyzeWithGPT5(transcript, pdfBuffer);
        console.log("GPT-5 analysis completed (PDF + transcript analyzed)");

        // Generate TTS audio for criticism section
        console.log("Step 3: Generating TTS audio for Dr Amr Criticism...");
        let criticismAudioUrl: string | undefined;

        try {
          const audioBuffer = await generateCriticismAudio(analysis.criticism);

          // Upload audio to Vercel Blob
          console.log("Uploading criticism audio to Vercel Blob...");
          const audioBlob = await put(
            `team-${teamId}-criticism-${Date.now()}.mp3`,
            audioBuffer,
            {
              access: "public",
              contentType: "audio/mpeg",
            }
          );

          criticismAudioUrl = audioBlob.url;
          console.log("Criticism audio uploaded successfully:", criticismAudioUrl);
        } catch (ttsError) {
          console.error("TTS generation/upload failed (continuing without audio):", {
            error: ttsError instanceof Error ? ttsError.message : String(ttsError),
            stack: ttsError instanceof Error ? ttsError.stack : undefined,
          });
          // Continue without audio if TTS fails
        }

        // Save final result to storage
        console.log("Step 4: Saving final result to storage...");
        const result = {
          teamId: parseInt(teamId),
          teamName,
          transcript,
          summary: analysis.summary,
          conclusion: analysis.conclusion,
          criticism: analysis.criticism,
          criticismAudioUrl,
          createdAt: new Date().toISOString(),
          status: "completed" as const,
        };

        await saveResult(parseInt(teamId), result);
        console.log("Result saved successfully for team", teamId);
      } catch (bgError) {
        console.error("Background processing error:", {
          error: bgError instanceof Error ? bgError.message : String(bgError),
          stack: bgError instanceof Error ? bgError.stack : undefined,
          teamId,
        });

        // Save error status
        await saveResult(parseInt(teamId), {
          teamId: parseInt(teamId),
          teamName,
          transcript,
          summary: "",
          conclusion: "",
          criticism: "",
          createdAt: new Date().toISOString(),
          status: "failed" as const,
        });
      }
    })();

    return response;
  } catch (error) {
    console.error("Analysis API error details:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    });

    const errorMessage = error instanceof Error ? error.message : "Analysis failed";

    return NextResponse.json(
      {
        error: errorMessage,
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}
