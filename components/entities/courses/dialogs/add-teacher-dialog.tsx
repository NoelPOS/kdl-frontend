"use client";

import { useEffect, useState } from "react";
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
import { ChevronDown } from "lucide-react";
import { getTeacherByCourseId, getAllRooms } from "@/lib/api";
import { Teacher } from "@/app/types/teacher.type";
import { Room } from "@/app/types/room.type";

export type FormData = {
  teacher: string;
  room: string;
  remark: string;
  teacherId: number;
};

interface AddTeacherProps {
  courseId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  afterTeacher: (data: FormData) => void;
  onBack?: () => void;
  onCancel?: () => void;
}

export function AddTeacher({
  courseId,
  open,
  onOpenChange,
  afterTeacher,
  onBack,
  onCancel,
}: AddTeacherProps) {
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
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    if (!open) return;

    const fetchTeachers = async () => {
      try {
        const teacherList = await getTeacherByCourseId(Number(courseId));
        setTeachers(teacherList);
      } catch (error) {
        console.error("Failed to fetch teachers for course:", error);
      }
    };

    fetchTeachers();
  }, [open, courseId]);

  useEffect(() => {
    if (!open) return;

    const fetchRooms = async () => {
      try {
        const roomList = await getAllRooms();
        setRooms(roomList);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        showToast.error("Failed to fetch rooms", "Please try again later.");
      }
    };

    fetchRooms();
  }, [open]);

  const onSubmit = (data: FormData) => {
    // Validate required fields
    if (!data.teacher || !data.room) {
      showToast.error("Please select both teacher and room.");
      return;
    }

    const selectedTeacher = teachers.find((t) => t.name === data.teacher);
    if (!selectedTeacher) {
      showToast.error(
        "Selected teacher not found. Please select a valid teacher."
      );
      return;
    }

    const payload = {
      ...data,
      teacherId: Number(selectedTeacher.id),
    };
    afterTeacher(payload);
    onOpenChange(false);
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            {typeof window !== "undefined"
              ? new URLSearchParams(window.location.search).get("course")
              : null}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-x-8 gap-y-4">
            {/* Teacher */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="teacher">Teacher</Label>
              <div className="relative">
                <select
                  id="teacher"
                  {...register("teacher", { required: "Teacher is required" })}
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

            {/* Room */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="room">Room</Label>
              <div className="relative">
                <select
                  id="room"
                  {...register("room", { required: "Room is required" })}
                  className="border-black w-full border rounded-md py-1.5 px-2"
                  style={{ fontSize: "0.875rem" }}
                >
                  <option value="" disabled hidden>
                    Select a room
                  </option>
                  {rooms.map((room) => (
                    <option key={room.id} value={room.name}>
                      {room.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
              </div>
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
          </div>

          <DialogFooter className="flex justify-between gap-2 mt-8">
            <div className="flex gap-2">
              {onBack && (
                <Button
                  type="button"
                  variant="outline"
                  className="text-gray-500 border-gray-500 hover:bg-gray-50 hover:text-gray-600 rounded-2xl w-[5rem]"
                  onClick={handleBack}
                >
                  Back
                </Button>
              )}
            </div>
            <Button
              type="submit"
              className="bg-yellow-500 text-white hover:bg-yellow-400 rounded-2xl w-[5rem]"
            >
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddTeacher;
