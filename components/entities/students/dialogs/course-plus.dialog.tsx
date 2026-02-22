"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { showToast } from "@/lib/toast";
import { Plus, Loader2 } from "lucide-react";
import { SessionOverview } from "@/app/types/session.type";
import { useAddCoursePlus } from "@/hooks/mutation/use-session-mutations";
import { useRouter } from "next/navigation";

interface CoursePlusFormData {
  additionalClasses: number;
}

interface CoursePlusDialogProps {
  course: SessionOverview;
}

export function CoursePlusDialog({ course }: CoursePlusDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const { mutate: addCoursePlus, isPending } = useAddCoursePlus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CoursePlusFormData>({
    defaultValues: {
      additionalClasses: 1,
    },
  });

  const onSubmit = (data: CoursePlusFormData) => {
    if (
      course.status?.toLowerCase() === "completed" ||
      course.status?.toLowerCase() === "cancelled"
    ) {
      showToast.error(
        "Cannot add course plus to completed or cancelled sessions."
      );
      return;
    }

    addCoursePlus(
      { sessionId: course.sessionId, additionalClasses: data.additionalClasses },
      {
        onSuccess: () => {
          setIsOpen(false);
          reset();
          router.refresh();
        },
      }
    );
  };

  const handleClose = () => {
    setIsOpen(false);
    reset();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="w-full bg-yellow-400 hover:bg-yellow-500"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Course Plus
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Course Plus</DialogTitle>
          <DialogDescription>
            Add additional classes to the existing session.
          </DialogDescription>
        </DialogHeader>

        {/* Session Preview */}
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mb-4">
          <h4 className="font-semibold text-gray-900 mb-2">Current Session</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <div>
              <strong>Course:</strong> {course.courseTitle}
            </div>
            <div>
              <strong>Mode:</strong> {course.mode}
            </div>
            <div>
              <strong>Progress:</strong> {course.completedCount}/
              {course.mode.split(" ")[0]} times
            </div>
            <div>
              <strong>Status:</strong> {course.status}
            </div>
            <div>
              <strong>Payment:</strong> {course.payment}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="additionalClasses">
              Number of Additional Classes{" "}
              <span className="text-red-500">*</span>
            </Label>
            <Input
              id="additionalClasses"
              type="number"
              min="1"
              max="20"
              {...register("additionalClasses", {
                required: "Number of additional classes is required",
                min: {
                  value: 1,
                  message: "Must be at least 1 class",
                },
                max: {
                  value: 20,
                  message: "Cannot exceed 20 classes",
                },
              })}
              className="w-full"
              placeholder="Enter number of classes"
            />
            {errors.additionalClasses && (
              <p className="text-red-500 text-sm">
                {errors.additionalClasses.message}
              </p>
            )}
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Course Plus
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
