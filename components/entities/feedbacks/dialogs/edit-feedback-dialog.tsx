"use client";

import React, { useState, useEffect } from "react";
import { FeedbackItem } from "@/app/types/feedback.type";
import { showToast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, User, BookOpen, Calendar, X } from "lucide-react";
import Image from "next/image";
import FileUpload from "@/components/shared/file-upload";
import MediaPreview from "@/components/shared/media-preview";

interface EditFeedbackDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedback: FeedbackItem | null;
  onFeedbackUpdate: (updatedFeedback: FeedbackItem) => void;
}

export default function EditFeedbackDialog({
  open,
  onOpenChange,
  feedback,
  onFeedbackUpdate,
}: EditFeedbackDialogProps) {
  const [feedbackText, setFeedbackText] = useState("");
  const [originalFeedbackText, setOriginalFeedbackText] = useState("");
  const [mediaImages, setMediaImages] = useState<string[]>([]);
  const [mediaVideos, setMediaVideos] = useState<string[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (feedback && open) {
      const originalText = feedback.feedback || "";
      setFeedbackText(originalText);
      setOriginalFeedbackText(originalText);
      setMediaImages(feedback.feedbackImages || []);
      setMediaVideos(feedback.feedbackVideos || []);
      setNewFiles([]);
    }
  }, [feedback, open]);

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setFeedbackText("");
      setOriginalFeedbackText("");
      setMediaImages([]);
      setMediaVideos([]);
      setNewFiles([]);
      setIsSubmitting(false);
    }
  }, [open]);

  const handleFilesSelected = (files: File[]) => {
    setNewFiles(files);
  };

  const removeExistingImage = (index: number) => {
    setMediaImages(mediaImages.filter((_, i) => i !== index));
  };

  const removeExistingVideo = (index: number) => {
    setMediaVideos(mediaVideos.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!feedback || !feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      // Upload new files if any
      let newMediaUrls: string[] = [];
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => {
          formData.append("files", file);
        });

        // Verify FormData has files
        const hasFiles = Array.from(formData.entries()).length > 0;
        if (!hasFiles) {
          throw new Error("No files to upload");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload/feedback-media`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload error:", errorText);
          throw new Error(`Failed to upload files: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        newMediaUrls = data.urls;
      }

      // Combine existing media with new uploads
      const allMediaUrls = [...mediaImages, ...mediaVideos, ...newMediaUrls];
      const finalImages = allMediaUrls.filter(url => 
        /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
      );
      const finalVideos = allMediaUrls.filter(url => 
        /\.(mp4|webm|mov)$/i.test(url)
      );

      // Import the updateSchedule API function to update feedback and media
      const { updateSchedule } = await import("@/lib/api/schedules");

      // Call the API to update feedback field and media
      const updatedSchedule = await updateSchedule(parseInt(feedback.scheduleId), {
        feedback: feedbackText.trim(),
        feedbackImages: finalImages.length > 0 ? finalImages : undefined,
        feedbackVideos: finalVideos.length > 0 ? finalVideos : undefined,
      }) as any;

      // Update the feedback locally with the response from backend
      const updatedFeedback: FeedbackItem = {
        ...feedback,
        feedback: feedbackText.trim(),
        feedbackImages: finalImages,
        feedbackVideos: finalVideos,
        verifyFb: false, // Keep it unverified
        feedbackModifiedByName: updatedSchedule.feedbackModifiedByName || feedback.feedbackModifiedByName,
        feedbackModifiedAt: updatedSchedule.feedbackModifiedAt ? new Date(updatedSchedule.feedbackModifiedAt).toISOString() : feedback.feedbackModifiedAt,
      };

      onFeedbackUpdate(updatedFeedback);
      showToast.success("Feedback saved successfully!");
    } catch (error) {
      console.error("Error saving feedback:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save feedback. Please try again.";
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveAndVerify = async () => {
    if (!feedback || !feedbackText.trim()) return;

    setIsSubmitting(true);
    try {
      // Upload new files if any
      let newMediaUrls: string[] = [];
      if (newFiles.length > 0) {
        const formData = new FormData();
        newFiles.forEach((file) => {
          formData.append("files", file);
        });

        // Verify FormData has files
        const hasFiles = Array.from(formData.entries()).length > 0;
        if (!hasFiles) {
          throw new Error("No files to upload");
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/upload/feedback-media`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Upload error:", errorText);
          throw new Error(`Failed to upload files: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        newMediaUrls = data.urls;
      }

      // Combine existing media with new uploads
      const allMediaUrls = [...mediaImages, ...mediaVideos, ...newMediaUrls];
      const finalImages = allMediaUrls.filter(url => 
        /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
      );
      const finalVideos = allMediaUrls.filter(url => 
        /\.(mp4|webm|mov)$/i.test(url)
      );

      // Import the updateFeedback API function for verification
      const { updateFeedback } = await import("@/lib/api/feedbacks");

      // Call the API to update feedback and verify it
      const response = await updateFeedback(
        feedback.scheduleId,
        feedbackText.trim(),
        finalImages.length > 0 ? finalImages : undefined,
        finalVideos.length > 0 ? finalVideos : undefined
      );

      if (response.success) {
        // Since the feedback is now verified, create a verified feedback item
        const verifiedFeedback: FeedbackItem = {
          ...feedback,
          feedback: feedbackText.trim(),
          feedbackImages: finalImages,
          feedbackVideos: finalVideos,
          verifyFb: true, // This will trigger removal from the list
        };

        onFeedbackUpdate(verifiedFeedback);
        onOpenChange(false);
        showToast.success(
          response.message || "Feedback saved and verified successfully!"
        );
      } else {
        throw new Error(response.message || "Failed to verify feedback");
      }
    } catch (error) {
      console.error("Error saving and verifying feedback:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Failed to save and verify feedback. Please try again.";
      showToast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFeedbackText(originalFeedbackText);
    showToast.info("Feedback reset to original text");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Default form submit behavior can be handled by Save button
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStudentInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (!feedback) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Feedback
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 overflow-y-auto flex-1 pr-2">
          {/* Session Information */}
          <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            {/* Student Info */}
            <div className="flex items-center gap-3">
              {feedback.studentProfilePicture ? (
                <Image
                  src={feedback.studentProfilePicture}
                  alt={feedback.studentName}
                  width={40}
                  height={40}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 bg-orange-400 rounded-full flex items-center justify-center text-white font-medium text-sm">
                  {getStudentInitials(feedback.studentName)}
                </div>
              )}
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">
                  {feedback.studentName}
                  {feedback.studentNickname && (
                    <span className="text-gray-500 font-normal ml-1">
                      ({feedback.studentNickname})
                    </span>
                  )}
                </h3>
              </div>
            </div>

            {/* Session Details */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2 text-gray-700">
                <BookOpen className="h-4 w-4" />
                <span className="font-medium">{feedback.courseTitle}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(feedback.sessionDate)}</span>
              </div>
            </div>

            {/* Feedback Modification Info */}
            <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
              {feedback.feedbackModifiedAt ? (
                <div>
                  <span className="font-medium">Last modified:</span> {formatDate(feedback.feedbackModifiedAt)} by{' '}
                  <span className="font-medium">{feedback.feedbackModifiedByName}</span>
                </div>
              ) : (
                <div>
                  <span className="font-medium">Originally written:</span> {formatDate(feedback.feedbackDate)} by{' '}
                  <span className="font-medium">{feedback.teacherName}</span>
                </div>
              )}
            </div>
          </div>

          {/* Editable Feedback */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback Text</Label>
              <Textarea
                id="feedback"
                placeholder="Edit feedback about the student"
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                rows={6}
                className="resize-none border-yellow-300 focus:border-yellow-500"
                maxLength={1000}
                required
              />
            </div>

            {/* Existing Media */}
            {(mediaImages.length > 0 || mediaVideos.length > 0) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Current Attachments</Label>
                  <p className="text-xs text-gray-500">Click on media to view</p>
                </div>
                
                {/* Media Preview with Remove Buttons */}
                <div className="relative">
                  <MediaPreview 
                    images={mediaImages}
                    videos={mediaVideos}
                  />
                  
                  {/* Remove buttons overlay */}
                  <div className="mt-2 space-y-2">
                    {mediaImages.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Remove images:</p>
                        <div className="flex flex-wrap gap-2">
                          {mediaImages.map((url, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                            >
                              <span className="max-w-[150px] truncate" title={url}>
                                Image {index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeExistingImage(index)}
                                disabled={isSubmitting}
                                className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {mediaVideos.length > 0 && (
                      <div>
                        <p className="text-xs font-medium text-gray-700 mb-1">Remove videos:</p>
                        <div className="flex flex-wrap gap-2">
                          {mediaVideos.map((url, index) => (
                            <Badge
                              key={index}
                              variant="secondary"
                              className="bg-blue-100 text-blue-800 cursor-pointer hover:bg-blue-200"
                            >
                              <span className="max-w-[150px] truncate" title={url}>
                                Video {index + 1}
                              </span>
                              <button
                                type="button"
                                onClick={() => removeExistingVideo(index)}
                                disabled={isSubmitting}
                                className="ml-2 text-red-600 hover:text-red-800 disabled:opacity-50"
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Add New Media */}
            <div className="space-y-2">
              <Label>Add New Attachments (Optional)</Label>
              <p className="text-xs text-gray-500">
                Files will be uploaded when you save
              </p>
              <FileUpload
                onFilesSelected={handleFilesSelected}
                accept="image/*,video/*"
                maxFiles={10}
                maxSizeMB={50}
                disabled={isSubmitting}
                existingFilesCount={mediaImages.length + mediaVideos.length}
              />
            </div>
          </div>
        </form>

        <DialogFooter className="flex-shrink-0">
          <div className="flex justify-between w-full">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting || feedbackText === originalFeedbackText}
              className="border-gray-300"
            >
              Reset
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleSave}
                disabled={isSubmitting || !feedbackText.trim()}
                className="border-yellow-300 text-yellow-600 hover:bg-yellow-50"
              >
                {isSubmitting ? "Saving..." : "Save"}
              </Button>

              <Button
                type="button"
                onClick={handleSaveAndVerify}
                disabled={isSubmitting || !feedbackText.trim()}
                className="bg-yellow-600 hover:bg-yellow-700"
              >
                {isSubmitting ? "Processing..." : "Save & Approve"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
