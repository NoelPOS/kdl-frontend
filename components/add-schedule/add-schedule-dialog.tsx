"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Search, Calendar, Clock, ChevronDown } from "lucide-react";
import { useEffect, useRef } from "react";

export type FormData = {
  date: string;
  time: string;
  course: string;
  teacher: string;
  student: string;
  room: string;
  nickname: string;
  class: string;
  studentId: string;
  remark: string;
  status?: string;
};

interface AddScheduleProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Partial<FormData>;
  isEditMode?: boolean;
  handleNewClick?: () => void; // optional prop for handling new click
}

export function AddSchedule({
  open,
  onOpenChange,
  initialData,
  isEditMode = false,
  handleNewClick,
}: AddScheduleProps) {
  const { register, handleSubmit, reset } = useForm<FormData>({
    defaultValues: {
      date: "",
      time: "",
      course: "",
      teacher: "",
      student: "",
      room: "",
      nickname: "",
      class: "",
      studentId: "",
      remark: "",
    },
  });

  const { ref: dateRHFRef } = register("date");

  const { ref: timeRHFRef } = register("time");

  useEffect(() => {
    console.log("Initial Data:", initialData);

    if (initialData && isEditMode) {
      initialData.date = initialData.date
        ? new Date(new Date(initialData.date).getTime() + 24 * 60 * 60 * 1000)
            .toISOString()
            .split("T")[0]
        : "";
      reset(initialData);
    } else {
      // Reset to default values for new entries
      reset({
        date: "",
        time: "",
        course: "",
        teacher: "",
        student: "",
        room: "",
        nickname: "",
        class: "",
        studentId: "",
        remark: "",
        status: "",
      });
    }
  }, [initialData, reset, isEditMode]);

  const dateRef = useRef<HTMLInputElement>(null);
  const timeRef = useRef<HTMLInputElement>(null);

  const onSubmit = (data: FormData) => {
    console.log("Schedule Submitted:", data);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" onClick={handleNewClick}>
          <Plus className="h-4 w-4 mr-2" />
          New
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[700px] p-8">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Add New Class Schedule
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
                  defaultValue="NSC"
                  className="border-black "
                />

                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
              </div>
            </div>

            {/* Time */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="time">Time</Label>
              <div
                className="relative"
                onClick={() => timeRef.current?.showPicker()}
              >
                <Input
                  id="time"
                  type="time"
                  {...register("time")}
                  ref={(e) => {
                    timeRHFRef(e); // connect RHF ref
                    timeRef.current = e; // also assign to your own ref
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
                  <option value="Mr. Smith">Mr. Smith</option>
                  <option value="Ms. Daisy">Ms. Daisy</option>
                  <option value="Dr. Brown">Dr. Brown</option>
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
                placeholder="Enter nickname "
              />
            </div>

            {/* Class */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="class">Class</Label>
              <Input
                id="class"
                {...register("class")}
                className="border-black"
                placeholder="Enter class number"
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
            {isEditMode && (
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
                    <option value="Confirmed">Confirmed</option>
                    <option value="Completed">Completed</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black pointer-events-none" />
                </div>
              </div>
            )}
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
export default AddSchedule;
