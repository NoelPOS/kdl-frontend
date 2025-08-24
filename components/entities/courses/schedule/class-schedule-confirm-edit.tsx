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
import { useEffect, useRef, useState } from "react";
import { getTeacherByCourseId } from "@/lib/api";
import { EditScheduleFormData } from "@/app/types/course.type";
import { Teacher } from "@/app/types/teacher.type";
import { formatDateLocal } from "@/lib/utils";
import { TimeInput } from "@/components/shared/schedule/time-input";
import { isWithinBusinessHours } from "@/lib/validation-utils";
import { toast } from "sonner";
import { Calendar22 } from "@/components/shared/schedule/date-picker";

interface EditScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<EditScheduleFormData>;
  onSave: (data: EditScheduleFormData, originalIndex: number) => void;
  originalIndex: number;
  courseId: number;
  courseName?: string;
}

export function EditScheduleDialog({
  open,
  onOpenChange,
  initialData,
  onSave,
  originalIndex,
  courseId,
  courseName,
}: EditScheduleDialogProps) {
  console.log("Class Name:", courseName);
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EditScheduleFormData>({
    defaultValues: {
      date: "",
      starttime: "",
      endtime: "",
      course: courseName,
      teacher: "",
      teacherId: undefined,
      student: "",
      room: "",
      nickname: "",
      studentId: "",
      remark: "",
      status: "",
    },
  });

  // Watch form values for validation
  const startTime = watch("starttime");
  const endTime = watch("endtime");

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

  // Handle teacher selection change
  const handleTeacherChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedTeacherName = event.target.value;
    const selectedTeacher = teachers.find(
      (teacher) => teacher.name === selectedTeacherName
    );

    // Update both teacher name and teacherId
    setValue("teacher", selectedTeacherName);
    setValue("teacherId", selectedTeacher?.id);
  };

  useEffect(() => {
    if (initialData && open) {
      // Convert date format if needed
      let formattedDate = initialData.date || "";
      if (formattedDate && !formattedDate.includes("-")) {
        const parsed = new Date(formattedDate);
        console.log("Parsed Date:", parsed.toLocaleDateString("en-GB"));
        if (!isNaN(parsed.getTime())) {
          // Use local date format instead of UTC conversion
          formattedDate = formatDateLocal(parsed);
        }
      }
      reset({
        ...initialData,
        date: formattedDate,
        starttime: initialData.starttime,
        endtime: initialData.endtime,
        course: initialData.course || courseName || "", // Ensure course name is preserved
        teacherId: initialData.teacherId, // Preserve teacherId
        student: initialData.student || "",
        nickname: initialData.nickname || "",
      });
    }
  }, [initialData, reset, open, courseName]);

  useEffect(() => {
    const fetchTeachers = async () => {
      if (!open) return;
      try {
        const teacherList = await getTeacherByCourseId(courseId);
        // console.log("Fetched teachers:", teacherList);
        setTeachers(teacherList);
      } catch (error) {
        console.error("Failed to fetch teachers:", error);
      }
    };

    fetchTeachers();
  }, [open, initialData?.course, courseId]);

  const starttimeRef = useRef<HTMLInputElement>(null);
  const endtimeRef = useRef<HTMLInputElement>(null);

  const onSubmit = async (data: EditScheduleFormData) => {
    console.log("Submitting schedule data:", data);
    try {
      console.log("Schedule Updated:", data);
      console.log("Teacher ID:", data.teacherId); // Log the teacherId to verify it's being captured
      onSave(data, originalIndex);
      onOpenChange(false);
      toast.success("Schedule updated successfully!");
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error("Failed to update schedule. Please try again.");
    }
  };

  console.log("teachers:", teachers);

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-[700px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Edit Class Schedule is here
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-2 gap-x-8 gap-y-4">
            {/* Date */}

            <div className="flex flex-col gap-2">
              <Label htmlFor="date">Date</Label>
              <Calendar22
                date={
                  watch("date") !== undefined && watch("date") !== ""
                    ? new Date(watch("date") as string)
                    : undefined
                }
                onChange={(date) =>
                  setValue("date", date ? date.toLocaleDateString("en-CA") : "")
                }
              />
            </div>

            {/* Course (Read-only) */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="course">Course</Label>
              <div className="relative">
                <Input
                  id="course"
                  {...register("course")}
                  className="border-black bg-gray-100 cursor-not-allowed"
                  disabled
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>

            {/* Start Time */}
            <TimeInput
              label="Start Time"
              register={register}
              fieldName="starttime"
              inputRef={starttimeRef}
              onClick={() => starttimeRef.current?.showPicker()}
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
              inputRef={endtimeRef}
              onClick={() => endtimeRef.current?.showPicker()}
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
                  onChange={handleTeacherChange}
                  className="border-black w-full border rounded-md py-1.5 px-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <option value="" disabled hidden>
                    Select a teacher
                  </option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.name}>
                      {teacher.name}
                    </option>
                  ))}
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
                  className="border-black bg-gray-100 cursor-not-allowed"
                  disabled
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
                className="border-black bg-gray-100 cursor-not-allowed"
                disabled
              />
            </div>

            {/* Student ID */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                {...register("studentId")}
                className="border-black bg-gray-100 cursor-not-allowed"
                disabled
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
                  <option value="">Select status</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Pending">Pending</option>
                  <option value="Cancelled">Cancelled</option>
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

export default EditScheduleDialog;
