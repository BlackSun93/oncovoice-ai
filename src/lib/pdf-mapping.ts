import { TEAM_PDF_URLS } from "./constants";

/**
 * Get the PDF URL for a given team ID
 * Returns Vercel Blob URL for production use
 */
export function getPdfUrlForTeam(teamId: number): string {
  const url = TEAM_PDF_URLS[teamId];

  if (!url) {
    throw new Error(`No PDF URL found for team ${teamId}`);
  }

  return url;
}

/**
 * Get the full URL for a PDF (useful for API calls)
 * Returns Vercel Blob URL (already absolute)
 */
export function getPdfAbsoluteUrl(teamId: number): string {
  return getPdfUrlForTeam(teamId);
}

/**
 * Check if PDF exists for a team
 */
export function hasPdfForTeam(teamId: number): boolean {
  return teamId in TEAM_PDF_URLS;
}
