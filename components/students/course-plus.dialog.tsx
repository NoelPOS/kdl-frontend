"use client";

import { useRef, useState, useMemo, useEffect } from "react";
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
import { Clock, Plus, ChevronDown, Loader2 } from "lucide-react";
import { formatDateLocal, generateCalendarDays } from "@/lib/utils";
import { getTeacherByCourseId, checkScheduleConflicts } from "@/lib/axio";

interface CoursePlusFormData {
  numberOfClasses: number;
  amount: number;
  description: string;
  selectedDates: string[];
  startTime: string;
  endTime: string;
  teacherId: number;
  teacherName: string;
  room: string;
  payment: boolean;
}

interface ScheduleConflictCheck {
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  teacherId: number;
  studentId: number;
}

interface ConflictDetail {
  conflictType: string;
  courseTitle: string;
  teacherName: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
}

interface ScheduleRow {
  date: string;
  time: string;
  teacher: string;
  room: string;
  warning: string;
  canEdit?: boolean;
}

interface Teacher {
  id: number;
  name: string;
}

interface SubmissionData {
  sessionId: number;
  classNo: number;
  amount: number;
  payment: boolean;
  description: string;
  schedules: Array<{
    date: string;
    startTime: string;
    endTime: string;
    teacherId: number;
    room: string;
    courseId: number;
    studentId: number;
    attendance: string;
    remark: string;
    warning: string;
    feedback: string;
    verifyFb: boolean;
    classNumber: number;
  }>;
}

