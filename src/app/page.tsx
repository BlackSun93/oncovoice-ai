"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { TEAMS, BREAKOUT_SESSIONS, getTeamsBySession } from "@/lib/constants";
import { Mic, LineChart, RefreshCw } from "lucide-react";
import SessionSelector from "@/components/SessionSelector";

const SESSION_STORAGE_KEY = "selected_session";

export default function HomePage() {
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [showSessionSelector, setShowSessionSelector] = useState(false);

  // Load selected session from sessionStorage on mount
  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      setSelectedSession(parseInt(stored));
    } else {
      setShowSessionSelector(true);
    }
  }, []);

  const handleSelectSession = (sessionId: number) => {
    setSelectedSession(sessionId);
    sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId.toString());
    setShowSessionSelector(false);
  };

  const handleChangeSession = () => {
    setShowSessionSelector(true);
  };

  // Get teams for selected session
  const displayTeams = selectedSession ? getTeamsBySession(selectedSession) : [];
  const currentSession = BREAKOUT_SESSIONS.find(s => s.id === selectedSession);

  return (
    <>
      {showSessionSelector && (
        <SessionSelector onSelectSession={handleSelectSession} />
      )}

      <div className="relative flex items-center justify-center px-4 py-4 min-h-[calc(100vh-12rem)] overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 -z-10">
        {/* Gradient Orbs with improved positioning */}
        <div className="absolute top-[20%] left-[15%] w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-[15%] right-[15%] w-[500px] h-[500px] bg-teal-500/20 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-emerald-500/10 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[10%] right-[25%] w-[300px] h-[300px] bg-violet-500/15 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />

        {/* Refined Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-15" />

        {/* Radial gradient overlay for depth */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-slate-900/20 to-slate-900/40" />
      </div>

      <div className="max-w-7xl w-full relative z-10">
        {/* Enhanced Hero Section */}
        <div className="text-center mb-8">
          {/* Session Badge */}
          {currentSession && (
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800/60 border border-cyan-500/30 rounded-full mb-4">
              <span className="text-sm text-slate-400">Current Session:</span>
              <span className="text-sm font-semibold text-cyan-400">{currentSession.name}</span>
              <button
                onClick={handleChangeSession}
                className="ml-2 text-xs text-slate-500 hover:text-cyan-400 transition-colors"
                title="Change session"
              >
                <RefreshCw className="w-3 h-3" />
              </button>
            </div>
          )}

          {/* Title with enhanced gradient */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent leading-tight">
            Select Your Team
          </h2>

          {/* Subtitle with better contrast */}
          <p className="text-lg md:text-xl text-slate-300 max-w-3xl mx-auto mb-3">
            Upload your clinical discussion recording for AI-powered analysis
          </p>

          {/* Decorative underline */}
          <div className="flex justify-center gap-2 mb-8">
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full" />
            <div className="h-1 w-20 bg-gradient-to-r from-transparent via-teal-500 to-transparent rounded-full" />
          </div>
        </div>

        {/* Enhanced Team Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6 px-2">
          {displayTeams.map((team) => (
            <Link
              key={team.id}
              href={`/upload/${team.id}`}
              className="group relative"
            >
              <div className={`
                relative overflow-hidden rounded-2xl p-4
                bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md
                border-2 ${team.borderColor} border-opacity-30
                hover:border-opacity-100
                transform hover:scale-110 hover:-translate-y-2
                transition-all duration-500 ease-out
                shadow-xl hover:shadow-2xl
              `}
              style={{
                boxShadow: `0 10px 40px -10px ${team.color}20, 0 0 0 1px ${team.color}10`
              }}
              >
                {/* Enhanced gradient overlay with glow */}
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                  style={{ background: `radial-gradient(circle at center, ${team.color}40 0%, transparent 70%)` }}
                />

                {/* Animated border glow */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"
                  style={{ background: `linear-gradient(135deg, ${team.color}30 0%, transparent 100%)` }}
                />

                {/* Content */}
                <div className="relative z-10 flex flex-col items-center">
                  {/* Enhanced Team Number Circle with pulse */}
                  <div
                    className={`
                      w-14 h-14 rounded-full flex items-center justify-center mb-2
                      ${team.bgColor} bg-opacity-20
                      border-3 ${team.borderColor}
                      group-hover:scale-125 group-hover:rotate-12 transition-all duration-500
                      shadow-lg
                    `}
                    style={{
                      boxShadow: `0 0 20px ${team.color}40, inset 0 0 20px ${team.color}20`
                    }}
                  >
                    <span className="text-2xl font-bold group-hover:scale-110 transition-transform duration-300" style={{ color: team.color }}>
                      {team.id}
                    </span>
                  </div>

                  {/* Team Name with topic */}
                  <h3 className="text-base font-bold text-white mb-1">
                    {team.name}
                  </h3>
                  <p className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors line-clamp-2 px-2">
                    {team.topicName}
                  </p>

                  {/* Enhanced arrow indicator */}
                  <div className="mt-3 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                    <svg
                      className="w-5 h-5 text-slate-400 group-hover:text-white animate-bounce"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Enhanced Results Button with separator */}
        <div className="flex flex-col items-center gap-6">
          {/* Decorative separator */}
          <div className="flex items-center gap-4 w-full max-w-md">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-slate-700 to-slate-700" />
            <span className="text-xs text-slate-500 font-medium uppercase tracking-wider">Or</span>
            <div className="flex-1 h-px bg-gradient-to-l from-transparent via-slate-700 to-slate-700" />
          </div>

          <Link
            href="/results"
            className="group relative inline-flex items-center gap-3 px-10 py-4 bg-gradient-to-r from-cyan-600 via-teal-600 to-emerald-600 hover:from-cyan-500 hover:via-teal-500 hover:to-emerald-500 rounded-2xl font-bold text-lg text-white shadow-2xl hover:shadow-cyan-500/30 transform hover:scale-105 transition-all duration-300 overflow-hidden"
          >
            {/* Animated background shimmer */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />

            <LineChart className="w-6 h-6 relative z-10 group-hover:rotate-12 transition-transform duration-300" />
            <span className="relative z-10">View Results Dashboard</span>
            <svg
              className="w-6 h-6 relative z-10 transform group-hover:translate-x-2 transition-transform duration-300"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          {/* Helper text */}
          <p className="text-base text-slate-400 text-center max-w-md">
            View all teams&apos; analysis results in real-time
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
