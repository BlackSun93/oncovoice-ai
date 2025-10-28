"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Upload as UploadIcon } from "lucide-react";
import { upload } from "@vercel/blob/client";
import { TEAMS, SUPPORTED_AUDIO_TYPES, MAX_AUDIO_SIZE_BYTES, ERROR_MESSAGES } from "@/lib/constants";
import { ProcessingStep } from "@/types";
import FileUploadZone from "@/components/FileUploadZone";
import ProcessingModal from "@/components/ProcessingModal";

interface UploadPageProps {
  params: Promise<{ team: string }>;
}

export default function UploadPage({ params }: UploadPageProps) {
  const resolvedParams = use(params);
  const router = useRouter();
  const teamId = parseInt(resolvedParams.team);
  const team = TEAMS.find((t) => t.id === teamId);

  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [audioError, setAudioError] = useState<string>("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [steps, setSteps] = useState<ProcessingStep[]>([
    { id: "upload", label: "Uploading audio file", status: "pending" },
    { id: "transcribe", label: "Transcribing audio", status: "pending" },
    { id: "analyze", label: "Analyzing with AI", status: "pending" },
  ]);

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Team not found</h1>
          <Link href="/" className="text-cyan-400 hover:text-cyan-300">
            Go back to home
          </Link>
        </div>
      </div>
    );
  }

  const handleAudioSelect = (file: File) => {
    setAudioError("");
    if (file.size > MAX_AUDIO_SIZE_BYTES) {
      setAudioError(ERROR_MESSAGES.AUDIO_TOO_LARGE);
      return;
    }
    if (!SUPPORTED_AUDIO_TYPES.includes(file.type)) {
      setAudioError(ERROR_MESSAGES.INVALID_AUDIO_TYPE);
      return;
    }
    setAudioFile(file);
  };

  const updateStepStatus = (stepId: string, status: ProcessingStep["status"]) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === stepId ? { ...step, status } : step
      )
    );
  };

  const handleSubmit = async () => {
    if (!audioFile) return;

    setIsProcessing(true);

    try {
      // Step 1: Upload audio file to Blob (client-side)
      updateStepStatus("upload", "in-progress");

      console.log("Uploading audio file directly to Blob:", {
        audioName: audioFile.name,
        audioType: audioFile.type,
        audioSize: audioFile.size,
        teamId: teamId,
      });

      // Upload audio file directly to Vercel Blob
      const audioTimestamp = Date.now();
      const audioExtension = audioFile.name.split(".").pop();
      const audioFilename = `team-${teamId}-audio-${audioTimestamp}.${audioExtension}`;

      console.log("Uploading audio to Blob:", audioFilename);
      const audioBlob = await upload(audioFilename, audioFile, {
        access: "public",
        handleUploadUrl: "/api/blob/upload",
      });
      console.log("Audio uploaded to Blob:", audioBlob.url);

      const audioUrl = audioBlob.url;
      const audioContentType = audioFile.type;
      const audioFileName = audioFilename;

      console.log("Upload successful:", { audioUrl, audioContentType, audioFileName, teamId });
      updateStepStatus("upload", "completed");

      // Step 2: Transcribe audio
      updateStepStatus("transcribe", "in-progress");
      console.log("Starting transcription:", { audioUrl, contentType: audioContentType, fileName: audioFileName });

      const transcribeRes = await fetch("/api/transcribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          audioUrl,
          contentType: audioContentType,
          fileName: audioFileName
        }),
      });

      if (!transcribeRes.ok) {
        let errorMessage = "Transcription failed";
        try {
          const errorData = await transcribeRes.json();
          console.error("Transcription failed:", errorData);
          errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch (parseError) {
          // If JSON parsing fails, get the raw text
          const errorText = await transcribeRes.text();
          console.error("Transcription failed (non-JSON response):", errorText);
          errorMessage = errorText || `Transcription failed with status ${transcribeRes.status}`;
        }
        throw new Error(errorMessage);
      }

      const { transcript } = await transcribeRes.json();
      console.log("Transcription successful:", transcript.substring(0, 100) + "...");
      updateStepStatus("transcribe", "completed");

      // Step 3: Analyze with AI (PDF is automatically loaded from team mapping)
      updateStepStatus("analyze", "in-progress");

      console.log("Starting analysis with AI (PDF will be loaded automatically for team)...");
      const analyzeRes = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          teamId,
          transcript,
        }),
      });

      if (!analyzeRes.ok) {
        console.error("Analysis request failed with status:", analyzeRes.status, analyzeRes.statusText);
        let errorMessage = "Analysis failed";

        // Get response body text first (can only read once)
        const responseText = await analyzeRes.text();
        console.error("Raw error response:", responseText);

        // Try to parse as JSON
        try {
          const errorData = JSON.parse(responseText);
          console.error("Parsed error data:", errorData);
          errorMessage = errorData.error || errorData.message || JSON.stringify(errorData);
        } catch (parseError) {
          console.error("Could not parse error as JSON, using raw text");
          errorMessage = responseText || `Analysis failed with status ${analyzeRes.status}`;
        }

        throw new Error(errorMessage);
      }

      const analysisResult = await analyzeRes.json();
      console.log("Analysis response received:", analysisResult);

      // Analysis has started successfully (processing in background)
      updateStepStatus("analyze", "completed");

      // Success! Redirect to results dashboard with processing flag
      // The analysis will continue in the background
      setTimeout(() => {
        router.push(`/results?processing=true&team=${teamId}`);
      }, 1000);
    } catch (error) {
      console.error("Processing error:", error);
      const currentStep = steps.find((s) => s.status === "in-progress");
      if (currentStep) {
        updateStepStatus(currentStep.id, "error");
      }

      // Display detailed error message
      const errorMessage = error instanceof Error
        ? error.message
        : "An unknown error occurred during processing";

      alert(`Error: ${errorMessage}\n\nPlease check the console for more details and try again.`);
      setIsProcessing(false);
    }
  };

  const canSubmit = audioFile && !audioError && !isProcessing;

  return (
    <>
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to team selection
            </Link>

            <div className="flex items-center gap-4">
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center ${team.bgColor} bg-opacity-20 border-3 ${team.borderColor}`}
              >
                <span className="text-2xl font-bold" style={{ color: team.color }}>
                  {team.id}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">{team.name}</h1>
                <p className="text-lg text-slate-300 mt-1">{team.topicName}</p>
                <p className="text-sm text-slate-400 mt-2">Upload your recording for AI analysis</p>
              </div>
            </div>
          </div>

          {/* Upload Zone */}
          <div className="mb-8">
            <FileUploadZone
              file={audioFile}
              onFileSelect={handleAudioSelect}
              accept={{ "audio/*": [".mp3", ".m4a", ".wav", ".webm"] }}
              maxSize={MAX_AUDIO_SIZE_BYTES}
              label="Upload Audio Recording"
              icon="audio"
              error={audioError}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`
              w-full py-4 px-6 rounded-xl font-semibold text-white
              flex items-center justify-center gap-3
              transition-all duration-300
              ${canSubmit
                ? `${team.bgColor} ${team.hoverColor} shadow-lg hover:shadow-xl transform hover:scale-[1.02]`
                : "bg-slate-700 cursor-not-allowed opacity-50"
              }
            `}
          >
            <UploadIcon className="w-5 h-5" />
            {isProcessing ? "Processing..." : "Start Analysis"}
          </button>

          {/* Info */}
          <div className="mt-6 p-4 bg-slate-800/50 rounded-lg border border-slate-700">
            <h3 className="text-sm font-semibold text-white mb-2">Processing Information</h3>
            <ul className="text-sm text-slate-400 space-y-1">
              <li>• Audio will be transcribed using AI (2-3 minutes)</li>
              <li>• Content will be analyzed and compared with the scientific source for this topic</li>
              <li>• You'll receive a summary, conclusion, and critical analysis</li>
              <li>• Total processing time: approximately 3-5 minutes</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Processing Modal */}
      <ProcessingModal
        isOpen={isProcessing}
        steps={steps}
        teamName={team.name}
      />
    </>
  );
}
