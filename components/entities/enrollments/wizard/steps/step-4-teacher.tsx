"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { ChevronDown, Loader2 } from "lucide-react";
import { useTeachersByCourse } from "@/hooks/query/use-teachers";
import { useRoomList } from "@/hooks/query/use-rooms";
import type { StepPanelProps } from "../types";

type FormData = {
  teacher: string;
  room: string;
  remark: string;
};

interface Step4Props extends StepPanelProps {
  courseId: number;
}

export function Step4Teacher({
  data,
  onChange,
  onValidChange,
  courseId,
}: Step4Props) {
  const { register, watch } = useForm<FormData>({
    defaultValues: {
      teacher: data.teacherName || "",
      room: data.room || "",
      remark: data.remark || "",
    },
  });

  const teacherVal = watch("teacher");
  const roomVal = watch("room");
  const remarkVal = watch("remark");

  const { data: teachers = [], isLoading: teachersLoading } = useTeachersByCourse(
    courseId > 0 ? courseId : undefined,
    { enabled: courseId > 0 }
  );
  const { data: rooms = [], isLoading: roomsLoading } = useRoomList();

  // Sync to parent on value changes
  useEffect(() => {
    const selectedTeacher = teachers.find((t) => t.name === teacherVal);
    onChange({
      teacherId: selectedTeacher ? Number(selectedTeacher.id) : undefined,
      teacherName: teacherVal || undefined,
      room: roomVal || undefined,
      remark: remarkVal || undefined,
    });
  }, [teacherVal, roomVal, remarkVal]); // eslint-disable-line react-hooks/exhaustive-deps

  // Validate
  useEffect(() => {
    const isValid = !!teacherVal && !!roomVal;
    onValidChange(isValid);
  }, [teacherVal, roomVal, onValidChange]);

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-1">
          Assign Teacher & Room
        </h3>
        <p className="text-sm text-muted-foreground">
          Select a teacher and room for this enrollment.
        </p>
      </div>

      {/* Teacher */}
      <div className="space-y-2">
        <Label htmlFor="wizard-teacher">
          Teacher <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <select
            id="wizard-teacher"
            {...register("teacher", { required: "Teacher is required" })}
            disabled={teachersLoading}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 appearance-none bg-gray-50 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all disabled:opacity-60"
          >
            <option value="" disabled>
              {teachersLoading
                ? "Loading teachers..."
                : teachers.length === 0
                ? "No teachers assigned to this course"
                : "Select a teacher"}
            </option>
            {teachers.map((teacher) => (
              <option key={teacher.id} value={teacher.name}>
                {teacher.name}
              </option>
            ))}
          </select>
          {teachersLoading
            ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            : <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
          }
        </div>
      </div>

      {/* Room */}
      <div className="space-y-2">
        <Label htmlFor="wizard-room">
          Room <span className="text-red-500">*</span>
        </Label>
        <div className="relative">
          <select
            id="wizard-room"
            {...register("room", { required: "Room is required" })}
            className="w-full border border-gray-200 rounded-xl py-3 px-4 appearance-none bg-gray-50 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
          >
            <option value="" disabled>
              {roomsLoading ? "Loading rooms..." : "Select a room"}
            </option>
            {rooms.map((room) => (
              <option key={room.id} value={room.name}>
                {room.name}
              </option>
            ))}
          </select>
          {roomsLoading
            ? <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 animate-spin" />
            : <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none h-5 w-5" />
          }
        </div>
      </div>

      {/* Remark */}
      <div className="space-y-2">
        <Label htmlFor="wizard-remark">Remark</Label>
        <Input
          id="wizard-remark"
          {...register("remark")}
          placeholder="Enter any remarks or notes"
          className="rounded-xl"
        />
      </div>
    </div>
  );
}
