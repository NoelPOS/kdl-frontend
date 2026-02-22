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
import { useCancelSession } from "@/hooks/mutation/use-session-mutations";
import { useRouter } from "next/navigation";

interface CancelSessionDialogProps {
  sessionId: number;
  sessionTitle: string;
}

export function CancelSessionDialog({
  sessionId,
  sessionTitle,
}: CancelSessionDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { mutate: cancelSession, isPending } = useCancelSession();

  const handleCancel = () => {
    cancelSession(sessionId, {
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
            disabled={isPending}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCancel}
            disabled={isPending}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            {isPending ? "Cancelling..." : "Cancel Session"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
