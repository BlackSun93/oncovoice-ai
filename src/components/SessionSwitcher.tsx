"use client";

import { BREAKOUT_SESSIONS } from "@/lib/constants";

interface SessionSwitcherProps {
  selectedSession: number;
  onSessionChange: (sessionId: number) => void;
}

export default function SessionSwitcher({
  selectedSession,
  onSessionChange,
}: SessionSwitcherProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-slate-400 mr-2">Filter by Session:</span>
      <div className="flex gap-2">
        {BREAKOUT_SESSIONS.map((session) => (
          <button
            key={session.id}
            onClick={() => onSessionChange(session.id)}
            className={`
              px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200
              ${
                selectedSession === session.id
                  ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
                  : "bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700"
              }
            `}
          >
            Session {session.id}
          </button>
        ))}
      </div>
    </div>
  );
}
