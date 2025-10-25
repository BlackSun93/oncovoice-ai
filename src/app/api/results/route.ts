import { NextResponse } from "next/server";
import { getAllResults } from "@/lib/storage";

export async function GET() {
  try {
    const results = await getAllResults();

    return NextResponse.json({
      success: true,
      results,
    });
  } catch (error) {
    console.error("Failed to fetch results:", error);
    return NextResponse.json(
      { error: "Failed to fetch results" },
      { status: 500 }
    );
  }
}
