import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGPT4 } from "@/lib/openai";
import { extractPdfText } from "@/lib/pdf-processor";
import { saveResult } from "@/lib/storage";
import { TEAMS } from "@/lib/constants";

export async function POST(request: NextRequest) {
  try {
    const { teamId, transcript, pdfUrl } = await request.json();

    console.log("Analysis API called:", { teamId, transcriptLength: transcript?.length, pdfUrl });

    if (!teamId || !transcript || !pdfUrl) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Extract text from PDF
    console.log("Step 1: Extracting text from PDF...");
    const pdfText = await extractPdfText(pdfUrl);
    console.log(`PDF text extracted: ${pdfText.length} characters`);

    // Analyze with GPT-4
    console.log("Step 2: Analyzing with GPT-4...");
    const analysis = await analyzeWithGPT4(transcript, pdfText);
    console.log("GPT-4 analysis completed");

    // Find team name
    const team = TEAMS.find((t) => t.id === parseInt(teamId));
    const teamName = team?.name || `Team ${teamId}`;

    // Save result to storage
    console.log("Step 3: Saving result to storage...");
    const result = {
      teamId: parseInt(teamId),
      teamName,
      transcript,
      summary: analysis.summary,
      conclusion: analysis.conclusion,
      criticism: analysis.criticism,
      createdAt: new Date().toISOString(),
      status: "completed" as const,
    };

    await saveResult(parseInt(teamId), result);
    console.log("Result saved successfully for team", teamId);

    return NextResponse.json({
      success: true,
      result: analysis,
    });
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
