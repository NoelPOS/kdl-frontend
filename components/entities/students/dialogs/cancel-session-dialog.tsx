"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { cancelSession } from "@/lib/api";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

interface CancelSessionDialogProps {
  sessionId: number;
  sessionTitle: string;
}

export function CancelSessionDialog({
  sessionId,
  sessionTitle,
}: CancelSessionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    setIsLoading(true);
    const toastId = showToast.loading("Cancelling session...");
    try {
      const success = await cancelSession(sessionId);
      showToast.dismiss(toastId);
      if (success) {
        showToast.success("Session cancelled successfully!");
        router.refresh();
        setIsOpen(false);
      } else {
        showToast.error("Failed to cancel session. Please try again.");
        console.error("Failed to cancel session");
      }
    } catch (error) {
      showToast.dismiss(toastId);
      showToast.error("Error cancelling session. Please try again.");
      console.error("Error cancelling session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-red-600 text-red-600 hover:bg-red-600 hover:text-white flex items-center gap-2"
        >
          <XCircle className="h-4 w-4" />
          Cancel Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel Session</DialogTitle>
          <DialogDescription>
            Are you sure you want to cancel the session{" "}
            <strong>&quot;{sessionTitle}&quot;</strong>?
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? "Cancelling..." : "Cancel Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
