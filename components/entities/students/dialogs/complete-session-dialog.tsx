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
import { useCompleteSession } from "@/hooks/mutation/use-session-mutations";
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
  const router = useRouter();
  const { mutate: completeSession, isPending } = useCompleteSession();

  const handleComplete = () => {
    completeSession(sessionId, {
      onSuccess: () => {
        router.refresh();
        setIsOpen(false);
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="border-yellow-600 text-yellow-600 hover:bg-yellow-500 flex items-center gap-2"
        >
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
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleComplete}
            disabled={isPending}
            className="bg-yellow-600 hover:bg-yellow-700"
          >
            {isPending ? "Completing..." : "Complete Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
