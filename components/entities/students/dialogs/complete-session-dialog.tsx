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
import { CheckCircle } from "lucide-react";
import { completeSession } from "@/lib/api";
import { useRouter } from "next/navigation";
import { showToast } from "@/lib/toast";

interface CompleteSessionDialogProps {
  sessionId: number;
  sessionTitle: string;
}

export function CompleteSessionDialog({
  sessionId,
  sessionTitle,
}: CompleteSessionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleComplete = async () => {
    setIsLoading(true);
    const toastId = showToast.loading("Completing session...");
    try {
      const success = await completeSession(sessionId);
      showToast.dismiss(toastId);
      if (success) {
        showToast.success("Session completed successfully!");
        router.refresh(); // Refresh the page to show updated data
        setIsOpen(false);
      } else {
        showToast.error("Failed to complete session. Please try again.");
        console.error("Failed to complete session");
      }
    } catch (error) {
      showToast.dismiss(toastId);
      showToast.error("Error completing session. Please try again.");
      console.error("Error completing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-yellow-600 hover:bg-yellow-700 text-white flex items-center gap-2">
          <CheckCircle className="h-4 w-4" />
          Complete Session
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete Session</DialogTitle>
          <DialogDescription>
            Are you sure you want to mark the session{" "}
            <strong>&quot;{sessionTitle}&quot;</strong> as completed? This
            action cannot be undone.
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
            onClick={handleComplete}
            disabled={isLoading}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isLoading ? "Completing..." : "Complete Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
