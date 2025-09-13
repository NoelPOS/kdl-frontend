"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare } from "lucide-react";
import { updateSession } from "@/lib/api/sessions";
import { showToast } from "@/lib/toast";

interface CommentDialogProps {
  sessionId: number;
  currentComment?: string;
  onCommentUpdate?: (comment: string) => void;
}

export function CommentDialog({
  sessionId,
  currentComment = "",
  onCommentUpdate,
}: CommentDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [comment, setComment] = useState(currentComment);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const result = await updateSession(sessionId, { comment });
      
      if (result.success) {
        showToast.success("Comment updated successfully");
        onCommentUpdate?.(comment);
        setIsOpen(false);
      } else {
        showToast.error("Failed to update comment");
      }
    } catch (error) {
      console.error("Error updating comment:", error);
      showToast.error("Failed to update comment");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="w-full border-blue-200 text-blue-600 hover:bg-blue-50"
        >
          <MessageSquare className="h-4 w-4 mr-2" />
          {currentComment ? "Edit Comment" : "Add Comment"}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {currentComment ? "Edit Comment" : "Add Comment"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="comment">Comment</Label>
            <Input
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Enter your comment..."
              className="mt-1"
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Comment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
