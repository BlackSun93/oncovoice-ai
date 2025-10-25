"use client";

import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Upload, FileAudio, File, CheckCircle2, XCircle } from "lucide-react";

interface FileUploadZoneProps {
  file: File | null;
  onFileSelect: (file: File) => void;
  accept: Record<string, string[]>;
  maxSize: number;
  label: string;
  icon: "audio" | "pdf";
  error?: string;
}

export default function FileUploadZone({
  file,
  onFileSelect,
  accept,
  maxSize,
  label,
  icon,
  error,
}: FileUploadZoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        onFileSelect(acceptedFiles[0]);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + " " + sizes[i];
  };

  const hasError = error || fileRejections.length > 0;

  return (
    <div>
      <div
        {...getRootProps()}
        className={`
          relative border-2 border-dashed rounded-xl p-8 cursor-pointer
          transition-all duration-300
          ${isDragActive
            ? "border-cyan-400 bg-cyan-500/10 scale-[1.02]"
            : hasError
            ? "border-red-500/50 bg-red-500/5"
            : file
            ? "border-emerald-500/50 bg-emerald-500/5"
            : "border-slate-700 hover:border-slate-600 bg-slate-800/30"
          }
        `}
      >
        <input {...getInputProps()} />

        <div className="flex flex-col items-center text-center">
          {/* Icon */}
          {file ? (
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-4" />
          ) : hasError ? (
            <XCircle className="w-12 h-12 text-red-400 mb-4" />
          ) : icon === "audio" ? (
            <FileAudio className={`w-12 h-12 mb-4 ${isDragActive ? "text-cyan-400" : "text-slate-400"}`} />
          ) : (
            <File className={`w-12 h-12 mb-4 ${isDragActive ? "text-cyan-400" : "text-slate-400"}`} />
          )}

          {/* Label */}
          <h3 className="text-lg font-semibold text-white mb-2">{label}</h3>

          {/* Status */}
          {file ? (
            <div className="space-y-2">
              <p className="text-emerald-400 font-medium">{file.name}</p>
              <p className="text-sm text-slate-400">{formatFileSize(file.size)}</p>
            </div>
          ) : isDragActive ? (
            <p className="text-cyan-400">Drop file here...</p>
          ) : (
            <div className="space-y-1">
              <p className="text-slate-400">Drag and drop or click to browse</p>
              <p className="text-xs text-slate-500">Max size: {maxSize / (1024 * 1024)}MB</p>
            </div>
          )}
        </div>

        {/* Upload icon overlay when dragging */}
        {isDragActive && (
          <div className="absolute inset-0 flex items-center justify-center bg-cyan-500/10 rounded-xl">
            <Upload className="w-16 h-16 text-cyan-400 animate-pulse" />
          </div>
        )}
      </div>

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {error}
        </p>
      )}

      {fileRejections.length > 0 && !error && (
        <p className="mt-2 text-sm text-red-400 flex items-center gap-2">
          <XCircle className="w-4 h-4" />
          {fileRejections[0].errors[0].message}
        </p>
      )}
    </div>
  );
}
