import { NextRequest, NextResponse } from "next/server";
import { put } from "@vercel/blob";

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

    console.log(`Uploading files for team ${teamId}:`, {
      audioName: audioFile.name,
      audioType: audioFile.type,
      audioSize: audioFile.size,
      pdfName: pdfFile.name,
      pdfSize: pdfFile.size,
    });

    // Upload audio file to Vercel Blob
    const audioFileName = `team-${teamId}-audio-${Date.now()}.${audioFile.name.split(".").pop()}`;
    const audioBlob = await put(audioFileName, audioFile, {
      access: "public",
      addRandomSuffix: false,
    });

    console.log(`Audio uploaded to Blob: ${audioBlob.url}`);

    // Upload PDF file to Vercel Blob
    const pdfFileName = `team-${teamId}-pdf-${Date.now()}.pdf`;
    const pdfBlob = await put(pdfFileName, pdfFile, {
      access: "public",
      addRandomSuffix: false,
    });

    console.log(`PDF uploaded to Blob: ${pdfBlob.url}`);

    return NextResponse.json({
      success: true,
      audioUrl: audioBlob.url,
      pdfUrl: pdfBlob.url,
      audioContentType: audioFile.type,
      pdfContentType: pdfFile.type,
      audioFileName: audioFileName,
    });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json(
      {
        error: "Upload failed",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}
