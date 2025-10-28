import { NextRequest, NextResponse } from "next/server";
import { analyzeWithGPT5 } from "@/lib/openai";
import { saveResult } from "@/lib/storage";
import { TEAMS } from "@/lib/constants";
import { getPdfAbsoluteUrl } from "@/lib/pdf-mapping";
import path from "path";
import fs from "fs";

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

    // Get PDF path for this team from mapping
    console.log("Step 1: Getting PDF for team", teamId);
    const pdfRelativePath = getPdfAbsoluteUrl(teamId);

    // Convert to absolute file system path for local development
    // In production, this would use Vercel Blob URLs
    const publicDir = path.join(process.cwd(), 'public');
    const pdfFilePath = path.join(publicDir, pdfRelativePath);

    console.log("PDF path:", pdfFilePath);

    // Check if PDF exists
    if (!fs.existsSync(pdfFilePath)) {
      console.error("PDF not found:", pdfFilePath);
      return NextResponse.json(
        { error: `PDF not found for team ${teamId}` },
        { status: 404 }
      );
    }

    // Read PDF as buffer
    const pdfBuffer = fs.readFileSync(pdfFilePath);
    console.log("PDF loaded successfully:", pdfBuffer.length, "bytes");

    // Analyze with GPT-5 (processes PDF directly - no text extraction needed!)
    console.log("Step 2: Analyzing with GPT-5 (including native PDF processing)...");
    const analysis = await analyzeWithGPT5(transcript, pdfBuffer);
    console.log("GPT-5 analysis completed (PDF + transcript analyzed)");

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
