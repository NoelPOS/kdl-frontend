"use client";

import React, { useState, useEffect } from "react";
import { FormData } from "@/app/types/schedule.type";
import { useUpdateSchedule } from "@/hooks/mutation/use-schedule-mutations";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MessageSquare,
  Image as ImageIcon,
} from "lucide-react";
import FileUpload from "@/components/shared/file-upload";
import MediaPreview from "@/components/shared/media-preview";

interface TeacherEditScheduleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: FormData;
  onScheduleUpdate: (schedule: FormData) => void;
}

export default function TeacherEditScheduleDialog({
  open,
  onOpenChange,
  initialData,
  onScheduleUpdate,
}: TeacherEditScheduleProps) {
  const [formData, setFormData] = useState<FormData>({
    scheduleId: 0,
    date: "",
    starttime: "",
    endtime: "",
    course: "",
    teacher: "",
    student: "",
    room: "",
    nickname: "",
    remark: "",
    status: "",
    courseId: 0,
    studentId: 0,
    warning: "",
  });

  const [feedback, setFeedback] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [hasPreviousFeedback, setHasPreviousFeedback] = useState(false);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [existingVideos, setExistingVideos] = useState<string[]>([]);

  const { mutate: updateSchedule, isPending } = useUpdateSchedule();
  const isSubmitting = isUploading || isPending;

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      const existingFeedback = initialData.feedback || "";
      setFeedback(existingFeedback);
      setHasPreviousFeedback(!!existingFeedback.trim());
      setExistingImages(initialData.feedbackImages || []);
      setExistingVideos(initialData.feedbackVideos || []);
    }
  }, [initialData]);

  useEffect(() => {
    if (!open) {
      setFormData({
        scheduleId: 0,
        date: "",
        starttime: "",
        endtime: "",
        course: "",
        teacher: "",
        student: "",
        room: "",
        nickname: "",
        remark: "",
        status: "",
        courseId: 0,
        studentId: 0,
        warning: "",
      });
      setFeedback("");
      setSelectedFiles([]);
      setIsUploading(false);
      setHasPreviousFeedback(false);
      setExistingImages([]);
      setExistingVideos([]);
    }
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.scheduleId) return;

    let mediaUrls: string[] = [];
    if (!hasPreviousFeedback && selectedFiles.length > 0) {
      setIsUploading(true);
      try {
        const uploadPromises = selectedFiles.map(async (file) => {
          const getUrlRes = await fetch(
            `/api/s3-upload-url?fileName=${encodeURIComponent(
              file.name
            )}&fileType=${encodeURIComponent(file.type)}&folder=feedback`
          );
          if (!getUrlRes.ok) {
            throw new Error(`Failed to get upload URL for ${file.name}`);
          }
          const { url, publicUrl } = await getUrlRes.json();

          const uploadRes = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          return publicUrl;
        });
        mediaUrls = await Promise.all(uploadPromises);
      } catch (error) {
        console.error("Error uploading files:", error);
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
    }

    const images = mediaUrls.filter((url) =>
      /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
    );
    const videos = mediaUrls.filter((url) =>
      /\.(mp4|webm|mov)$/i.test(url)
    );

    const updateData: {
      attendance: string;
      feedback?: string;
      feedbackDate?: string;
      feedbackImages?: string[];
      feedbackVideos?: string[];
    } = {
      attendance: formData.status || "pending",
    };

    if (!hasPreviousFeedback && feedback.trim()) {
      updateData.feedback = feedback;
      updateData.feedbackDate = new Date().toISOString();
      if (images.length > 0) {
        updateData.feedbackImages = images;
      }
      if (videos.length > 0) {
        updateData.feedbackVideos = videos;
      }
    }

    updateSchedule(
      { scheduleId: formData.scheduleId, data: updateData },
      {
        onSuccess: () => {
          const updatedFormData = {
            ...formData,
            status: formData.status,
            feedback: hasPreviousFeedback ? formData.feedback : feedback,
            feedbackImages: images.length > 0 ? images : undefined,
            feedbackVideos: videos.length > 0 ? videos : undefined,
          };
          onScheduleUpdate(updatedFormData);
          onOpenChange(false);
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Schedule</DialogTitle>
          <DialogDescription>
            Update attendance status and provide feedback for this session.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Editable Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label
                htmlFor="status"
                className="text-sm font-medium text-yellow-700"
              >
                Attendance Status *
              </Label>
              <Select
                value={formData.status || ""}
                onValueChange={(value) =>
                  setFormData((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="border-yellow-300 focus:border-yellow-500 w-full">
                  <SelectValue
                    placeholder={
                      formData.status
                        ? formData.status.charAt(0).toUpperCase() +
                          formData.status.slice(1)
                        : "Select attendance status"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="absent">Absent</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="feedback"
                className="text-sm font-medium text-yellow-700 flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Teacher Feedback
                {hasPreviousFeedback && (
                  <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                    Previously Completed
                  </span>
                )}
              </Label>

              {hasPreviousFeedback ? (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-50 border rounded-md">
                    <p className="text-sm text-gray-700">{feedback}</p>
                  </div>

                  {(existingImages.length > 0 || existingVideos.length > 0) && (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <ImageIcon className="h-4 w-4" />
                        <span>
                          Attached media ({existingImages.length + existingVideos.length} files)
                        </span>
                      </div>
                      <MediaPreview
                        images={existingImages}
                        videos={existingVideos}
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-500">
                    Feedback has already been provided and cannot be modified.
                  </p>
                </div>
              ) : (
                <>
                  <Textarea
                    id="feedback"
                    placeholder="Provide feedback about the student's performance, participation, or any notes for this session..."
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={4}
                    className="resize-none border-yellow-300 focus:border-yellow-500"
                    maxLength={500}
                  />
                  <p className="text-xs text-gray-500">
                    {feedback.length}/500 characters
                  </p>
                </>
              )}
            </div>

            {!hasPreviousFeedback && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-900">
                  Attach Photos/Videos (Optional)
                </Label>
                <p className="text-xs text-gray-500">
                  Upload images or videos to support your feedback
                </p>
                <FileUpload
                  onFilesSelected={handleFilesSelected}
                  accept="image/*,video/*"
                  maxFiles={10}
                  maxSizeMB={50}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>
        </form>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting || !formData.status}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isSubmitting ? "Saving..." : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
