import { TeamResult } from "@/types";

// In-memory storage for local development
// In production, this will be replaced with Vercel KV
const inMemoryStorage: Record<string, TeamResult> = {};

/**
 * Save team result to storage
 */
export async function saveResult(teamId: number, result: TeamResult): Promise<void> {
  const key = `team-${teamId}`;

  // Check if Vercel KV is available (production)
  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      await kv.set(key, result);
      return;
    } catch (error) {
      console.error("KV storage error:", error);
    }
  }

  // Fallback to in-memory storage (development)
  inMemoryStorage[key] = result;
}

/**
 * Get team result from storage
 */
export async function getResult(teamId: number): Promise<TeamResult | null> {
  const key = `team-${teamId}`;

  // Check if Vercel KV is available (production)
  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      const result = await kv.get<TeamResult>(key);
      return result;
    } catch (error) {
      console.error("KV storage error:", error);
    }
  }

  // Fallback to in-memory storage (development)
  return inMemoryStorage[key] || null;
}

/**
 * Get all team results from storage
 */
export async function getAllResults(): Promise<Record<string, TeamResult | null>> {
  const results: Record<string, TeamResult | null> = {};

  // Check if Vercel KV is available (production)
  if (process.env.KV_REST_API_URL) {
    try {
      const { kv } = await import("@vercel/kv");
      for (let i = 1; i <= 15; i++) {
        const key = `team-${i}`;
        const result = await kv.get<TeamResult>(key);
        results[key] = result;
      }
      return results;
    } catch (error) {
      console.error("KV storage error:", error);
    }
  }

  // Fallback to in-memory storage (development)
  for (let i = 1; i <= 15; i++) {
    const key = `team-${i}`;
    results[key] = inMemoryStorage[key] || null;
  }

  return results;
}
