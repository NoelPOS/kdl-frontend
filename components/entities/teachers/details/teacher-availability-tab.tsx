"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Pencil, Plus, Trash2, Calendar } from "lucide-react";
import { Teacher, TeacherAbsence } from "@/app/types/teacher.type";
import {
  getTeacherAbsences,
  deleteTeacherAbsence,
  updateTeacherById,
} from "@/lib/api";
import { showToast } from "@/lib/toast";
import { EditWorkingDaysDialog } from "../dialogs/edit-working-days-dialog";
import { TeacherAbsenceDialog } from "../dialogs/teacher-absence-dialog";

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

  // Dialogs
  const [isWorkingDaysDialogOpen, setIsWorkingDaysDialogOpen] = useState(false);
  const [isAbsenceDialogOpen, setIsAbsenceDialogOpen] = useState(false);
  const [editingAbsence, setEditingAbsence] = useState<TeacherAbsence | null>(
    null
  );

  useEffect(() => {
    loadAbsences();
  }, [teacher.id]);

  const loadAbsences = async () => {
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
  };

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

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

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

          {/* Working Days */}
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
