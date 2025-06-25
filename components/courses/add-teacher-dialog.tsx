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
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown } from "lucide-react";
import { getTeacherByCourseId } from "@/lib/axio";
import { Teacher } from "@/app/types/teacher.type";

export type FormData = {
  teacher: string;
  room: string;
  remark: string;
  teacherId: number;
};

interface AddTeacherProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  afterTeacher: (data: FormData) => void;
}

export function AddTeacher({
  open,
  onOpenChange,
  afterTeacher,
}: AddTeacherProps) {
  const { register, handleSubmit } = useForm<FormData>({
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
        const courseId = new URLSearchParams(window.location.search).get("id");
        if (!courseId) return;

        const teacherList = await getTeacherByCourseId(Number(courseId));
        setTeachers(teacherList);
      } catch (error) {
        console.error("Failed to fetch teachers for course:", error);
      }
    };

    fetchTeachers();
  }, [open]);

  const onSubmit = (data: FormData) => {
    // console.log("Schedule Submitted:", data);
    const selectedTeacher = teachers.find((t) => t.name === data.teacher);
    if (!selectedTeacher) {
      console.error("Selected teacher not found:", data.teacher);
      return;
    }
    const payload = {
      ...data,
      teacherId: Number(selectedTeacher.id),
    };
    afterTeacher(payload);
    onOpenChange(false);
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
              Add
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default AddTeacher;
