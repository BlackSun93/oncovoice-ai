import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGPT5, generateCriticismAudio } from "@/lib/openai";
import { saveResult } from "@/lib/storage";
import { TEAMS } from "@/lib/constants";
import { getPdfUrlForTeam } from "@/lib/pdf-mapping";
import { put } from "@vercel/blob";

// Vercel Pro allows up to 300 seconds (5 minutes) for serverless functions
export const maxDuration = 300;

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
        console.log(`[Team ${teamId}] Step 2: Starting GPT-5 analysis in background...`);
        console.log(`[Team ${teamId}] Transcript length: ${transcript.length} chars, PDF size: ${pdfBuffer.length} bytes`);
        const analysisStartTime = Date.now();

        const analysis = await analyzeWithGPT5(transcript, pdfBuffer);

        const analysisEndTime = Date.now();
        const analysisDuration = ((analysisEndTime - analysisStartTime) / 1000).toFixed(2);
        console.log(`[Team ${teamId}] GPT-5 analysis completed in ${analysisDuration}s`);

        // Generate TTS audio for criticism section
        console.log(`[Team ${teamId}] Step 3: Generating TTS audio for criticism (${analysis.criticism.length} chars)...`);
        let criticismAudioUrl: string | undefined;

        try {
          const ttsStartTime = Date.now();
          const audioBuffer = await generateCriticismAudio(analysis.criticism);
          const ttsEndTime = Date.now();
          const ttsDuration = ((ttsEndTime - ttsStartTime) / 1000).toFixed(2);
          console.log(`[Team ${teamId}] TTS audio generated in ${ttsDuration}s, uploading to Blob...`);

          // Upload audio to Vercel Blob
          const audioBlob = await put(
            `team-${teamId}-criticism-${Date.now()}.mp3`,
            audioBuffer,
            {
              access: "public",
              contentType: "audio/mpeg",
            }
          );

          criticismAudioUrl = audioBlob.url;
          console.log(`[Team ${teamId}] Criticism audio uploaded successfully: ${criticismAudioUrl}`);
        } catch (ttsError) {
          console.error(`[Team ${teamId}] TTS generation/upload failed (continuing without audio):`, {
            error: ttsError instanceof Error ? ttsError.message : String(ttsError),
            stack: ttsError instanceof Error ? ttsError.stack : undefined,
          });
          // Continue without audio if TTS fails
        }

        // Save final result to storage
        console.log(`[Team ${teamId}] Step 4: Saving final result to storage...`);
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
        console.log(`[Team ${teamId}] ✓ Complete! Result saved successfully with summary (${analysis.summary.length} chars), conclusion (${analysis.conclusion.length} chars), criticism (${analysis.criticism.length} chars)`);
      } catch (bgError) {
        console.error(`[Team ${teamId}] ✗ Background processing error:`, {
          error: bgError instanceof Error ? bgError.message : String(bgError),
          stack: bgError instanceof Error ? bgError.stack : undefined,
          teamId,
        });

        // Save error status
        try {
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
          console.log(`[Team ${teamId}] Error status saved to storage`);
        } catch (saveError) {
          console.error(`[Team ${teamId}] Failed to save error status:`, saveError);
        }
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
