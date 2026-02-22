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
import { useUpdateSession } from "@/hooks/mutation/use-session-mutations";

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
  const { mutate: updateSession, isPending } = useUpdateSession(sessionId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSession(
      { comment },
      {
        onSuccess: () => {
          onCommentUpdate?.(comment);
          setIsOpen(false);
        },
      }
    );
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
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Saving..." : "Save Comment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
