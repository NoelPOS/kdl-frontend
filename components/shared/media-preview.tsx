"use client";

import { useState } from "react";
import { X, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";

interface MediaPreviewProps {
  images?: string[];
  videos?: string[];
  className?: string;
}

export default function MediaPreview({
  images = [],
  videos = [],
  className,
}: MediaPreviewProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video">("image");

  const allMedia = [...images.map((url) => ({ url, type: "image" as const })), ...videos.map((url) => ({ url, type: "video" as const }))];

  const openMedia = (index: number, type: "image" | "video") => {
    setSelectedIndex(index);
    setMediaType(type);
  };

  const closeMedia = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null && selectedIndex < allMedia.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    }
  };

  if (images.length === 0 && videos.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn("space-y-3", className)}>
        {/* Images Grid */}
        {images.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Images ({images.length})
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {images.map((url, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer rounded-lg overflow-hidden aspect-square border border-gray-200 hover:border-primary transition-colors"
                  onClick={() => openMedia(index, "image")}
                >
                  <Image
                    src={url}
                    alt={`Feedback image ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <ZoomIn className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Videos Grid */}
        {videos.length > 0 && (
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">
              Videos ({videos.length})
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {videos.map((url, index) => (
                <div
                  key={index}
                  className="relative group cursor-pointer rounded-lg overflow-hidden border border-gray-200 hover:border-primary transition-colors"
                  onClick={() => openMedia(images.length + index, "video")}
                >
                  <video
                    src={url}
                    className="w-full aspect-video object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                    <div className="bg-white/90 rounded-full p-3">
                      <svg
                        className="h-8 w-8 text-primary"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal for fullscreen view */}
      <Dialog open={selectedIndex !== null} onOpenChange={(open) => !open && closeMedia()}>
        <DialogContent className="max-w-5xl p-0">
          <div className="relative">
            {/* Close Button */}
            <button
              onClick={closeMedia}
              className="absolute top-4 right-4 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors"
            >
              <X className="h-6 w-6" />
            </button>

            {/* Navigation Buttons */}
            {allMedia.length > 1 && (
              <>
                <button
                  onClick={goToPrevious}
                  disabled={selectedIndex === 0}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
                <button
                  onClick={goToNext}
                  disabled={selectedIndex === allMedia.length - 1}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 bg-black/50 hover:bg-black/70 text-white rounded-full transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              </>
            )}

            {/* Media Display */}
            {selectedIndex !== null && allMedia[selectedIndex] && (
              <div className="bg-black flex items-center justify-center min-h-[400px] max-h-[80vh]">
                {allMedia[selectedIndex].type === "image" ? (
                  <div className="relative w-full h-[80vh]">
                    <Image
                      src={allMedia[selectedIndex].url}
                      alt={`Media ${selectedIndex + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <video
                    src={allMedia[selectedIndex].url}
                    controls
                    autoPlay
                    className="max-w-full max-h-[80vh]"
                  />
                )}
              </div>
            )}

            {/* Counter */}
            {allMedia.length > 1 && selectedIndex !== null && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full text-sm">
                {selectedIndex + 1} / {allMedia.length}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
