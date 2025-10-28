"use client";

import { useEffect, useRef, useState } from "react";
import { TeamResult } from "@/types";
import { TEAMS } from "@/lib/constants";
import { X, Play, Pause, Volume2, VolumeX } from "lucide-react";

interface AudioPlayerModalProps {
  result: TeamResult | null;
  onClose: () => void;
}

export default function AudioPlayerModal({ result, onClose }: AudioPlayerModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const team = result ? TEAMS.find((t) => t.id === result.teamId) : null;

  // Auto-play audio when modal opens
  useEffect(() => {
    if (result?.criticismAudioUrl && audioRef.current) {
      audioRef.current.play().catch(console.error);
      setIsPlaying(true);
    }
  }, [result?.criticismAudioUrl]);

  // Update time as audio plays
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  if (!result || !result.criticismAudioUrl || !team) return null;

  const togglePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(console.error);
    }
    setIsPlaying(!isPlaying);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newTime = parseFloat(e.target.value);
    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const newVolume = parseFloat(e.target.value);
    audio.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isMuted) {
      audio.volume = volume || 0.5;
      setIsMuted(false);
    } else {
      audio.volume = 0;
      setIsMuted(true);
    }
  };

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      {/* Background Video - Looping */}
      <video
        ref={videoRef}
        className="absolute inset-0 w-full h-full object-cover"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/dramr.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Content */}
      <div className="relative z-10 w-full max-w-3xl px-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute -top-16 right-0 p-3 bg-white/10 hover:bg-white/20 rounded-full transition-colors backdrop-blur-md"
          aria-label="Close"
        >
          <X className="w-6 h-6 text-white" />
        </button>

        {/* Title Card */}
        <div
          className="mb-8 p-6 rounded-2xl backdrop-blur-md bg-black/60 border-2"
          style={{ borderColor: team.color }}
        >
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center border-3"
              style={{ backgroundColor: `${team.color}20`, borderColor: team.color }}
            >
              <span className="text-2xl font-bold" style={{ color: team.color }}>
                {team.id}
              </span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{team.name}</h2>
              <p className="text-xl text-gray-300 mt-1">Dr Amr's Critical Analysis</p>
            </div>
          </div>
        </div>

        {/* Audio Player Controls */}
        <div className="p-8 rounded-2xl backdrop-blur-md bg-black/60 border border-white/20">
          {/* Hidden Audio Element */}
          <audio ref={audioRef} src={result.criticismAudioUrl} preload="auto" />

          {/* Progress Bar */}
          <div className="mb-6">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
              style={{
                background: `linear-gradient(to right, ${team.color} 0%, ${team.color} ${
                  (currentTime / (duration || 1)) * 100
                }%, #374151 ${(currentTime / (duration || 1)) * 100}%, #374151 100%)`,
              }}
            />
            <div className="flex justify-between mt-2 text-sm text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between">
            {/* Play/Pause Button */}
            <button
              onClick={togglePlayPause}
              className="p-4 rounded-full transition-all hover:scale-110"
              style={{ backgroundColor: team.color }}
              aria-label={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <Pause className="w-8 h-8 text-white fill-white" />
              ) : (
                <Play className="w-8 h-8 text-white fill-white" />
              )}
            </button>

            {/* Volume Controls */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleMute}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label={isMuted ? "Unmute" : "Mute"}
              >
                {isMuted ? (
                  <VolumeX className="w-5 h-5 text-white" />
                ) : (
                  <Volume2 className="w-5 h-5 text-white" />
                )}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="w-24 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                aria-label="Volume"
              />
            </div>
          </div>

          {/* Info Text */}
          <div className="mt-6 text-center text-sm text-gray-400">
            Professional analysis narrated by AI voice
          </div>
        </div>
      </div>

      {/* Custom Slider Styles */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: white;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
}
