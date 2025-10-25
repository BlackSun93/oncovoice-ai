"use client";

import { TeamResult } from "@/types";
import { TEAMS, MAX_PREVIEW_LENGTH } from "@/lib/constants";
import { FileText, Target, Lightbulb, Loader2, AlertCircle } from "lucide-react";

interface TeamResultCardProps {
  result: TeamResult | null;
  onViewFull?: () => void;
}

export default function TeamResultCard({ result, onViewFull }: TeamResultCardProps) {
  const team = TEAMS.find((t) => t.id === result?.teamId);

  if (!team) return null;

  // Loading state
  if (!result || result.status === "idle") {
    return (
      <div className={`rounded-xl border-2 ${team.borderColor} border-opacity-30 bg-slate-800/30 p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${team.bgColor} bg-opacity-20 border-2 ${team.borderColor}`}
          >
            <span className="text-xl font-bold" style={{ color: team.color }}>
              {team.id}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white">{team.name}</h3>
        </div>

        <div className="text-center py-12">
          <p className="text-slate-500">Waiting for submission...</p>
        </div>
      </div>
    );
  }

  // Processing state
  if (["uploading", "transcribing", "extracting_pdf", "analyzing"].includes(result.status)) {
    return (
      <div className={`rounded-xl border-2 ${team.borderColor} border-opacity-50 bg-slate-800/50 p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${team.bgColor} bg-opacity-20 border-2 ${team.borderColor}`}
          >
            <span className="text-xl font-bold" style={{ color: team.color }}>
              {team.id}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white">{team.name}</h3>
        </div>

        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
          <p className="text-cyan-400 font-medium">Processing...</p>
          <p className="text-sm text-slate-500 mt-1">
            {result.status === "uploading" && "Uploading files"}
            {result.status === "transcribing" && "Transcribing audio"}
            {result.status === "extracting_pdf" && "Extracting PDF"}
            {result.status === "analyzing" && "Analyzing content"}
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (result.status === "error") {
    return (
      <div className={`rounded-xl border-2 border-red-500/50 bg-red-500/10 p-6`}>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${team.bgColor} bg-opacity-20 border-2 ${team.borderColor}`}
          >
            <span className="text-xl font-bold" style={{ color: team.color }}>
              {team.id}
            </span>
          </div>
          <h3 className="text-xl font-semibold text-white">{team.name}</h3>
        </div>

        <div className="text-center py-12">
          <AlertCircle className="w-8 h-8 text-red-400 mx-auto mb-3" />
          <p className="text-red-400 font-medium">Processing Failed</p>
          <p className="text-sm text-slate-400 mt-1">{result.error || "Please try again"}</p>
        </div>
      </div>
    );
  }

  // Completed state
  const truncate = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  return (
    <div className={`rounded-xl border-2 ${team.borderColor} border-opacity-50 bg-slate-800/50 p-6 hover:border-opacity-100 transition-all duration-300`}>
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center ${team.bgColor} bg-opacity-20 border-2 ${team.borderColor}`}
        >
          <span className="text-xl font-bold" style={{ color: team.color }}>
            {team.id}
          </span>
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{team.name}</h3>
          <p className="text-xs text-slate-400">{new Date(result.createdAt).toLocaleString()}</p>
        </div>
      </div>

      {/* Content Preview */}
      <div className="space-y-4">
        {/* Summary */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <FileText className="w-4 h-4 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-300">Summary</h4>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {truncate(result.summary, MAX_PREVIEW_LENGTH)}
          </p>
        </div>

        {/* Conclusion */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Target className="w-4 h-4 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-300">Conclusion</h4>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {truncate(result.conclusion, MAX_PREVIEW_LENGTH)}
          </p>
        </div>

        {/* Criticism */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Lightbulb className="w-4 h-4 text-slate-400" />
            <h4 className="text-sm font-semibold text-slate-300">Critical Analysis</h4>
          </div>
          <p className="text-sm text-slate-400 leading-relaxed">
            {truncate(result.criticism, MAX_PREVIEW_LENGTH)}
          </p>
        </div>
      </div>

      {/* View Full Button */}
      {onViewFull && (
        <button
          onClick={onViewFull}
          className={`mt-6 w-full py-2 px-4 rounded-lg border-2 ${team.borderColor} ${team.hoverColor} bg-opacity-10 font-medium transition-all duration-300`}
          style={{ color: team.color }}
        >
          View Full Analysis
        </button>
      )}
    </div>
  );
}
