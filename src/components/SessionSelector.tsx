"use client";

import { BREAKOUT_SESSIONS } from "@/lib/constants";
import { Users, ChevronRight } from "lucide-react";

interface SessionSelectorProps {
  onSelectSession: (sessionId: number) => void;
}

export default function SessionSelector({ onSelectSession }: SessionSelectorProps) {
  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-cyan-500/20 to-teal-500/20 rounded-2xl mb-4 shadow-lg shadow-cyan-500/10 border border-cyan-500/20">
            <Users className="w-8 h-8 text-cyan-400" />
          </div>

          <h2 className="text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-cyan-300 via-teal-300 to-emerald-300 bg-clip-text text-transparent">
            Select Your Breakout Session
          </h2>

          <p className="text-lg text-slate-300">
            Choose the session you're participating in to continue
          </p>

          <div className="flex justify-center gap-2 mt-4">
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-cyan-500 to-transparent rounded-full" />
            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-teal-500 to-transparent rounded-full" />
          </div>
        </div>

        {/* Session Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BREAKOUT_SESSIONS.map((session) => (
            <button
              key={session.id}
              onClick={() => onSelectSession(session.id)}
              className="group relative overflow-hidden rounded-2xl p-6 bg-gradient-to-br from-slate-800/60 to-slate-900/60 backdrop-blur-md border-2 border-slate-700 hover:border-cyan-500 transform hover:scale-105 hover:-translate-y-1 transition-all duration-300 shadow-xl hover:shadow-2xl hover:shadow-cyan-500/20"
            >
              {/* Gradient overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 bg-gradient-to-br from-cyan-500 to-teal-500" />

              {/* Content */}
              <div className="relative z-10">
                {/* Session Number */}
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-cyan-500/20 border-2 border-cyan-500 mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                  <span className="text-3xl font-bold text-cyan-400">{session.id}</span>
                </div>

                {/* Session Name */}
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
                  {session.name}
                </h3>

                {/* Arrow Indicator */}
                <div className="flex items-center justify-center opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                  <ChevronRight className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Info */}
        <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
          <p className="text-sm text-slate-400 text-center">
            Your session selection will be saved for this browser session
          </p>
        </div>
      </div>
    </div>
  );
}
