"use client";
import { useRef, useCallback, useState, useEffect } from "react";
import {
  Calendar,
  ChevronDown,
  ChevronUp,
  Filter,
  X,
  Search,
} from "lucide-react";

import { useForm } from "react-hook-form";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "use-debounce";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar22 } from "@/components/shared/schedule/date-picker";
import { searchStudents, searchCourses, getAllRooms } from "@/lib/api";
import { Student } from "@/app/types/student.type";
import { Course } from "@/app/types/course.type";
import { Room } from "@/app/types/room.type";
import { showToast } from "@/lib/toast";

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
  { value: "time_asc", label: "Time (Ascending)" },
  { value: "time_desc", label: "Time (Descending)" },
  { value: "student_asc", label: "Student Name (A-Z)" },
  { value: "student_desc", label: "Student Name (Z-A)" },
  { value: "teacher_asc", label: "Teacher Name (A-Z)" },
  { value: "teacher_desc", label: "Teacher Name (Z-A)" },
  { value: "room_asc", label: "Room (A-Z)" },
  { value: "room_desc", label: "Room (Z-A)" },
];

const ROOM_OPTIONS = [
  { value: "all", label: "All Rooms" },
];

interface ScheduleFilterFormProps {
  hideTeacherField?: boolean;
  defaultTeacherName?: string;
}

