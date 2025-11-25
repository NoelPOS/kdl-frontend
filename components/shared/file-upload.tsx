"use client";

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
  disabled?: boolean;
  existingFilesCount?: number;
}

export default function FileUpload({
  onFilesSelected,
  accept = "image/*,video/*",
  maxFiles = 10,
  maxSizeMB = 50,
  className,
  disabled = false,
  existingFilesCount = 0,
}: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (newFiles: FileList | null) => {
    if (!newFiles || disabled) return;

    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    Array.from(newFiles).forEach((file) => {
      // Check file size
      const fileSizeMB = file.size / 1024 / 1024;
      if (fileSizeMB > maxSizeMB) {
        alert(`${file.name} exceeds ${maxSizeMB}MB limit`);
        return;
      }

      // Check total files including existing
      if (files.length + validFiles.length + existingFilesCount >= maxFiles) {
        alert(`Maximum ${maxFiles} files allowed`);
        return;
      }

      validFiles.push(file);

      // Create preview for images and videos
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string);
          if (newPreviews.length === validFiles.length) {
            setPreviews([...previews, ...newPreviews]);
          }
        };
        reader.readAsDataURL(file);
      } else if (file.type.startsWith("video/")) {
        newPreviews.push(""); // Placeholder for video
        if (newPreviews.length === validFiles.length) {
          setPreviews([...previews, ...newPreviews]);
        }
      }
    });

    if (validFiles.length > 0) {
      const newFiles = [...files, ...validFiles];
      setFiles(newFiles);
      onFilesSelected(newFiles);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFiles(e.dataTransfer.files);
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(previews.filter((_, i) => i !== index));
    onFilesSelected(newFiles);
  };



  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop Zone */}
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-gray-300 hover:border-gray-400",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={accept}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          disabled={disabled}
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <p className="text-sm text-gray-600 mb-2">
          Drag and drop files here, or click to select
        </p>
        <p className="text-xs text-gray-500 mb-4">
          Max {maxFiles} files, {maxSizeMB}MB each
        </p>
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || files.length >= maxFiles}
        >
          Select Files
        </Button>
      </div>

      {/* Preview Grid */}
      {files.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div
                key={index}
                className="relative group border rounded-lg overflow-hidden aspect-square"
              >
                {/* Preview */}
                {file.type.startsWith("image/") ? (
                  <Image
                    src={previews[index]}
                    alt={file.name}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <Video className="h-12 w-12 text-gray-400" />
                  </div>
                )}

                {/* Remove Button */}
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </button>

                {/* File Info */}
                <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 text-xs truncate">
                  {file.name}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
