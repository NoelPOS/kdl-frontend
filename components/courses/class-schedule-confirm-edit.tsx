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
import { getTeacherByCourseId } from "@/lib/axio";
import { EditScheduleFormData } from "@/app/types/course.type";
import { Teacher } from "@/app/types/teacher.type";

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
  const { register, handleSubmit, reset } = useForm<EditScheduleFormData>({
    defaultValues: {
      date: "",
      starttime: "",
      endtime: "",
      course: courseName,
      teacher: "",
      student: "",
      room: "",
      nickname: "",
      studentId: "",
      remark: "",
      status: "",
    },
  });

  // console.log("EditScheduleDialog initialData:", initialData);

  const { ref: dateRHFRef } = register("date");
  const { ref: starttimeRHFRef } = register("starttime");
  const { ref: endtimeRHFRef } = register("endtime");

  const [teachers, setTeachers] = useState<Pick<Teacher, "name" | "id">[]>([]);

  useEffect(() => {
    if (initialData && open) {
      // Convert date format if needed
      let formattedDate = initialData.date || "";
      if (formattedDate && !formattedDate.includes("-")) {
        const parsed = new Date(formattedDate);
        if (!isNaN(parsed.getTime())) {
          // Add one day to compensate for timezone conversion
          parsed.setDate(parsed.getDate() + 1);
          formattedDate = parsed.toISOString().split("T")[0];
        }
      }
      reset({
        ...initialData,
        date: formattedDate,
        starttime: initialData.starttime,
        endtime: initialData.endtime,
        course: initialData.course || courseName || "", // Ensure course name is preserved
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

  const dateRef = useRef<HTMLInputElement>(null);
  const starttimeRef = useRef<HTMLInputElement>(null);
  const endtimeRef = useRef<HTMLInputElement>(null);

  const onSubmit = (data: EditScheduleFormData) => {
    // console.log("Schedule Updated:", data);
    onSave(data, originalIndex);
    onOpenChange(false);
  };

  console.log("teachers:", teachers);

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
                    dateRHFRef(e);
                    dateRef.current = e;
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
                  className="border-black"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>

            {/*Start Time */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Hello world</Label>
              <div
                className="relative"
                onClick={() => starttimeRef.current?.showPicker()}
              >
                <Input
                  id="starttime"
                  type="time"
                  {...register("starttime")}
                  ref={(e) => {
                    starttimeRHFRef(e);
                    starttimeRef.current = e;
                  }}
                  className="border-black"
                />
                <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>

            {/* End Time */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="endtime">End Time</Label>
              <div
                className="relative"
                onClick={() => endtimeRef.current?.showPicker()}
              >
                <Input
                  id="endtime"
                  type="time"
                  {...register("endtime")}
                  ref={(e) => {
                    endtimeRHFRef(e);
                    endtimeRef.current = e;
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
                  className="border-black"
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
                  <option value="Online">Online</option>
                  <option value="Room 101">Room 101</option>
                  <option value="Auditorium">Auditorium</option>
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
                placeholder="Enter nickname"
              />
            </div>

            {/* Student ID */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="studentId">Student ID</Label>
              <Input
                id="studentId"
                {...register("studentId")}
                className="border-black"
                placeholder="Enter student ID"
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
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-yellow-500 text-white hover:bg-yellow-400 rounded-2xl w-[5rem]"
            >
              Save
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default EditScheduleDialog;