const CoursePlusDialog = () => {
  const [step, setStep] = useState<"form" | "calendar" | "confirm" | "preview">(
    "form"
  );
  const [open, setOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [selectedDates, setSelectedDates] = useState<string[]>([]);
  const [scheduleRows, setScheduleRows] = useState<ScheduleRow[]>([]);
  const [formData, setFormData] = useState<Partial<CoursePlusFormData>>({});
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isCheckingConflicts, setIsCheckingConflicts] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CoursePlusFormData>({
    defaultValues: {
      numberOfClasses: 1,
      amount: 0,
      description: "",
      selectedDates: [],
      startTime: "",
      endTime: "",
      teacherId: 0,
      teacherName: "",
      room: "",
      payment: false,
    },
  });

  const startTimeRef = useRef<HTMLInputElement>(null);
  const endTimeRef = useRef<HTMLInputElement>(null);

  const numberOfClasses = watch("numberOfClasses");

  // Load teachers based on course ID (assuming it's available via URL or context)
  useEffect(() => {
    const loadTeachers = async () => {
      try {
        // TODO: Get courseId from URL parameters or context
        const courseId = 1; // Placeholder - replace with actual courseId
        const teacherList = await getTeacherByCourseId(courseId);
        setTeachers(teacherList);
      } catch (error) {
        console.error("Failed to load teachers:", error);
      }
    };

    if (open) {
      loadTeachers();
    }
  }, [open]);

  // Generate calendar days for the current month
  const calendarDays = useMemo(
    () => generateCalendarDays(currentMonth),
    [currentMonth]
  );

  // Navigate to previous/next month
  const navigateMonth = (direction: "prev" | "next") => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(newMonth.getMonth() + (direction === "next" ? 1 : -1));
    setCurrentMonth(newMonth);
  };

  // Handle date selection for calendar
  const toggleDate = (date: string) => {
    if (
      selectedDates.length >= numberOfClasses &&
      !selectedDates.includes(date)
    ) {
      alert(`You can only select ${numberOfClasses} dates.`);
      return;
    }

    const newSelectedDates = selectedDates.includes(date)
      ? selectedDates.filter((d) => d !== date)
      : [...selectedDates, date];

    setSelectedDates(newSelectedDates);
  };

  // Handle form submission for step 1
  const onFormSubmit = (data: CoursePlusFormData) => {
    console.log("Form Data:", data);
    setFormData(data);
    setStep("calendar");
  };
  const onCalendarComplete = () => {
    if (selectedDates.length !== Number(numberOfClasses)) {
      alert(`Please select exactly ${numberOfClasses} dates.`);
      return;
    }
    setStep("confirm");
  };

  // Handle confirm step completion - go to preview
  const onConfirmComplete = async (data: CoursePlusFormData) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setIsCheckingConflicts(true);

    // Generate initial schedule rows
    const rows: ScheduleRow[] = selectedDates.map((date) => ({
      date: new Date(date).toLocaleDateString("en-GB"),
      time: `${data.startTime} - ${data.endTime}`,
      teacher: data.teacherName,
      room: data.room,
      warning: "",
      canEdit: true,
    }));

    setScheduleRows(rows);
    setStep("preview");

    // Automatically check for conflicts when entering preview
    try {
      const schedulesToCheck: ScheduleConflictCheck[] = selectedDates.map(
        (date) => ({
          date,
          startTime: data.startTime,
          endTime: data.endTime,
          room: data.room,
          teacherId: data.teacherId,
          studentId: 1, // TODO: Get from current student context
        })
      );

      const conflicts = await checkScheduleConflicts({
        schedules: schedulesToCheck,
      });

      // Update rows with conflict warnings
      const updatedRows: ScheduleRow[] = selectedDates.map((date) => {
        const conflict = conflicts.find((c) => c.date === date);
        return {
          date: new Date(date).toLocaleDateString("en-GB"),
          time: `${data.startTime} - ${data.endTime}`,
          teacher: data.teacherName,
          room: data.room,
          warning: conflict ? generateConflictWarning(conflict) : "",
          canEdit: true,
        };
      });

      setScheduleRows(updatedRows);
    } catch (error) {
      console.error("Error checking conflicts automatically:", error);
      // Still proceed to preview even if conflict checking fails
    } finally {
      setIsCheckingConflicts(false);
    }
  };

  // Handle schedule submission (final step)
  const onScheduleSubmit = async () => {
    try {
      // Prepare final submission data
      const submissionData: SubmissionData = {
        sessionId: 1, // TODO: Get from URL or context
        classNo: formData.numberOfClasses || 0,
        amount: formData.amount || 0,
        payment: formData.payment || false,
        description: formData.description || "",
        schedules: scheduleRows.map((row, index) => ({
          date: new Date(selectedDates[index]).toISOString(),
          startTime: formData.startTime || "",
          endTime: formData.endTime || "",
          teacherId: formData.teacherId || 0,
          room: row.room,
          courseId: 1, // TODO: Get from URL or context
          studentId: 1, // TODO: Get from URL or context
          attendance: "pending",
          remark: "",
          warning: row.warning,
          feedback: "",
          verifyFb: false,
          classNumber: index + 1,
        })),
      };

      console.log("Final Submission Data:", submissionData);

      // TODO: Submit to API
      // await submitCoursePlus(submissionData);

      alert("Course plus successfully submitted!");

      // Reset form and close dialog
      reset();
      setSelectedDates([]);
      setScheduleRows([]);
      setFormData({});
      setStep("form");
      setOpen(false);
    } catch (error) {
      console.error("Error submitting course plus:", error);
      alert("Failed to submit course plus data. Check console for details.");
    }
  };

  // Generate conflict warning message
  const generateConflictWarning = (conflict: ConflictDetail) => {
    const { conflictType, courseTitle, teacherName, studentName } = conflict;

    switch (conflictType) {
      case "room":
        return `Room conflict with ${courseTitle}`;
      case "teacher":
        return `Teacher conflict with ${teacherName}`;
      case "student":
        return `Student conflict with ${studentName} in ${courseTitle}`;
      case "room_teacher":
        return `Room and teacher conflict with ${courseTitle} / ${teacherName}`;
      case "room_student":
        return `Room and student conflict with ${courseTitle} / ${studentName}`;
      case "teacher_student":
        return `Teacher and student conflict with ${teacherName} / ${studentName} in ${courseTitle}`;
      case "all":
        return `Room, teacher, and student conflict with ${courseTitle} / ${teacherName} / ${studentName}`;
      default:
        return `Conflict with ${courseTitle}`;
    }
  };

  // Handle back button
  const handleBack = () => {
    if (step === "calendar") {
      setStep("form");
    } else if (step === "confirm") {
      setStep("calendar");
    } else if (step === "preview") {
      setStep("confirm");
    }
  };

  // Reset when dialog closes
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setStep("form");
      setSelectedDates([]);
      setScheduleRows([]);
      setFormData({});
      reset();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="bg-yellow-400 hover:bg-yellow-500 text-black border-yellow-500"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[800px] lg:max-w-[900px] p-0 rounded-3xl overflow-hidden max-h-[85vh] overflow-y-auto">
        <div className="bg-white p-6">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {step === "form" && "Add Additional Classes"}
              {step === "calendar" && "Select Class Dates"}
              {step === "confirm" && "Set Schedule Details"}
              {step === "preview" && "Preview & Confirm Schedule"}
            </DialogTitle>
          </DialogHeader>

          {/* Step 1: Form Inputs */}
          {step === "form" && (
            <form onSubmit={handleSubmit(onFormSubmit)} className="mt-6">
              <div className="space-y-4">
                {/* Number of Additional Classes */}
                <div className="space-y-2">
                  <Label
                    htmlFor="numberOfClasses"
                    className="text-sm font-medium"
                  >
                    Number of Additional Classes
                  </Label>
                  <Input
                    id="numberOfClasses"
                    type="number"
                    min="1"
                    max="20"
                    {...register("numberOfClasses", {
                      required: "Number of classes is required",
                      min: { value: 1, message: "Must be at least 1" },
                      max: { value: 20, message: "Cannot exceed 20" },
                    })}
                    className="border-gray-300"
                  />
                  {errors.numberOfClasses && (
                    <p className="text-red-500 text-sm">
                      {errors.numberOfClasses.message}
                    </p>
                  )}
                </div>

                {/* Amount */}
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-sm font-medium">
                    Amount for Classes ($)
                  </Label>
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    {...register("amount", {
                      required: "Amount is required",
                      min: { value: 0, message: "Amount must be positive" },
                    })}
                    className="border-gray-300"
                  />
                  {errors.amount && (
                    <p className="text-red-500 text-sm">
                      {errors.amount.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Description
                  </Label>
                  <Input
                    id="description"
                    {...register("description", {
                      required: "Description is required",
                    })}
                    className="border-gray-300"
                    placeholder="Enter description for the additional classes..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm">
                      {errors.description.message}
                    </p>
                  )}
                </div>
              </div>

              <DialogFooter className="flex justify-between gap-4 mt-8 px-0">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 rounded-full flex-1"
                  >
                    Cancel
                  </Button>
                </DialogClose>
                <Button
                  type="submit"
                  className="bg-blue-500 text-white hover:bg-blue-600 rounded-full flex-1"
                >
                  Next: Select Dates
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 2: Calendar Selection */}
          {step === "calendar" && (
            <div className="mt-6">
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-600">
                    Select {numberOfClasses} dates for your additional classes
                  </p>
                  <p className="text-sm font-medium">
                    Selected: {selectedDates.length}/{numberOfClasses}
                  </p>
                </div>

                {/* Calendar */}
                <div className="border border-gray-300 rounded-lg p-3 bg-white">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-3">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("prev")}
                    >
                      ←
                    </Button>
                    <h4 className="font-medium">
                      {currentMonth.toLocaleDateString("en-US", {
                        month: "long",
                        year: "numeric",
                      })}
                    </h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => navigateMonth("next")}
                    >
                      →
                    </Button>
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-xs font-medium text-gray-500 p-2"
                        >
                          {day}
                        </div>
                      )
                    )}
                    {calendarDays.map((date, index) => {
                      const dateStr = formatDateLocal(date);
                      const isCurrentMonth =
                        date.getMonth() === currentMonth.getMonth();
                      const isSelected = selectedDates.includes(dateStr);
                      const isToday =
                        date.toDateString() === new Date().toDateString();

                      return (
                        <Button
                          key={index}
                          type="button"
                          variant="ghost"
                          size="sm"
                          className={`h-8 w-8 p-0 text-xs ${
                            !isCurrentMonth
                              ? "text-gray-300 hover:bg-transparent cursor-default"
                              : isSelected
                              ? "bg-blue-400 text-white hover:bg-blue-500"
                              : isToday
                              ? "bg-blue-100 text-blue-600"
                              : "hover:bg-gray-100"
                          }`}
                          onClick={() => isCurrentMonth && toggleDate(dateStr)}
                          disabled={!isCurrentMonth}
                        >
                          {date.getDate()}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {selectedDates.length > 0 && (
                  <div className="text-sm text-gray-600">
                    Selected dates:{" "}
                    {selectedDates
                      .map((date) => new Date(date).toLocaleDateString("en-GB"))
                      .join(", ")}
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between gap-4 mt-8 px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={onCalendarComplete}
                  className="bg-blue-500 text-white hover:bg-blue-600 rounded-full flex-1"
                  disabled={selectedDates.length !== Number(numberOfClasses)}
                >
                  Next: Set Schedule
                </Button>
              </DialogFooter>
            </div>
          )}

          {/* Step 3: Schedule Details */}
          {step === "confirm" && (
            <form onSubmit={handleSubmit(onConfirmComplete)} className="mt-6">
              <div className="space-y-4">
                {/* Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startTime" className="text-sm font-medium">
                      Start Time
                    </Label>
                    <div
                      className="relative cursor-pointer"
                      onClick={() => startTimeRef.current?.showPicker()}
                    >
                      <Input
                        id="startTime"
                        type="time"
                        {...register("startTime", {
                          required: "Start time is required",
                        })}
                        ref={(e) => {
                          register("startTime").ref(e);
                          startTimeRef.current = e;
                        }}
                        className="border-gray-300 pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.startTime && (
                      <p className="text-red-500 text-sm">
                        {errors.startTime.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endTime" className="text-sm font-medium">
                      End Time
                    </Label>
                    <div
                      className="relative cursor-pointer"
                      onClick={() => endTimeRef.current?.showPicker()}
                    >
                      <Input
                        id="endTime"
                        type="time"
                        {...register("endTime", {
                          required: "End time is required",
                        })}
                        ref={(e) => {
                          register("endTime").ref(e);
                          endTimeRef.current = e;
                        }}
                        className="border-gray-300 pr-10"
                      />
                      <Clock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                    </div>
                    {errors.endTime && (
                      <p className="text-red-500 text-sm">
                        {errors.endTime.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Teacher Selection */}
                <div className="space-y-2">
                  <Label htmlFor="teacherId" className="text-sm font-medium">
                    Teacher
                  </Label>
                  <div className="relative">
                    <select
                      id="teacherId"
                      {...register("teacherId", {
                        required: "Teacher selection is required",
                        valueAsNumber: true,
                      })}
                      onChange={(e) => {
                        const selectedTeacher = teachers.find(
                          (t) => t.id === Number(e.target.value)
                        );
                        if (selectedTeacher) {
                          setValue("teacherName", selectedTeacher.name);
                        }
                      }}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm pr-10"
                    >
                      <option value="">Select a teacher</option>
                      {teachers.map((teacher) => (
                        <option key={teacher.id} value={teacher.id}>
                          {teacher.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.teacherId && (
                    <p className="text-red-500 text-sm">
                      {errors.teacherId.message}
                    </p>
                  )}
                </div>

                {/* Room Selection */}
                <div className="space-y-2">
                  <Label htmlFor="room" className="text-sm font-medium">
                    Room
                  </Label>
                  <div className="relative">
                    <select
                      id="room"
                      {...register("room", {
                        required: "Room selection is required",
                      })}
                      className="w-full border border-gray-300 rounded-lg py-2 px-3 text-sm pr-10"
                    >
                      <option value="">Select a room</option>
                      <option value="Online">Online</option>
                      <option value="Room 101">Room 101</option>
                      <option value="Auditorium">Auditorium</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                  </div>
                  {errors.room && (
                    <p className="text-red-500 text-sm">
                      {errors.room.message}
                    </p>
                  )}
                </div>

                {/* Payment Status */}
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="payment"
                      {...register("payment")}
                      className="rounded border-gray-300"
                    />
                    <Label htmlFor="payment" className="text-sm font-medium">
                      Payment Received
                    </Label>
                  </div>
                </div>

                {/* Schedule Preview (if conflicts checked) */}
                {scheduleRows.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Schedule Preview
                    </Label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <table className="w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-3 py-2 text-left">Date</th>
                            <th className="px-3 py-2 text-left">Time</th>
                            <th className="px-3 py-2 text-left">Teacher</th>
                            <th className="px-3 py-2 text-left">Room</th>
                            <th className="px-3 py-2 text-left">Warning</th>
                          </tr>
                        </thead>
                        <tbody>
                          {scheduleRows.map((row, index) => (
                            <tr key={index} className="border-t">
                              <td className="px-3 py-2">{row.date}</td>
                              <td className="px-3 py-2">{row.time}</td>
                              <td className="px-3 py-2">{row.teacher}</td>
                              <td className="px-3 py-2">{row.room}</td>
                              <td className="px-3 py-2">
                                {row.warning && (
                                  <span className="text-red-600 text-xs">
                                    {row.warning}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              <DialogFooter className="flex justify-between gap-4 mt-8 px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full flex-1"
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500 text-white hover:bg-blue-600 rounded-full flex-1"
                >
                  Next: Preview Schedule
                </Button>
              </DialogFooter>
            </form>
          )}

          {/* Step 4: Preview & Final Submission */}
          {step === "preview" && (
            <div className="mt-6">
              <div className="space-y-4">
                {/* Course Plus Summary */}
                <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                  <h3 className="font-medium text-gray-900">
                    Additional Classes Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Number of Classes:</span>
                      <span className="ml-2 font-medium">
                        {formData.numberOfClasses}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Amount:</span>
                      <span className="ml-2 font-medium">
                        ${formData.amount}
                      </span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-600">Description:</span>
                      <span className="ml-2 font-medium">
                        {formData.description}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Payment Status:</span>
                      <span
                        className={`ml-2 font-medium ${
                          formData.payment ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {formData.payment ? "Paid" : "Pending"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Schedule Table - View Only */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Schedule Details
                  </Label>
                  {isCheckingConflicts ? (
                    <div className="flex items-center justify-center py-8 text-sm text-gray-500">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Checking for schedule conflicts...
                    </div>
                  ) : (
                    <>
                      <p className="text-xs text-gray-500">
                        Review the schedule details below. Conflicts are
                        automatically checked.
                      </p>
                      <div className="border border-gray-300 rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">Date</th>
                              <th className="px-3 py-2 text-left">Time</th>
                              <th className="px-3 py-2 text-left">Teacher</th>
                              <th className="px-3 py-2 text-left">Room</th>
                              <th className="px-3 py-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {scheduleRows.map((row, index) => (
                              <tr key={index} className="border-t">
                                <td className="px-3 py-2">{row.date}</td>
                                <td className="px-3 py-2">{row.time}</td>
                                <td className="px-3 py-2">{row.teacher}</td>
                                <td className="px-3 py-2">{row.room}</td>
                                <td className="px-3 py-2">
                                  {row.warning ? (
                                    <span className="text-red-600 text-xs font-medium">
                                      ⚠ {row.warning}
                                    </span>
                                  ) : (
                                    <span className="text-green-600 text-xs font-medium">
                                      ✓ Available
                                    </span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <DialogFooter className="flex justify-between gap-4 mt-8 px-0">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="text-gray-600 border-gray-300 hover:bg-gray-50 rounded-full flex-1"
                >
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={onScheduleSubmit}
                  className="bg-green-500 text-white hover:bg-green-600 rounded-full flex-1"
                >
                  Submit Course Plus
                </Button>
              </DialogFooter>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CoursePlusDialog;
