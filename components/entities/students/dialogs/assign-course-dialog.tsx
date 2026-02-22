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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";
import { useUpdateSession } from "@/hooks/mutation/use-session-mutations";
import { useCourseList } from "@/hooks/query/use-courses";
import { useAllTeachers } from "@/hooks/query/use-teachers";
import { useCourseTypes } from "@/hooks/query/use-courses";
import { SessionOverview } from "@/app/types/session.type";
import { generateScheduleRows } from "@/lib/utils";

interface AssignCourseFormData {
  courseId: number;
  teacherId: number;
  classOptionId: number;
}

interface AssignCourseDialogProps {
  session: SessionOverview;
  studentId: number; // Add studentId as separate prop since it's not in SessionOverview
}

export default function AssignCourseDialog({
  session,
  studentId,
}: AssignCourseDialogProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const { mutate: updateSession, isPending: isLoading } = useUpdateSession(session.sessionId);

  // Fetch data using hooks — only enabled when dialog is open
  const { data: coursesData } = useCourseList({ enabled: isOpen } as any);
  const { data: teachersData } = useAllTeachers();
  const { data: classOptionsData } = useCourseTypes();

  const courses = coursesData?.courses ?? [];
  const teachers = teachersData ?? [];
  const classOptions = classOptionsData ?? [];

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignCourseFormData>();

  const watchedCourseId = watch("courseId");

  const onSubmit = (data: AssignCourseFormData) => {
    updateSession(
      {
        courseId: data.courseId,
        teacherId: data.teacherId,
        classOptionId: data.classOptionId,
      },
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
        <Button className="bg-green-500 hover:bg-green-600 text-white w-full">
          <BookOpen className="h-4 w-4 mr-2" />
          Assign Course
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Assign Course to TBC Session</DialogTitle>
          <DialogDescription>
            Select a course, teacher, and class type to assign to this TBC
            session. Schedules will be automatically created based on your
            selection.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Course Selection */}
          <div className="space-y-2">
            <Label htmlFor="courseId">
              Course <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("courseId", parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((course) => (
                  <SelectItem key={course.id} value={course.id.toString()}>
                    {course.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teacher Selection */}
          <div className="space-y-2">
            <Label htmlFor="teacherId">
              Teacher <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) => setValue("teacherId", parseInt(value))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={teacher.id.toString()}>
                    {teacher.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Class Option Selection */}
          <div className="space-y-2">
            <Label htmlFor="classOptionId">
              Class Type <span className="text-red-500">*</span>
            </Label>
            <Select
              onValueChange={(value) =>
                setValue("classOptionId", parseInt(value))
              }
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class type" />
              </SelectTrigger>
              <SelectContent>
                {classOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id.toString()}>
                    {option.classMode} - {option.tuitionFee}THB
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter className="gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-green-500 hover:bg-green-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Assigning Course...
                </>
              ) : (
                <>
                  <BookOpen className="h-4 w-4 mr-2" />
                  Assign Course
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
