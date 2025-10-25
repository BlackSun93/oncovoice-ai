import { readFile } from "fs/promises";
import { join } from "path";

/**
 * Extract text content from PDF file
 * Reads directly from filesystem instead of fetching from URL
 */
export async function extractPdfText(pdfUrl: string): Promise<string> {
  try {
    console.log(`Extracting text from PDF: ${pdfUrl}`);

    // If it's a URL, extract the file path
    let filePath = pdfUrl;
    if (pdfUrl.startsWith("http")) {
      // Extract /uploads/filename from URL
      const urlPath = new URL(pdfUrl).pathname;
      filePath = join(process.cwd(), "public", urlPath);
    }

    console.log(`Reading PDF from filesystem: ${filePath}`);

    // Read PDF file from filesystem
    const pdfBuffer = await readFile(filePath);
    console.log(`Read ${pdfBuffer.length} bytes from PDF file`);

    // Dynamically import pdf-parse (CommonJS module v2)
    const { PDFParse } = require("pdf-parse");
    console.log("pdf-parse module loaded");

    // Parse PDF - v2 uses class instantiation with buffer
    const parser = new PDFParse({ data: pdfBuffer });
    const result = await parser.getText();

    console.log(`Extracted ${result.text.length} characters of text from PDF`);
    console.log(`PDF has ${result.numPages} pages`);

    // Return extracted text
    return result.text;
  } catch (error) {
    console.error("PDF extraction error details:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      pdfUrl,
    });

    if (error instanceof Error) {
      if (error.message.includes("ENOENT") || error.message.includes("no such file")) {
        throw new Error(`PDF file not found: ${error.message}`);
      } else if (error.message.includes("PDF")) {
        throw new Error(`Invalid PDF file: ${error.message}`);
      } else {
        throw new Error(`PDF extraction error: ${error.message}`);
      }
    }

    throw new Error("Failed to extract text from PDF: Unknown error");
  }
}
