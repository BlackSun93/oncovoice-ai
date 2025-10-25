import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get("audio") as File;
    const pdfFile = formData.get("pdf") as File;
    const teamId = formData.get("teamId") as string;

    if (!audioFile || !pdfFile || !teamId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create uploads directory if it doesn't exist
    const uploadsDir = join(process.cwd(), "public", "uploads");
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save audio file
    const audioBytes = await audioFile.arrayBuffer();
    const audioBuffer = Buffer.from(audioBytes);
    const audioFileName = `team-${teamId}-audio-${Date.now()}.${audioFile.name.split(".").pop()}`;
    const audioPath = join(uploadsDir, audioFileName);
    await writeFile(audioPath, audioBuffer);

    // Save PDF file
    const pdfBytes = await pdfFile.arrayBuffer();
    const pdfBuffer = Buffer.from(pdfBytes);
    const pdfFileName = `team-${teamId}-pdf-${Date.now()}.pdf`;
    const pdfPath = join(uploadsDir, pdfFileName);
    await writeFile(pdfPath, pdfBuffer);

    // Return URLs (relative to public directory) with metadata
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const audioUrl = `${baseUrl}/uploads/${audioFileName}`;
    const pdfUrl = `${baseUrl}/uploads/${pdfFileName}`;

    console.log(`Files uploaded successfully for team ${teamId}:`, {
      audioUrl,
      audioType: audioFile.type,
      audioSize: audioFile.size,
      pdfUrl,
      pdfSize: pdfFile.size,
    });

    return NextResponse.json({
      success: true,
      audioUrl,
      pdfUrl,
      audioContentType: audioFile.type,
      pdfContentType: pdfFile.type,
      audioFileName: audioFileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      { error: "Upload failed" },
      { status: 500 }
    );
  }
}
