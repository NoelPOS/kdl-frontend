"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Calendar, Clock, ChevronDown } from "lucide-react";
import { useRef, useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  getTeacherByCourseId,
  updateSchedule,
  checkScheduleConflict,
} from "@/lib/api";
import { ClassSchedule, FormData } from "@/app/types/schedule.type";
import { Teacher } from "@/app/types/teacher.type";

interface ConflictDetail {
  conflictType: string;
  courseTitle: string;
  teacherName: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
}

const generateConflictWarning = (conflict: ConflictDetail) => {
  const { conflictType, courseTitle, teacherName, studentName } = conflict;

  switch (conflictType) {
    case "room":
      return `Room conflict with ${courseTitle}`;
    case "teacher":
      return `Teacher conflict with ${teacherName}`;
    case "student":
      return `Student conflict with ${studentName} in ${courseTitle}`;
    case "room_teacher":
      return `Room and teacher conflict with ${courseTitle} / ${teacherName}`;
    case "room_student":
      return `Room and student conflict with ${courseTitle} / ${studentName}`;
    case "teacher_student":
      return `Teacher and student conflict with ${teacherName} / ${studentName} in ${courseTitle}`;
    case "all":
      return `Room, teacher, and student conflict with ${courseTitle} / ${teacherName} / ${studentName}`;
    default:
      return `Conflict with ${courseTitle}`;
  }
};

interface EditScheduleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FormData>;
  onScheduleUpdate?: (schedule: FormData) => void;
}

