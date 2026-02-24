"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Trash2, Calendar, Clock, Loader2 } from "lucide-react";
import { Teacher, TeacherAbsence, TeacherAvailabilitySlot } from "@/app/types/teacher.type";
import {
  getTeacherAbsences,
  deleteTeacherAbsence,
  updateTeacherById,
  getTeacherAvailabilitySlots,
  createTeacherAvailabilitySlot,
  deleteTeacherAvailabilitySlot,
} from "@/lib/api";
import { showToast } from "@/lib/toast";
import { EditWorkingDaysDialog } from "../dialogs/edit-working-days-dialog";
import { TeacherAbsenceDialog } from "../dialogs/teacher-absence-dialog";
import { Calendar22 } from "@/components/shared/schedule/date-picker";
import { TimeInput } from "@/components/shared/schedule";
import { useForm } from "react-hook-form";
import { getTimeValidationRules, BUSINESS_HOURS } from "@/lib/validation-utils";

interface TeacherAvailabilityTabProps {
  teacher: Partial<Teacher>;
  onTeacherUpdate?: () => void;
}

const DAYS_OF_WEEK = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export function TeacherAvailabilityTab({
  teacher,
  onTeacherUpdate,
}: TeacherAvailabilityTabProps) {
  const [absences, setAbsences] = useState<TeacherAbsence[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [workingDays, setWorkingDays] = useState<string[]>(
    teacher.workingDays || []
  );
  const [teacherType, setTeacherType] = useState<"full-time" | "part-time">(
    (teacher.teacherType as "full-time" | "part-time") || "full-time"
  );

  // Availability slots state (part-time only)
  const [slots, setSlots] = useState<TeacherAvailabilitySlot[]>([]);
  const [isSlotsLoading, setIsSlotsLoading] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  
  // Custom form for slots since TimeInput works best with react-hook-form
  type SlotFormData = {
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  };
  
  const {
    register: registerSlot,
    handleSubmit: handleSubmitSlot,
    setValue: setSlotValue,
    watch: watchSlot,
    reset: resetSlot,
    formState: { errors: slotErrors },
  } = useForm<SlotFormData>({
    defaultValues: {
      dayOfWeek: "",
      startTime: "",
      endTime: "",
    },
  });

  const slotForm = {
    dayOfWeek: watchSlot("dayOfWeek"),
    startTime: watchSlot("startTime"),
    endTime: watchSlot("endTime")
  }

  // Refs for TimeInput
  const startTimeRef = React.useRef<HTMLInputElement>(null);
  const endTimeRef = React.useRef<HTMLInputElement>(null);

  // Dialogs
  const [isWorkingDaysDialogOpen, setIsWorkingDaysDialogOpen] = useState(false);
  const [isAbsenceDialogOpen, setIsAbsenceDialogOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<TeacherAbsence | null>(
    null
  );

  const loadAbsences = useCallback(async () => {
    if (!teacher.id) return;
    setIsLoading(true);
    try {
      const data = await getTeacherAbsences(teacher.id);
      setAbsences(data);
    } catch (error) {
      console.error("Failed to load absences:", error);
    } finally {
      setIsLoading(false);
    }
  }, [teacher.id]);

  const loadSlots = useCallback(async () => {
    if (!teacher.id) return;
    setIsSlotsLoading(true);
    try {
      const data = await getTeacherAvailabilitySlots(teacher.id);
      setSlots(data);
    } catch (error) {
      console.error("Failed to load availability slots:", error);
    } finally {
      setIsSlotsLoading(false);
    }
  }, [teacher.id]);

  useEffect(() => {
    loadAbsences();
  }, [loadAbsences]);

  useEffect(() => {
    if (teacherType === "part-time") {
      loadSlots();
    }
  }, [teacherType, loadSlots]);

  const handleWorkingDaysSave = async (days: string[], type: string) => {
    if (!teacher.id) return;
    try {
      await updateTeacherById(teacher.id, {
        workingDays: days,
        teacherType: type as "full-time" | "part-time",
      });
      setWorkingDays(days);
      setTeacherType(type as "full-time" | "part-time");
      showToast.success("Working days updated!");
      setIsWorkingDaysDialogOpen(false);
      onTeacherUpdate?.();
    } catch (error) {
      console.error("Failed to update working days:", error);
      showToast.error("Failed to update working days");
    }
  };

  const handleDeleteAbsence = async (absenceId: number) => {
    if (!teacher.id) return;
    if (!confirm("Are you sure you want to delete this absence?")) return;

    try {
      await deleteTeacherAbsence(teacher.id, absenceId);
      showToast.success("Absence deleted!");
      loadAbsences();
    } catch (error) {
      console.error("Failed to delete absence:", error);
      showToast.error("Failed to delete absence");
    }
  };

  const handleAbsenceSaved = () => {
    setIsAbsenceDialogOpen(false);
    setEditingAbsence(null);
    loadAbsences();
  };

  const handleAddSlot = async (data: SlotFormData) => {
    if (!teacher.id) return;
    if (!data.dayOfWeek || !data.startTime || !data.endTime) {
      showToast.error("Please fill in day, start time, and end time.");
      return;
    }
    if (data.startTime >= data.endTime) {
      showToast.error("Start time must be before end time.");
      return;
    }
    setIsAddingSlot(true);
    try {
      await createTeacherAvailabilitySlot(teacher.id, data);
      resetSlot();
      showToast.success("Availability slot added!");
      loadSlots();
    } catch (error) {
      console.error("Failed to add slot:", error);
      showToast.error("Failed to add availability slot");
    } finally {
      setIsAddingSlot(false);
    }
  };

  const handleDeleteSlot = async (slotId: number) => {
    if (!teacher.id) return;
    if (!confirm("Delete this availability slot?")) return;
    try {
      await deleteTeacherAvailabilitySlot(teacher.id, slotId);
      showToast.success("Slot deleted!");
      loadSlots();
    } catch (error) {
      console.error("Failed to delete slot:", error);
      showToast.error("Failed to delete slot");
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Group slots by day for display
  const slotsByDay = slots.reduce<Record<string, TeacherAvailabilitySlot[]>>(
    (acc, slot) => {
      const dayKey = slot.dayOfWeek;
      if (!acc[dayKey]) acc[dayKey] = [];
      acc[dayKey].push(slot);
      return acc;
    },
    {}
  );

  return (
    <div className="space-y-6">
      {/* Teacher Type & Working Days Section */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Work Schedule</h3>
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => setIsWorkingDaysDialogOpen(true)}
          >
            <Pencil className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>

        <div className="space-y-4">
          {/* Teacher Type */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Type:</span>
            <Badge
              variant={teacherType === "full-time" ? "default" : "secondary"}
            >
              {teacherType === "full-time" ? "Full-time" : "Part-time"}
            </Badge>
          </div>

          {/* Working Days (full-time only) */}
          {teacherType === "full-time" && (
            <div>
              <span className="text-sm text-gray-600 block mb-2">
                Working Days:
              </span>
              <div className="flex flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <Badge
                    key={day}
                    variant={workingDays.includes(day) ? "default" : "outline"}
                    className={
                      workingDays.includes(day)
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "text-gray-400"
                    }
                  >
                    {day.substring(0, 3)}
                  </Badge>
                ))}
              </div>
              {workingDays.length === 0 && (
                <p className="text-sm text-gray-400 mt-2">
                  No working days set yet
                </p>
              )}
            </div>
          )}

          {teacherType === "part-time" && (
            <div className="pt-4 border-t mt-4">
              <div className="flex items-center gap-2 mb-4">
                <Clock className="w-5 h-5 text-yellow-500" />
                <h4 className="text-md font-semibold">Hourly Availability Slots</h4>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                Define the specific hours this teacher is available on each date.
                These slots are checked during schedule conflict detection to prevent double-booking.
              </p>

              {/* Add slot form */}
              <form onSubmit={handleSubmitSlot(handleAddSlot)} className="bg-gray-50 rounded-lg p-4 mb-4 space-y-3 border">
                <h4 className="text-sm font-medium text-gray-700">Add New Availability Slot</h4>
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1 mt-6">
                    <Label className="text-sm font-medium text-gray-700">Day *</Label>
                    <select
                      {...registerSlot("dayOfWeek", { required: true })}
                      className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-yellow-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="" disabled>Select day</option>
                      {DAYS_OF_WEEK.map(day => (
                        <option key={day} value={day}>{day}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mt-7">
                    <TimeInput
                      label="Start Time"
                      register={registerSlot}
                      fieldName="startTime"
                      inputRef={startTimeRef}
                      onClick={() => startTimeRef.current?.showPicker()}
                      error={slotErrors.startTime?.message}
                      required={true}
                      min={BUSINESS_HOURS.START}
                      max={BUSINESS_HOURS.END}
                      validation={getTimeValidationRules("start")}
                    />
                  </div>
                  <div className="mt-7">
                    <TimeInput
                      label="End Time"
                      register={registerSlot}
                      fieldName="endTime"
                      inputRef={endTimeRef}
                      onClick={() => endTimeRef.current?.showPicker()}
                      error={slotErrors.endTime?.message}
                      required={true}
                      min={BUSINESS_HOURS.START}
                      max={BUSINESS_HOURS.END}
                      validation={getTimeValidationRules("end", watchSlot("startTime"))}
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  size="sm"
                  className="bg-yellow-500 hover:bg-yellow-600 text-white"
                  disabled={isAddingSlot}
                >
                  {isAddingSlot ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Add Slot
                </Button>
              </form>

              {/* Slots grouped by date */}
              {isSlotsLoading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                </div>
              ) : slots.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No availability slots defined yet
                </p>
              ) : (
                <div className="space-y-3">
                  {Object.entries(slotsByDay)
                    .sort(([a], [b]) => DAYS_OF_WEEK.indexOf(a) - DAYS_OF_WEEK.indexOf(b))
                    .map(([dayKey, dateSlots]) => (
                      <div key={dayKey} className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {dayKey}
                        </div>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Start Time</TableHead>
                              <TableHead>End Time</TableHead>
                              <TableHead className="w-16">Delete</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {dateSlots
                              .sort((a, b) => a.startTime.localeCompare(b.startTime))
                              .map((slot) => (
                                <TableRow key={slot.id}>
                                  <TableCell className="font-mono">{slot.startTime}</TableCell>
                                  <TableCell className="font-mono">{slot.endTime}</TableCell>
                                  <TableCell>
                                    <Button
                                      type="button"
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteSlot(slot.id)}
                                    >
                                      <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </div>
                    ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>



      {/* Absences Section */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Absence Dates
          </h3>
          <Button
            size="sm"
            className="bg-yellow-500 hover:bg-yellow-600 text-white"
            onClick={() => {
              setEditingAbsence(null);
              setIsAbsenceDialogOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Absence
          </Button>
        </div>

        {isLoading ? (
          <p className="text-gray-500">Loading absences...</p>
        ) : absences.length === 0 ? (
          <p className="text-gray-500 text-center py-4">
            No absence dates recorded
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead className="w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {absences.map((absence) => (
                <TableRow key={absence.id}>
                  <TableCell className="font-medium">
                    {formatDate(absence.absenceDate)}
                  </TableCell>
                  <TableCell>{absence.reason || "-"}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingAbsence(absence);
                          setIsAbsenceDialogOpen(true);
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAbsence(absence.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Dialogs */}
      <EditWorkingDaysDialog
        open={isWorkingDaysDialogOpen}
        onOpenChange={setIsWorkingDaysDialogOpen}
        currentDays={workingDays}
        currentType={teacherType}
        onSave={handleWorkingDaysSave}
      />

      {teacher.id && (
        <TeacherAbsenceDialog
          open={isAbsenceDialogOpen}
          onOpenChange={setIsAbsenceDialogOpen}
          teacherId={teacher.id}
          absence={editingAbsence}
          onSaved={handleAbsenceSaved}
        />
      )}
    </div>
  );
}
