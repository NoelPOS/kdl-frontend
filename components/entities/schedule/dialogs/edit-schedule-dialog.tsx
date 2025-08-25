"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { showToast } from "@/lib/toast";
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
import { TimeInput } from "@/components/shared/schedule";
import { isWithinBusinessHours } from "@/lib/validation-utils";
import { formatDateLocal, generateConflictWarning } from "@/lib/utils";
import { Calendar22 } from "@/components/shared/schedule/date-picker";

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
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    defaultValues: initialData,
  });

  // Watch form values for validation
  const startTime = watch("starttime");
  const endTime = watch("endtime");
  const selectedDate = watch("date");

  const { ref: dateRHFRef } = register("date", {
    required: "Date is required",
  });

  const dateRef = useRef<HTMLInputElement>(null);
  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);
  const [teachers, setTeachers] = useState<Pick<Teacher, "name" | "id">[]>([]);

  // Validation functions
  const validateStartTime = (value: string) => {
    if (!value) return "Start time is required";
    if (!isWithinBusinessHours(value)) {
      return "Start time must be between 9:00 AM and 5:00 PM";
    }
    if (endTime && value >= endTime) {
      return "Start time must be before end time";
    }
    return true;
  };

  const validateEndTime = (value: string) => {
    if (!value) return "End time is required";
    if (!isWithinBusinessHours(value)) {
      return "End time must be between 9:00 AM and 5:00 PM";
    }
    if (startTime && value <= startTime) {
      return "End time must be after start time";
    }
    return true;
  };

  const onSubmit = useCallback(
    async (data: FormData) => {
      console.log("Submitting data:", data.scheduleId);
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

          console.log("Conflict result:", conflictResult);

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
          warning: warningMessage || "hello world",
          // Add any other required FormData fields here
        };
        if (onScheduleUpdate) {
          onScheduleUpdate(updatedFormData);
        }

        router.refresh();

        if (warningMessage) {
          showToast.warning(`Schedule updated with warning: ${warningMessage}`);
        } else {
          showToast.success("Schedule updated successfully!");
        }
        onOpenChange(false);
      } catch (error) {
        console.error("Failed to update schedule", error);
        showToast.error("Failed to update schedule. Please try again.");
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
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-[700px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Class Schedule
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date *</Label>
              <Calendar22
                date={watch("date") ? new Date(watch("date")) : undefined}
                onChange={(date) =>
                  setValue("date", date ? date.toLocaleDateString("en-CA") : "")
                }
              />

              {errors.date && (
                <span className="text-red-500 text-sm">
                  {errors.date.message}
                </span>
              )}
            </div>
            {/* Course */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="course">Course</Label>
              <div className="relative">
                <Input
                  disabled={true}
                  id="course"
                  {...register("course")}
                  placeholder="Search for a course (optional)"
                  className="border-black"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>
            {/* Start Time */}
            <TimeInput
              label="Start Time"
              register={register}
              fieldName="starttime"
              inputRef={startTimeRef}
              onClick={() => startTimeRef.current?.showPicker()}
              error={errors.starttime?.message}
              required={true}
              validation={{
                required: "Start time is required",
                validate: validateStartTime,
              }}
            />

            {/* End Time */}
            <TimeInput
              label="End Time"
              register={register}
              fieldName="endtime"
              inputRef={endTimeRef}
              onClick={() => endTimeRef.current?.showPicker()}
              error={errors.endtime?.message}
              required={true}
              validation={{
                required: "End time is required",
                validate: validateEndTime,
              }}
            />

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
              <Label htmlFor="student">Student </Label>
              <div className="relative">
                <Input
                  disabled={true}
                  id="student"
                  {...register("student")}
                  className="border-black"
                  placeholder="Search for a student (optional)"
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
                disabled={true}
                id="nickname"
                {...register("nickname")}
                className="border-black"
                placeholder="Enter nickname"
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
