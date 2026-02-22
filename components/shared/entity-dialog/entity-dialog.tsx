"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-md",
  lg: "sm:max-w-lg",
  xl: "sm:max-w-2xl",
  "2xl": "sm:max-w-4xl",
} as const;

interface EntityDialogProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  /** Form fields or other content rendered in the dialog body. */
  children: React.ReactNode;
  /** Submit/cancel buttons rendered in the DialogFooter. */
  footer?: React.ReactNode;
  size?: keyof typeof sizeClasses;
  /** Extra class added to DialogContent. */
  contentClassName?: string;
}

/**
 * Generic controlled dialog shell.
 *
 * Usage:
 * ```tsx
 * <EntityDialog isOpen={open} onClose={() => setOpen(false)} title="Add Student">
 *   <form ...>...</form>
 * </EntityDialog>
 * ```
 */
export function EntityDialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  size = "md",
  contentClassName,
}: EntityDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className={cn("p-8", sizeClasses[size], contentClassName)}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {title}
          </DialogTitle>
          {description && (
            <DialogDescription className="text-center">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        <div className="mt-4">{children}</div>
        {footer && <DialogFooter className="gap-2 mt-6">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}
