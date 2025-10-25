import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        // You can add authorization checks here if needed
        // For now, we allow all uploads
        console.log("Generating upload token for:", pathname);

        return {
          allowedContentTypes: [
            "audio/mpeg",
            "audio/mp3",
            "audio/mp4",
            "audio/x-m4a",
            "audio/wav",
            "audio/webm",
            "application/pdf",
          ],
          tokenPayload: JSON.stringify({
            // Optional: Add user/team info for tracking
            uploadedAt: new Date().toISOString(),
          }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Optional: Log successful uploads
        console.log("Upload completed:", {
          url: blob.url,
          pathname: blob.pathname,
          uploadedAt: blob.uploadedAt,
        });
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error("Blob upload error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Upload failed",
      },
      { status: 400 }
    );
  }
}
