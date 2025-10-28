"use client";

import { useEffect, useRef } from "react";
import { TeamResult } from "@/types";
import { TEAMS } from "@/lib/constants";
import { X } from "lucide-react";

interface AudioPlayerModalProps {
  result: TeamResult | null;
  onClose: () => void;
}

export default function AudioPlayerModal({ result, onClose }: AudioPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const team = result ? TEAMS.find((t) => t.id === result.teamId) : null;

  // Auto-play audio when modal opens
  useEffect(() => {
    if (result?.criticismAudioUrl && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [result?.criticismAudioUrl]);

  if (!result || !result.criticismAudioUrl || !team) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      {/* Modal Container - Popup Style */}
      <div className="relative w-full max-w-4xl max-h-[90vh] mx-6 bg-slate-900 rounded-3xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-black/50 hover:bg-black/70 rounded-full transition-colors backdrop-blur-md"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Video Container */}
        <div className="relative w-full aspect-video bg-black">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          >
            <source src="/dramr1.mp4" type="video/mp4" />
          </video>

          {/* Team Badge Overlay on Video */}
          <div className="absolute top-4 left-4 flex items-center gap-3 px-4 py-2 bg-black/70 backdrop-blur-md rounded-full">
            <div
              className="w-10 h-10 rounded-full flex items-center justify-center border-2"
              style={{ backgroundColor: `${team.color}20`, borderColor: team.color }}
            >
              <span className="text-lg font-bold" style={{ color: team.color }}>
                {team.id}
              </span>
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">{team.name}</h3>
              <p className="text-xs text-gray-300">Dr Amr's Analysis</p>
            </div>
          </div>
        </div>

        {/* Content Below Video */}
        <div className="relative overflow-y-auto max-h-[40vh]">
          {/* Hidden Audio Element - Auto-plays without controls */}
          <audio ref={audioRef} src={result.criticismAudioUrl} preload="auto" />

          {/* Criticism Text - Subtitles Style */}
          <div
            className="px-8 py-6 border-t-4"
            style={{ borderColor: team.color }}
          >
            <h4 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: team.color }}></span>
              Critical Analysis
            </h4>
            <p className="text-base text-gray-300 leading-relaxed">
              {result.criticism}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
