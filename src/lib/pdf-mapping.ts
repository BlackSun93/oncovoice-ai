import { TEAM_PDF_MAPPING } from "./constants";

/**
 * Get the PDF URL for a given team ID
 * In development: returns path to public/pdfs folder
 * In production: can be extended to return Vercel Blob URL
 */
export function getPdfUrlForTeam(teamId: number): string {
  const filename = TEAM_PDF_MAPPING[teamId];

  if (!filename) {
    throw new Error(`No PDF mapping found for team ${teamId}`);
  }

  // For now, use public folder path
  // In production, you can switch this to Vercel Blob URLs
  return `/pdfs/${filename}`;
}

/**
 * Get the full URL for a PDF (useful for API calls)
 * Returns absolute URL in production, relative in development
 */
export function getPdfAbsoluteUrl(teamId: number, baseUrl?: string): string {
  const relativePath = getPdfUrlForTeam(teamId);

  // If baseUrl provided, create absolute URL
  if (baseUrl) {
    return new URL(relativePath, baseUrl).toString();
  }

  // In development or when baseUrl not provided, return relative path
  return relativePath;
}

/**
 * Check if PDF exists for a team
 */
export function hasPdfForTeam(teamId: number): boolean {
  return teamId in TEAM_PDF_MAPPING;
}