export function EditSchedule({
  open,
  onOpenChange,
  initialData,
  onScheduleUpdate,
}: EditScheduleProps) {
  const router = useRouter();
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: initialData,
  });
  const { ref: dateRHFRef } = register("date");
  const { ref: starttimeRHFRef } = register("starttime");
  const { ref: endtimeRHFRef } = register("endtime");

  const dateRef = useRef<HTMLInputElement>(null);
  const starttimeRef = useRef<HTMLInputElement>(null);
  const endtimeRef = useRef<HTMLInputElement>(null);

  const [teachers, setTeachers] = useState<Pick<Teacher, "name" | "id">[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = useCallback(
    async (data: FormData) => {
      console.log("Submitting data:", data.scheduleId);
      setIsSubmitting(true);
      try {
        let warningMessage = "none";
        try {
          const conflictResult = await checkScheduleConflict({
            date: data.date,
            startTime: data.starttime,
            endTime: data.endtime,
            room: data.room,
            teacherId: teachers.find((t) => t.name === data.teacher)?.id || 0,
            studentId:
              parseInt(data.student) ||
              parseInt(initialData?.student || "0") ||
              0,
            excludeId: initialData?.scheduleId || 0,
          });

          if (conflictResult) {
            warningMessage = generateConflictWarning(conflictResult);
          }
        } catch (conflictError) {
          console.warn("Conflict check failed:", conflictError);
        }

        const updateData = {
          date: data.date,
          startTime: data.starttime,
          endTime: data.endtime,
          room: data.room,
          remark: data.remark,
          attendance: data.status,
          teacherId:
            teachers.find((t) => t.name === data.teacher)?.id ||
            initialData?.courseId ||
            0,
          teacherName: data.teacher,
          studentName: data.student,
          nickname: data.nickname,
          courseName: data.course,
          warning: warningMessage,
        };
        await updateSchedule(Number(data.scheduleId), updateData);

        // Construct updated FormData for direct state update
        const updatedFormData: FormData = {
          scheduleId: Number(data.scheduleId),
          courseId: initialData?.courseId ?? 0,
          date: data.date,
          starttime: data.starttime,
          endtime: data.endtime,
          course: data.course || "",
          teacher: data.teacher || "",
          student: data.student || "",
          room: data.room || "",
          nickname: data.nickname || "",
          remark: data.remark || "",
          status: data.status || "",
          // Add any other required FormData fields here
        };
        if (onScheduleUpdate) {
          onScheduleUpdate(updatedFormData);
        }

        // Refresh the router to update all pages with new schedule data
        router.refresh();

        if (warningMessage) {
          alert(`Schedule updated with warning: ${warningMessage}`);
        }
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to update schedule", error);
        alert("Failed to update schedule. Please try again.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      onScheduleUpdate,
      onOpenChange,
      teachers,
      initialData?.courseId,
      initialData?.scheduleId,
      initialData?.student,
      router,
    ]
  );

  // Memoized teacher fetching to prevent unnecessary API calls
  const fetchTeachers = useCallback(async () => {
    console.log("Fetching teachers for course ID:", initialData?.courseId);
    try {
      if (typeof initialData?.courseId === "number") {
        const result = await getTeacherByCourseId(initialData.courseId);
        setTeachers(result);
      } else {
        setTeachers([]);
      }
    } catch (err) {
      console.error("Failed to load teachers", err);
      setTeachers([]);
    }
  }, [initialData?.courseId]);

  useEffect(() => {
    // console.log("EditSchedule opened, fetching teachers if needed");
    // console.log("Open state:", open);
    // console.log("Initial data course ID:", initialData?.courseId);
    if (open && initialData?.courseId) {
      fetchTeachers();
    }
  }, [open, initialData?.courseId, fetchTeachers]);

  useEffect(() => {
    if (initialData) {
      reset(initialData);
    }
  }, [initialData, reset]);

  // Memoize the teacher options to prevent unnecessary re-renders
  const teacherOptions = useMemo(
    () => (
      <>
        <option value="" disabled hidden>
          Select a teacher
        </option>
        {teachers.map((teacher) => (
          <option key={teacher.id} value={teacher.name}>
            {teacher.name}
          </option>
        ))}
      </>
    ),
    [teachers]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Class Schedule
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Date */}
            <div
              className="flex flex-col gap-2"
              onClick={() => dateRef.current?.showPicker()}
            >
              <Label htmlFor="date">Date</Label>
              <div className="relative">
                <Input
                  id="date"
                  type="date"
                  {...register("date")}
                  ref={(e) => {
                    dateRHFRef(e); // connect RHF ref
                    dateRef.current = e; // also assign to your own ref
                  }}
                  className="border-black"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>
            {/* Course */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="course">Course</Label>
              <div className="relative">
                <Input
                  id="course"
                  {...register("course")}
                  placeholder="Search for a course"
                  className="border-black "
                />

                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>
            {/* Start Time */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="starttime">Start Time</Label>
              <div
                className="relative"
                onClick={() => starttimeRef.current?.showPicker()}
              >
                <Input
                  id="starttime"
                  type="time"
                  {...register("starttime")}
                  ref={(e) => {
                    starttimeRHFRef(e); // connect RHF ref
                    starttimeRef.current = e; // also assign to your own ref
                  }}
                  className="border-black"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>

            {/* End Time */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">End Time</Label>
              <div
                className="relative"
                onClick={() => endtimeRef.current?.showPicker()}
              >
                <Input
                  id="endtime"
                  type="time"
                  {...register("endtime")}
                  ref={(e) => {
                    endtimeRHFRef(e); // connect RHF ref
                    endtimeRef.current = e; // also assign to your own ref
                  }}
                  className="border-black"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>

            {/* Teacher */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="teacher">Teacher</Label>
              <div className="relative">
                <select
                  id="teacher"
                  {...register("teacher")}
                  className="border-black w-full border rounded-md py-1.5 px-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  {teacherOptions}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
              </div>
            </div>
            {/* Student */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="student">Student</Label>
              <div className="relative">
                <Input
                  id="student"
                  {...register("student")}
                  className=" border-black"
                  placeholder="Search for a student"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>
            {/* Room */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="room">Room</Label>

              <div className="relative">
                <select
                  id="room"
                  {...register("room")}
                  className="border-black w-full border rounded-md py-1.5 px-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <option value="" disabled hidden>
                    Select a room
                  </option>
                  <option value="Room 1">Room 1</option>
                  <option value="Room 2">Room 2</option>
                  <option value="Room 3">Room 3</option>
                  <option value="Room 4">Room 4</option>
                  <option value="Room 5">Room 5</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
              </div>
            </div>
            {/* Nickname */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="nickname">Nickname</Label>
              <Input
                id="nickname"
                {...register("nickname")}
                className="border-black"
                placeholder="Enter nickname "
              />
            </div>

            {/* Remark */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="remark">Remark</Label>
              <Input
                id="remark"
                {...register("remark")}
                className="border-black"
                placeholder="Enter any remarks or notes"
              />
            </div>
            {/* Status */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="status">Status</Label>
              <div className="relative">
                <select
                  id="status"
                  {...register("status")}
                  className="border-black w-full border rounded-md py-1.5 px-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <option value="" disabled hidden>
                    Select status
                  </option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="pending">Pending</option>
                  <option value="absent">Absent</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
              </div>
            </div>
          </div>

          <DialogFooter className="flex justify-end gap-2 mt-8">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                className="text-red-600 border-red-600 hover:bg-red-500 hover:text-white rounded-2xl w-[5rem]"
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-yellow-500 text-white hover:bg-yellow-400 rounded-2xl w-[5rem]"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
export default EditSchedule;
