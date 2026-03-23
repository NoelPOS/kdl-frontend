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
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronDown } from "lucide-react";
import { useTeachersByCourse } from "@/hooks/query/use-teachers";
import { useRoomList } from "@/hooks/query/use-rooms";
import { Teacher } from "@/app/types/teacher.type";
import { Room } from "@/app/types/room.type";
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
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      teacher: "",
      room: "",
      remark: "",
    },
  });

  // Fetch teachers for the selected course
  const { data: teachers = [] } = useTeachersByCourse(
    courseId > 0 ? courseId : undefined,
    { enabled: open && courseId > 0 }
  );

  // Fetch all rooms
  const { data: rooms = [] } = useRoomList();

  const [teacherPickerOpen, setTeacherPickerOpen] = useState(false);
  const [roomPickerOpen, setRoomPickerOpen] = useState(false);

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
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) {
          onCancel();
        }
      }}
      modal={false}
    >
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
            <input
              type="hidden"
              {...register("teacher", { required: "Teacher is required" })}
            />
            <Popover open={teacherPickerOpen} onOpenChange={setTeacherPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={teacherPickerOpen}
                  className="w-full justify-between border-gray-300 font-normal"
                >
                  <span className="truncate">{watch("teacher") || "Select a teacher"}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search teacher..." />
                  <CommandList>
                    <CommandEmpty>No teacher found.</CommandEmpty>
                    <CommandGroup>
                      {teachers.map((teacher) => (
                        <CommandItem
                          key={teacher.id}
                          value={teacher.name}
                          onSelect={() => {
                            setValue("teacher", teacher.name, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                            setTeacherPickerOpen(false);
                          }}
                        >
                          {teacher.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
            {errors.teacher && (
              <p className="text-red-500 text-sm">{errors.teacher.message}</p>
            )}
          </div>

          {/* Room */}
          <div className="space-y-2">
            <Label htmlFor="room">
              Room <span className="text-red-500">*</span>
            </Label>
            <input
              type="hidden"
              {...register("room", { required: "Room is required" })}
            />
            <Popover open={roomPickerOpen} onOpenChange={setRoomPickerOpen}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="outline"
                  role="combobox"
                  aria-expanded={roomPickerOpen}
                  className="w-full justify-between border-gray-300 font-normal"
                >
                  <span className="truncate">{watch("room") || "Select a room"}</span>
                  <ChevronDown className="h-5 w-5 shrink-0 opacity-60" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search room..." />
                  <CommandList>
                    <CommandEmpty>No room found.</CommandEmpty>
                    <CommandGroup>
                      {rooms.map((room) => (
                        <CommandItem
                          key={room.id}
                          value={room.name}
                          onSelect={() => {
                            setValue("room", room.name, {
                              shouldDirty: true,
                              shouldValidate: true,
                            });
                            setRoomPickerOpen(false);
                          }}
                        >
                          {room.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
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
            <Button type="submit" className="bg-yellow-500 hover:bg-yellow-600">
              Next
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
