"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, RefreshCw, LineChart, Loader2 } from "lucide-react";
import { TEAMS, DASHBOARD_REFRESH_INTERVAL, getTeamsBySession, getSessionForTeam } from "@/lib/constants";
import { AllResults, TeamResult } from "@/types";
import TeamResultCard from "@/components/TeamResultCard";
import FullResultsModal from "@/components/FullResultsModal";
import AudioPlayerModal from "@/components/AudioPlayerModal";
import SessionSwitcher from "@/components/SessionSwitcher";

function ResultsContent() {
  const searchParams = useSearchParams();
  const [results, setResults] = useState<AllResults>({});
  const [selectedResult, setSelectedResult] = useState<TeamResult | null>(null);
  const [selectedAudioResult, setSelectedAudioResult] = useState<TeamResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Check if we're waiting for processing to complete
  const isProcessing = searchParams.get('processing') === 'true';
  const processingTeamId = searchParams.get('team');

  // Determine initial session based on the team ID from query params (if provided)
  const initialSession = processingTeamId
    ? getSessionForTeam(parseInt(processingTeamId))
    : 1;
  const [selectedSession, setSelectedSession] = useState<number>(initialSession);
  const [showProcessingNotice, setShowProcessingNotice] = useState(false);

  const fetchResults = async () => {
    try {
      const res = await fetch("/api/results");
      if (res.ok) {
        const data = await res.json();
        setResults(data.results || {});
        setLastUpdated(new Date());

        // Check if processing is complete
        if (isProcessing && processingTeamId) {
          const teamKey = `team-${processingTeamId}`;
          const teamResult = data.results?.[teamKey];

          // If the team result is now completed, hide the processing notice
          if (teamResult && teamResult.status === 'completed') {
            setShowProcessingNotice(false);
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch results:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Show processing notice if redirected from upload
    if (isProcessing) {
      setShowProcessingNotice(true);
    }

    fetchResults();

    // Use faster refresh interval when processing (5 seconds vs 30 seconds)
    const refreshInterval = isProcessing ? 5000 : DASHBOARD_REFRESH_INTERVAL;
    const interval = setInterval(fetchResults, refreshInterval);

    return () => clearInterval(interval);
  }, [isProcessing, processingTeamId]);

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

            <div className="flex flex-col gap-4">
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

              {/* Session Switcher */}
              <SessionSwitcher
                selectedSession={selectedSession}
                onSessionChange={setSelectedSession}
              />
            </div>
          </div>

          {/* Processing Notice */}
          {showProcessingNotice && (
            <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg flex items-center gap-3 animate-pulse">
              <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
              <div>
                <p className="text-amber-300 font-medium">
                  Analysis in progress...
                </p>
                <p className="text-amber-300/70 text-sm">
                  Results will appear automatically (refreshing every 5 seconds). This may take 2-5 minutes.
                </p>
              </div>
            </div>
          )}

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
              {getTeamsBySession(selectedSession).map((team) => {
                const result = results[`team-${team.id}`];
                return (
                  <TeamResultCard
                    key={team.id}
                    result={result || null}
                    onViewFull={() => result && setSelectedResult(result)}
                    onPlayCriticism={() => result && setSelectedAudioResult(result)}
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

      {/* Audio Player Modal */}
      {selectedAudioResult && (
        <AudioPlayerModal
          result={selectedAudioResult}
          onClose={() => setSelectedAudioResult(null)}
        />
      )}
    </>
  );
}

export default function ResultsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block p-4 bg-slate-800 rounded-full mb-4">
          <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        </div>
      </div>
    }>
      <ResultsContent />
    </Suspense>
  );
}
