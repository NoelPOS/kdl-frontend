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
    try {
      const success = await completeSession(sessionId);
      if (success) {
        router.refresh(); // Refresh the page to show updated data
        setIsOpen(false);
      } else {
        // Handle error - you might want to show an error toast here
        console.error("Failed to complete session");
      }
    } catch (error) {
      console.error("Error completing session:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2">
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Completing..." : "Complete Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