export function ScheduleFilterForm({
  hideTeacherField = false,
  defaultTeacherName = "",
}: ScheduleFilterFormProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  // Student search state
  const [studentSearchResults, setStudentSearchResults] = useState<Student[]>(
    []
  );
  const [showStudentResults, setShowStudentResults] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [studentQuery, setStudentQuery] = useState("");

  // Course search state
  const [courseSearchResults, setCourseSearchResults] = useState<Course[]>([]);
  const [showCourseResults, setShowCourseResults] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [courseQuery, setCourseQuery] = useState("");

  // Room state
  const [rooms, setRooms] = useState<Room[]>([]);
  const [roomOptions, setRoomOptions] = useState(ROOM_OPTIONS);

  // Debounce the search queries
  const [debouncedStudentQuery] = useDebounce(studentQuery, 300);
  const [debouncedCourseQuery] = useDebounce(courseQuery, 300);

  const { register, handleSubmit, setValue, watch, reset } = useForm({
    defaultValues: {
      startDate: searchParams.get("startDate") || "",
      endDate: searchParams.get("endDate") || "",
      studentName: searchParams.get("studentName") || "",
      teacherName: searchParams.get("teacherName") || defaultTeacherName,
      courseName: searchParams.get("courseName") || "",
      attendanceStatus: searchParams.get("attendanceStatus") || "",
      classStatus: searchParams.get("classStatus") || "",
      room: searchParams.get("room") || "",
      sort: searchParams.get("sort") || "date_asc",
      classOption: searchParams.get("classOption") || "",
    },
  });

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

  // Effect to handle debounced student search
  useEffect(() => {
    const performStudentSearch = async () => {
      if (debouncedStudentQuery.length >= 2) {
        try {
          const results = await searchStudents(debouncedStudentQuery, "name");
          setStudentSearchResults(results || []);
          setShowStudentResults(true);
        } catch (error) {
          console.error("Student search failed:", error);
          setStudentSearchResults([]);
          setShowStudentResults(false);
        }
      } else {
        setStudentSearchResults([]);
        setShowStudentResults(false);
        if (debouncedStudentQuery.length === 0) {
          setSelectedStudent(null);
        }
      }
    };

    performStudentSearch();
  }, [debouncedStudentQuery]);

  // Effect to handle debounced course search
  useEffect(() => {
    const performCourseSearch = async () => {
      if (debouncedCourseQuery.length >= 2) {
        try {
          const results = await searchCourses(debouncedCourseQuery);
          setCourseSearchResults(results || []);
          setShowCourseResults(true);
        } catch (error) {
          console.error("Course search failed:", error);
          setCourseSearchResults([]);
          setShowCourseResults(false);
        }
      } else {
        setCourseSearchResults([]);
        setShowCourseResults(false);
        if (debouncedCourseQuery.length === 0) {
          setSelectedCourse(null);
        }
      }
    };

    performCourseSearch();
  }, [debouncedCourseQuery]);

  // Effect to fetch rooms
  useEffect(() => {
    const fetchRooms = async () => {
      try {
        const roomList = await getAllRooms();
        setRooms(roomList);
        const dynamicRoomOptions = [
          { value: "all", label: "All Rooms" },
          ...roomList.map(room => ({
            value: room.name,
            label: room.name
          }))
        ];
        setRoomOptions(dynamicRoomOptions);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
        // Keep default room options on error
      }
    };

    fetchRooms();
  }, []);

  // Student search handlers
  const handleStudentSearch = (query: string) => {
    setStudentQuery(query);
    setValue("studentName", query);
  };

  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    setValue("studentName", student.name);
    setStudentQuery(student.name);
    setShowStudentResults(false);
    setStudentSearchResults([]);
  };

  const handleStudentInputBlur = () => {
    setTimeout(() => {
      setShowStudentResults(false);
    }, 200);
  };

  // Course search handlers
  const handleCourseSearch = (query: string) => {
    setCourseQuery(query);
    setValue("courseName", query);
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setValue("courseName", course.title);
    setCourseQuery(course.title);
    setShowCourseResults(false);
    setCourseSearchResults([]);
  };

  const handleCourseInputBlur = () => {
    setTimeout(() => {
      setShowCourseResults(false);
    }, 200);
  };

  const onSubmit = useCallback(
    async (data: ScheduleFilterFormData) => {
      setLoading(true);

      // Validate that start date is not greater than end date
      if (data.startDate && data.endDate) {
        const startDate = new Date(data.startDate);
        const endDate = new Date(data.endDate);

        if (startDate > endDate) {
          showToast.error("Start date cannot be greater than end date");
          setLoading(false);
          return;
        }
      }

      const params = new URLSearchParams();

      // Always reset to page 1 when filtering
      params.delete("page");

      if (data.startDate) params.set("startDate", data.startDate);
      if (data.endDate) params.set("endDate", data.endDate);
      if (data.studentName) params.set("studentName", data.studentName);
      if (data.teacherName || defaultTeacherName)
        params.set("teacherName", data.teacherName || defaultTeacherName);
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
    [router, pathname, defaultTeacherName]
  );

  const handleClearFilters = useCallback(() => {
    reset({
      startDate: "",
      endDate: "",
      studentName: "",
      teacherName: defaultTeacherName,
      courseName: "",
      attendanceStatus: "",
      classStatus: "",
      room: "",
      sort: "date_asc",
    });
    // Clear search states
    setStudentQuery("");
    setCourseQuery("");
    setSelectedStudent(null);
    setSelectedCourse(null);
    setStudentSearchResults([]);
    setCourseSearchResults([]);
    setShowStudentResults(false);
    setShowCourseResults(false);
    router.replace(pathname);
  }, [reset, router, pathname, defaultTeacherName]);

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
            {/* Start Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Calendar22
                date={
                  watch("startDate") ? new Date(watch("startDate")) : undefined
                }
                onChange={(date) =>
                  setValue(
                    "startDate",
                    date ? date.toLocaleDateString("en-CA") : ""
                  )
                }
              />
            </div>

            {/* End Date */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="endDate">End Date</Label>
              <Calendar22
                date={watch("endDate") ? new Date(watch("endDate")) : undefined}
                onChange={(date) =>
                  setValue(
                    "endDate",
                    date ? date.toLocaleDateString("en-CA") : ""
                  )
                }
              />
            </div>

            {/* Student Name */}
            <div className="flex flex-col gap-2 relative">
              <Label htmlFor="studentName">Student</Label>
              <div className="relative">
                <Input
                  id="studentName"
                  value={studentQuery}
                  onChange={(e) => handleStudentSearch(e.target.value)}
                  onBlur={handleStudentInputBlur}
                  placeholder="Search for a student"
                  className="border-gray-300 pr-10"
                  autoComplete="off"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />

                {showStudentResults && studentSearchResults.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
                    {studentSearchResults.map((student) => (
                      <li
                        key={student.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectStudent(student);
                        }}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        {student.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Teacher Name - conditionally rendered */}
            {!hideTeacherField && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="teacherName">Teacher</Label>
                <Input
                  id="teacherName"
                  {...register("teacherName")}
                  placeholder="Enter teacher's name"
                  className="border-gray-300"
                />
              </div>
            )}

            {/* Course Name */}
            <div className="flex flex-col gap-2 relative">
              <Label htmlFor="courseName">Course</Label>
              <div className="relative">
                <Input
                  id="courseName"
                  value={courseQuery}
                  onChange={(e) => handleCourseSearch(e.target.value)}
                  onBlur={handleCourseInputBlur}
                  placeholder="Search for a course"
                  className="border-gray-300 pr-10"
                  autoComplete="off"
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />

                {showCourseResults && courseSearchResults.length > 0 && (
                  <ul className="absolute z-10 bg-white border border-gray-200 shadow w-full rounded mt-1 max-h-48 overflow-y-auto">
                    {courseSearchResults.map((course) => (
                      <li
                        key={course.id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSelectCourse(course);
                        }}
                        className="px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer"
                      >
                        {course.title}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
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
                    {roomOptions.map((opt) => (
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
