"use client";

import { useState, useEffect } from "react";
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
import {
  fetchCourses,
  fetchTeachers,
  getCourseTypes,
  updateSession,
  createBulkSchedules,
} from "@/lib/api";
import { SessionOverview } from "@/app/types/session.type";
import { Course, ClassOption } from "@/app/types/course.type";
import { Teacher } from "@/app/types/teacher.type";
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
  const [isLoading, setIsLoading] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [classOptions, setClassOptions] = useState<ClassOption[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<AssignCourseFormData>();

  const watchedCourseId = watch("courseId");

  // Load initial data
  useEffect(() => {
    const loadData = async () => {
      try {
        const [coursesData, teachersData] = await Promise.all([
          fetchCourses(),
          fetchTeachers(),
        ]);
        setCourses(coursesData.courses);
        setTeachers(teachersData.teachers);
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };

    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  // Load class options when dialog opens
  useEffect(() => {
    const loadClassOptions = async () => {
      try {
        const options = await getCourseTypes();
        setClassOptions(options);
      } catch (error) {
        console.error("Error loading class options:", error);
        setClassOptions([]);
      }
    };

    if (isOpen) {
      loadClassOptions();
    }
  }, [isOpen]);

  const onSubmit = async (data: AssignCourseFormData) => {
    setIsLoading(true);

    try {
      console.log("=== Assigning Course to TBC Session ===");
      console.log("Session ID:", session.sessionId);
      console.log("Course ID:", data.courseId);
      console.log("Teacher ID:", data.teacherId);
      console.log("Class Option ID:", data.classOptionId);
      console.log("=====================================");

      // 1. Update the session with new course, teacher, and class option
      await updateSession(session.sessionId, {
        courseId: data.courseId,
        teacherId: data.teacherId,
        classOptionId: data.classOptionId,
      });

      // 2. For now, we'll skip automatic schedule creation and just update the session
      // The user can manually create schedules later using the existing schedule system
      // TODO: Implement automatic schedule creation based on class option requirements

      console.log("Course assigned successfully!");
      const selectedCourse = courses.find((c) => c.id === data.courseId);
      alert(
        `Successfully assigned ${selectedCourse?.title} to the student session!`
      );

      // Close dialog and refresh
      setIsOpen(false);
      reset();
      router.refresh();
    } catch (error) {
      console.error("Error assigning course:", error);
      alert("Error assigning course. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
