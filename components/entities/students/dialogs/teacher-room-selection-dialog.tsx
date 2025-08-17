"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { getTeacherByCourseId } from "@/lib/api";
import { Teacher } from "@/app/types/teacher.type";
import { TeacherData } from "@/app/types/course.type";

export type FormData = {
  teacher: string;
  room: string;
  remark: string;
};

interface TeacherRoomSelectionDialogProps {
  open: boolean;
  courseId: number;
  onTeacherRoomSelected: (data: TeacherData) => void;
  onBack: () => void;
  onCancel: () => void;
  mode?: "create" | "assign";
}

export default function TeacherRoomSelectionDialog({
  open,
  courseId,
  onTeacherRoomSelected,
  onBack,
  onCancel,
  mode = "create",
}: TeacherRoomSelectionDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      teacher: "",
      room: "",
      remark: "",
    },
  });

  const [teachers, setTeachers] = useState<Pick<Teacher, "name" | "id">[]>([]);

  useEffect(() => {
    if (!open) return;

    const fetchTeachers = async () => {
      try {
        const teacherList = await getTeacherByCourseId(courseId);
        setTeachers(teacherList);
      } catch (error) {
        console.error("Failed to fetch teachers for course:", error);
      }
    };

    if (courseId && courseId > 0) {
      fetchTeachers();
    }
  }, [open, courseId]);

  const onSubmit = (data: FormData) => {
    // Validate required fields
    if (!data.teacher || !data.room) {
      alert("Please select both teacher and room.");
      return;
    }

    const selectedTeacher = teachers.find((t) => t.name === data.teacher);
    if (!selectedTeacher) {
      alert("Selected teacher not found. Please select a valid teacher.");
      return;
    }

    // Create TeacherData object
    const teacherData: TeacherData = {
      teacherId: Number(selectedTeacher.id),
      teacher: selectedTeacher.name,
      room: data.room,
      remark: data.remark,
    };

    onTeacherRoomSelected(teacherData);
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onCancel()}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Select Teacher & Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Teacher */}
          <div className="space-y-2">
            <Label htmlFor="teacher">
              Teacher <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <select
                id="teacher"
                {...register("teacher", { required: "Teacher is required" })}
                className="w-full border border-gray-300 rounded-md py-2 px-3 appearance-none"
              >
                <option value="" disabled>
                  Select a teacher
                </option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.name}>
                    {teacher.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.teacher && (
              <p className="text-red-500 text-sm">{errors.teacher.message}</p>
            )}
          </div>

          {/* Room */}
          <div className="space-y-2">
            <Label htmlFor="room">
              Room <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <select
                id="room"
                {...register("room", { required: "Room is required" })}
                className="w-full border border-gray-300 rounded-md py-2 px-3 appearance-none"
              >
                <option value="" disabled>
                  Select a room
                </option>
                <option value="Room 1">Room 1</option>
                <option value="Room 2">Room 2</option>
                <option value="Room 3">Room 3</option>
                <option value="Room 4">Room 4</option>
                <option value="Room 5">Room 5</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
            </div>
            {errors.room && (
              <p className="text-red-500 text-sm">{errors.room.message}</p>
            )}
          </div>

          {/* Remark */}
          <div className="space-y-2">
            <Label htmlFor="remark">Remark</Label>
            <Input
              id="remark"
              {...register("remark")}
              placeholder="Enter any remarks or notes"
            />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600">
              Next
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
