"use client";

import { ProcessingStep } from "@/types";
import { Loader2, CheckCircle2, XCircle, Circle } from "lucide-react";

interface ProcessingModalProps {
  isOpen: boolean;
  steps: ProcessingStep[];
  teamName: string;
}

export default function ProcessingModal({ isOpen, steps, teamName }: ProcessingModalProps) {
  if (!isOpen) return null;

  const currentStep = steps.find(s => s.status === "in-progress");
  const completedSteps = steps.filter(s => s.status === "completed").length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-cyan-600 to-teal-600 px-6 py-4">
          <h3 className="text-xl font-semibold text-white">
            Processing {teamName} Submission
          </h3>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Steps */}
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex items-center gap-3">
                {/* Icon */}
                {step.status === "completed" ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                ) : step.status === "in-progress" ? (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin flex-shrink-0" />
                ) : step.status === "error" ? (
                  <XCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                ) : (
                  <Circle className="w-5 h-5 text-slate-600 flex-shrink-0" />
                )}

                {/* Label */}
                <span
                  className={`text-sm ${
                    step.status === "completed"
                      ? "text-emerald-400"
                      : step.status === "in-progress"
                      ? "text-cyan-400 font-medium"
                      : step.status === "error"
                      ? "text-red-400"
                      : "text-slate-500"
                  }`}
                >
                  {step.label}
                </span>
              </div>
            ))}
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-slate-400">Progress</span>
              <span className="text-cyan-400 font-medium">{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-teal-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Current Step Info */}
          {currentStep && (
            <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
              <p className="text-sm text-cyan-300">
                {currentStep.label}...
              </p>
              <p className="text-xs text-slate-400 mt-1">
                This may take 2-4 minutes
              </p>
            </div>
          )}

          {/* Warning */}
          <p className="text-xs text-slate-500 text-center">
            Please don't close this window during processing
          </p>
        </div>
      </div>
    </div>
  );
}
