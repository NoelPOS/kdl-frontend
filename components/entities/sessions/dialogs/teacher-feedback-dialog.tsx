"use client";

import { useState } from "react";
import { MessageSquare, User, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { SessionOverview } from "@/app/types/session.type";
import { submitTeacherFeedback } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";
import FileUpload from "@/components/shared/file-upload";

interface TeacherFeedbackDialogProps {
  session: SessionOverview;
}

export default function TeacherFeedbackDialog({
  session,
}: TeacherFeedbackDialogProps) {
  const [feedback, setFeedback] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleFilesSelected = (files: File[]) => {
    setSelectedFiles(files);
  };

  const removeSelectedFile = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index);
    setSelectedFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (!feedback.trim()) return;

    setIsSubmitting(true);
    try {
      let mediaUrls: string[] = [];

      // Upload files if any are selected using pre-signed URLs
      if (selectedFiles.length > 0) {
        const uploadPromises = selectedFiles.map(async (file) => {
          // Get pre-signed URL
          const getUrlRes = await fetch(
            `/api/s3-upload-url?fileName=${encodeURIComponent(
              file.name
            )}&fileType=${encodeURIComponent(file.type)}&folder=feedback`
          );
          if (!getUrlRes.ok) {
            throw new Error(`Failed to get upload URL for ${file.name}`);
          }
          const { url } = await getUrlRes.json();

          // Upload directly to S3
          const uploadRes = await fetch(url, {
            method: "PUT",
            headers: { "Content-Type": file.type },
            body: file,
          });
          if (!uploadRes.ok) {
            throw new Error(`Failed to upload ${file.name}`);
          }

          // Construct the final S3 URL
          const s3Url = `https://${process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME}.s3.amazonaws.com/feedback/${encodeURIComponent(file.name)}`;
          return s3Url;
        });
        mediaUrls = await Promise.all(uploadPromises);
      }

      // Separate media URLs into images and videos
      const images = mediaUrls.filter(url => 
        /\.(jpg|jpeg|png|webp|gif)$/i.test(url)
      );
      const videos = mediaUrls.filter(url => 
        /\.(mp4|webm|mov)$/i.test(url)
      );

      // TODO: Get actual student ID - for now using placeholder
      const success = await submitTeacherFeedback(
        session.sessionId,
        1, // placeholder student ID
        feedback,
        images.length > 0 ? images : undefined,
        videos.length > 0 ? videos : undefined
      );

      if (success) {
        setFeedback("");
        setSelectedFiles([]);
        setIsOpen(false);
        showToast.success("Feedback submitted successfully!");
      } else {
        showToast.error("Failed to submit feedback. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting feedback:", error);
      showToast.error("An error occurred while submitting feedback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full border-blue-300 text-blue-600 hover:bg-blue-50"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          Give Feedback
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Provide Student Feedback</DialogTitle>
          <DialogDescription>
            Share your feedback about the student&apos;s performance in this
            session.
          </DialogDescription>
        </DialogHeader>

        {/* Student Preview Section */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">
                {session.courseTitle}
              </h3>
              <p className="text-sm text-gray-600">
                Session ID: {session.sessionId}
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Input */}
        <div className="space-y-2">
          <label
            htmlFor="feedback"
            className="text-sm font-medium text-gray-900"
          >
            Your Feedback
          </label>
          <Textarea
            id="feedback"
            placeholder="Enter your feedback about the student's performance, areas for improvement, strengths, etc..."
            value={feedback}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
              setFeedback(e.target.value)
            }
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-gray-500">
            {feedback.length}/500 characters
          </p>
        </div>

        {/* File Upload */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-900">
            Attach Photos/Videos (Optional)
          </label>
          <p className="text-xs text-gray-500">
            Files will be uploaded when you submit the feedback
          </p>
          <FileUpload
            onFilesSelected={handleFilesSelected}
            accept="image/*,video/*"
            maxFiles={10}
            maxSizeMB={50}
            disabled={isSubmitting}
          />
        </div>

        <DialogFooter className="sm:justify-start">
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !feedback.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
