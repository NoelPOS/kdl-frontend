"use client";
import { useRef, useCallback, useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Calendar, ChevronDown, ChevronUp, Filter, X } from "lucide-react";
import { Button } from "../ui/button";
import { useForm } from "react-hook-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { cn } from "@/lib/utils";

// Define the form data type
type ScheduleFilterFormData = {
  startDate?: string;
  endDate?: string;
  studentName?: string;
  teacherName?: string;
  courseName?: string;
  attendanceStatus?: string;
  room?: string;
  sessionMode?: string;
  sort?: string;
  classOption?: string;
};

const ATTENDANCE_STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const CLASS_TYPE_OPTIONS = [
  { value: "all", label: "All" },
  { value: "12 times check", label: "12 Times Check" },
  { value: "12 times fixed", label: "12 Times Fixed" },
  { value: "5 days camp", label: "5 Days Camp" },
  { value: "2 days camp", label: "2 Days Camp" },
];

const SORT_OPTIONS = [
  { value: "date_asc", label: "Date (Ascending)" },
  { value: "date_desc", label: "Date (Descending)" },
  { value: "student_asc", label: "Student Name (A-Z)" },
  { value: "student_desc", label: "Student Name (Z-A)" },
  { value: "teacher_asc", label: "Teacher Name (A-Z)" },
  { value: "teacher_desc", label: "Teacher Name (Z-A)" },
  { value: "room_asc", label: "Room (A-Z)" },
  { value: "room_desc", label: "Room (Z-A)" },
];

const ROOM_OPTIONS = [
  { value: "all", label: "All Rooms" },
  { value: "Room 1", label: "Room 1" },
  { value: "Room 2", label: "Room 2" },
  { value: "Room 3", label: "Room 3" },
  { value: "Room 4", label: "Room 4" },
  { value: "Room 5", label: "Room 5" },
];

