"use client";

import { useEffect, useRef, useState } from "react";
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

  // State to track which text segment to display (0 = none, 1 = first third, 2 = two thirds, 3 = all)
  const [displayedSegments, setDisplayedSegments] = useState(0);

  const team = result ? TEAMS.find((t) => t.id === result.teamId) : null;

  // Split criticism into 3 equal parts based on word count
  const getCriticismSegments = () => {
    if (!result?.criticism) return { part1: "", part2: "", part3: "" };

    const words = result.criticism.split(" ");
    const wordsPerSegment = Math.ceil(words.length / 3);

    const part1Words = words.slice(0, wordsPerSegment);
    const part2Words = words.slice(wordsPerSegment, wordsPerSegment * 2);
    const part3Words = words.slice(wordsPerSegment * 2);

    return {
      part1: part1Words.join(" "),
      part2: part2Words.join(" "),
      part3: part3Words.join(" "),
    };
  };

  const segments = getCriticismSegments();

  // Get displayed text based on current segment (replace mode - only one segment at a time)
  const getDisplayedText = () => {
    if (displayedSegments === 0) return "";
    if (displayedSegments === 1) return segments.part1;
    if (displayedSegments === 2) return segments.part2;
    return segments.part3;
  };

  // Auto-play audio when modal opens
  useEffect(() => {
    if (result?.criticismAudioUrl && audioRef.current) {
      audioRef.current.play().catch(console.error);
    }
  }, [result?.criticismAudioUrl]);

  // Progressive text display: Sync with audio playback time
  useEffect(() => {
    if (!result?.criticism || !audioRef.current) return;

    // Reset segments when modal opens
    setDisplayedSegments(0);

    const audio = audioRef.current;

    // Update displayed segment based on audio playback time
    const handleTimeUpdate = () => {
      const currentTime = audio.currentTime;
      const duration = audio.duration;

      // Wait until duration is available
      if (!duration || isNaN(duration)) return;

      // Calculate segment thresholds (divide audio into 3 equal parts)
      const segmentDuration = duration / 3;

      if (currentTime < segmentDuration) {
        setDisplayedSegments(1); // First third
      } else if (currentTime < segmentDuration * 2) {
        setDisplayedSegments(2); // Second third
      } else {
        setDisplayedSegments(3); // Final third
      }
    };

    // Listen to audio time updates
    audio.addEventListener("timeupdate", handleTimeUpdate);

    // Also handle when metadata loads (duration becomes available)
    audio.addEventListener("loadedmetadata", handleTimeUpdate);

    // Cleanup listeners on unmount
    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleTimeUpdate);
    };
  }, [result?.criticism]);

  // Stop video when audio finishes
  const handleAudioEnded = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

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
            className="w-full h-full object-contain"
            autoPlay
            muted
            playsInline
            preload="auto"
            loop
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
          <audio
            ref={audioRef}
            src={result.criticismAudioUrl}
            preload="auto"
            onEnded={handleAudioEnded}
          />

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
              {getDisplayedText()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
