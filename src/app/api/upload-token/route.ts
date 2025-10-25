import { NextRequest, NextResponse } from "next/server";

/**
 * Generate client upload tokens for direct-to-Blob uploads
 * This bypasses API route body size limits by allowing browser to upload directly
 */
export async function POST(request: NextRequest) {
  try {
    const { filename, teamId } = await request.json();

    if (!filename || !teamId) {
      return NextResponse.json(
        { error: "Missing filename or teamId" },
        { status: 400 }
      );
    }

    // Generate unique filename with team ID and timestamp
    const timestamp = Date.now();
    const extension = filename.split(".").pop();
    const baseFilename = filename.replace(/\.[^/.]+$/, "");
    const uniqueFilename = `team-${teamId}-${baseFilename}-${timestamp}.${extension}`;

    console.log(`Generating upload token for: ${uniqueFilename}`);

    // Return the filename that will be used for client-side upload
    // The actual upload URL will be generated client-side using @vercel/blob
    return NextResponse.json({
      success: true,
      filename: uniqueFilename,
      timestamp,
    });
  } catch (error) {
    console.error("Token generation error:", error);
    return NextResponse.json(
      {
        error: "Failed to generate upload token",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
