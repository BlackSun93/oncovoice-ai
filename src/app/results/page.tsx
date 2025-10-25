"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, RefreshCw, LineChart } from "lucide-react";
import { TEAMS, DASHBOARD_REFRESH_INTERVAL } from "@/lib/constants";
import { AllResults, TeamResult } from "@/types";
import TeamResultCard from "@/components/TeamResultCard";
import FullResultsModal from "@/components/FullResultsModal";

export default function ResultsPage() {
  const [results, setResults] = useState<AllResults>({});
  const [selectedResult, setSelectedResult] = useState<TeamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || {});
        setLastUpdated(new Date());
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchResults, DASHBOARD_REFRESH_INTERVAL);

    return () => clearInterval(interval);
  }, []);

  const handleManualRefresh = () => {
    setIsLoading(true);
    fetchResults();
  };

  return (
    <>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-r from-cyan-500/20 to-teal-500/20 rounded-xl">
                  <LineChart className="w-8 h-8 text-cyan-400" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-300 to-teal-300 bg-clip-text text-transparent">
                    Results Dashboard
                  </h1>
                  <p className="text-slate-400 mt-1">
                    Last updated: {lastUpdated.toLocaleTimeString()}
                  </p>
                </div>
              </div>

              <button
                onClick={handleManualRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-white transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>
          </div>

          {/* Results Grid */}
          {isLoading && Object.keys(results).length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-block p-4 bg-slate-800 rounded-full mb-4">
                <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
              </div>
              <p className="text-slate-400">Loading results...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {TEAMS.map((team) => {
                const result = results[`team-${team.id}`];
                return (
                  <TeamResultCard
                    key={team.id}
                    result={result || null}
                    onViewFull={() => result && setSelectedResult(result)}
                  />
                );
              })}
            </div>
          )}

          {/* Info */}
          <div className="mt-8 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
            <p className="text-sm text-cyan-300">
              Dashboard auto-refreshes every 30 seconds. Results appear here immediately after processing completes.
            </p>
          </div>
        </div>
      </div>

      {/* Full Results Modal */}
      {selectedResult && (
        <FullResultsModal
          result={selectedResult}
          onClose={() => setSelectedResult(null)}
        />
      )}
    </>
  );
}