export function ScheduleFilterForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      studentName: searchParams.get("studentName") || "",
      teacherName: searchParams.get("teacherName") || "",
      courseName: searchParams.get("courseName") || "",
      attendanceStatus: searchParams.get("attendanceStatus") || "",
      classStatus: searchParams.get("classStatus") || "",
      room: searchParams.get("room") || "",
      sort: searchParams.get("sort") || "date_asc",
      classOption: searchParams.get("classOption") || "",
    },
  });

  const startDateRef = useRef<HTMLInputElement>(null);
  const endDateRef = useRef<HTMLInputElement>(null);
  const { ref: startDateRHFRef } = register("startDate");
  const { ref: endDateRHFRef } = register("endDate");

  // Watch values for controlled Selects
  const attendanceStatus = watch("attendanceStatus");
  const sort = watch("sort");
  const room = watch("room");
  const classOption = watch("classOption");

  // Watch all form values to show active filter count
  const formValues = watch();

  // Calculate active filters count (excluding sort as it always has a default)
  const activeFiltersCount = Object.entries(formValues).filter(
    ([key, value]) => key !== "sort" && value && value.toString().trim() !== ""
  ).length;

  const onSubmit = useCallback(
    async (data: ScheduleFilterFormData) => {
      setLoading(true);
      const params = new URLSearchParams();

      // Always reset to page 1 when filtering
      params.delete("page");

      if (data.startDate) params.set("startDate", data.startDate);
      if (data.endDate) params.set("endDate", data.endDate);
      if (data.studentName) params.set("studentName", data.studentName);
      if (data.teacherName) params.set("teacherName", data.teacherName);
      if (data.courseName) params.set("courseName", data.courseName);
      if (data.attendanceStatus)
        params.set("attendanceStatus", data.attendanceStatus);
      if (data.room && data.room !== "all") params.set("room", data.room);
      if (data.sessionMode) params.set("sessionMode", data.sessionMode);
      if (data.sort) params.set("sort", data.sort);
      if (data.classOption && data.classOption !== "all")
        params.set("classOption", data.classOption);
      router.replace(
        `${pathname}${params.toString() ? `?${params.toString()}` : ""}`
      );

      setLoading(false);
    },
    [router, pathname]
  );

  const handleClearFilters = useCallback(() => {
    reset({
      startDate: "",
      endDate: "",
      studentName: "",
      teacherName: "",
      courseName: "",
      attendanceStatus: "",
      classStatus: "",
      room: "",
      sort: "date_asc",
    });
    router.replace(pathname);
  }, [reset, router, pathname]);

  return (
    <div className="mb-5 border border-gray-200 rounded-lg bg-white shadow-sm">
      {/* Filter Header */}
      <div
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <Filter className="h-5 w-5 text-gray-600" />
          <div className="flex items-center gap-2">
            <span className="font-medium text-gray-900">Filters</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                handleClearFilters();
              }}
              className="text-gray-500 hover:text-gray-700 h-8 px-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="h-5 w-5 text-gray-600" />
          ) : (
            <ChevronDown className="h-5 w-5 text-gray-600" />
          )}
        </div>
      </div>

      {/* Filter Content */}
      <div
        className={cn(
          "transition-all duration-300 ease-in-out overflow-hidden",
          isExpanded ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
        )}
      >
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="p-4 pt-0 border-t border-gray-100"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
            {/* Date Range */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <div
                className="relative cursor-pointer"
                onClick={() => startDateRef.current?.showPicker()}
              >
                <Input
                  id="startDate"
                  type="date"
                  {...register("startDate")}
                  ref={(e) => {
                    startDateRHFRef(e);
                    startDateRef.current = e;
                  }}
                  className="border-gray-300 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <div
                className="relative cursor-pointer"
                onClick={() => endDateRef.current?.showPicker()}
              >
                <Input
                  id="endDate"
                  type="date"
                  {...register("endDate")}
                  ref={(e) => {
                    endDateRHFRef(e);
                    endDateRef.current = e;
                  }}
                  className="border-gray-300 pr-10"
                />
                <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Student Name */}
            <div className="flex flex-col gap-2 relative">
              <Label htmlFor="studentName">Student</Label>
              <Input
                id="studentName"
                {...register("studentName")}
                placeholder="Enter student's name"
                className="border-gray-300"
              />
            </div>

            {/* Teacher Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="teacherName">Teacher</Label>
              <Input
                id="teacherName"
                {...register("teacherName")}
                placeholder="Enter teacher's name"
                className="border-gray-300"
              />
            </div>

            {/* Course Name */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="courseName">Course</Label>
              <Input
                id="courseName"
                {...register("courseName")}
                placeholder="Enter course name"
                className="border-gray-300"
              />
            </div>

            {/* Attendance Status */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="attendanceStatus">Attendance Status</Label>
              <div className="w-full">
                <Select
                  value={attendanceStatus}
                  onValueChange={(v) => setValue("attendanceStatus", v)}
                >
                  <SelectTrigger id="attendanceStatus" className="w-full">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTENDANCE_STATUS_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Sort */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="sort">Sort By</Label>
              <div className="w-full">
                <Select value={sort} onValueChange={(v) => setValue("sort", v)}>
                  <SelectTrigger id="sort" className="w-full">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    {SORT_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Room */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="room">Room</Label>
              <div className="w-full">
                <Select value={room} onValueChange={(v) => setValue("room", v)}>
                  <SelectTrigger id="room" className="w-full">
                    <SelectValue placeholder="Select room" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROOM_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Class Type */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="classOption">Class Type</Label>
              <div className="w-full">
                <Select
                  value={classOption}
                  onValueChange={(v) => setValue("classOption", v)}
                >
                  <SelectTrigger id="classOption" className="w-full">
                    <SelectValue placeholder="Select class type" />
                  </SelectTrigger>
                  <SelectContent>
                    {CLASS_TYPE_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 mt-4">
            <Button
              type="submit"
              className="bg-yellow-500 text-white hover:bg-yellow-600 px-6"
              disabled={loading}
            >
              {loading ? "Filtering..." : "Apply Filters"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
