"use client";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type {
  ComfirmClassScheduleData,
  ComfirmScheduleRow,
  ComfirmStudent,
  ComfirmTeacherData,
} from "@/lib/types";
import { generateScheduleRows } from "@/lib/utils";
import { useState } from "react";
import EditScheduleDialog, {
  EditScheduleFormData,
} from "../class-schedule-confirm-edit/class-schedule-confirm-edit";

interface ClassScheduleConfirmProps {
  students: ComfirmStudent[];
  classSchedule: ComfirmClassScheduleData;
  teacherData: ComfirmTeacherData;
  onCancel: () => void;
  onConfirm: () => void;
}

export function ClassScheduleConfirm({
  students,
  classSchedule,
  teacherData,
  onCancel,
  onConfirm,
}: ClassScheduleConfirmProps) {
  // Get course name from URL params
  const courseName =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("course") || "Course"
      : "Course";

  // State for managing schedule rows and editing
  const [scheduleRows, setScheduleRows] = useState<ComfirmScheduleRow[]>(() =>
    generateScheduleRows(students, classSchedule, teacherData)
  );
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(-1);
  const [selectedRowData, setSelectedRowData] =
    useState<EditScheduleFormData | null>(null);

  // Handle double click on table row
  const handleRowDoubleClick = (row: ComfirmScheduleRow, index: number) => {
    console.log("Row double clicked:", row, "Index:", index);

    // Convert ScheduleRow to EditScheduleFormData format
    const editData: EditScheduleFormData = {
      date: row.date,
      time: row.time,
      course: courseName,
      teacher: row.teacher,
      student: row.student,
      room: row.room,
      nickname: row.student, // Assuming student name is used as nickname
      class: row.class,
      studentId: "", // This would need to be extracted from students data
      remark: row.remark,
      status: "Pending", // Default status
    };

    // Find student ID from students array
    const student = students.find(
      (s) => s.nickname === row.student || s.studentName === row.student
    );
    if (student) {
      editData.studentId = student.id;
      editData.nickname = student.nickname || student.studentName;
    }

    setSelectedRowData(editData);
    setSelectedRowIndex(index);
    setEditDialogOpen(true);
  };

  // Handle saving edited schedule
  const handleSaveEdit = (
    editedData: EditScheduleFormData,
    originalIndex: number
  ) => {
    console.log("Saving edited data:", editedData, "at index:", originalIndex);

    // Update the schedule rows with edited data
    const updatedRows = [...scheduleRows];
    updatedRows[originalIndex] = {
      ...updatedRows[originalIndex],
      date: editedData.date,
      time: editedData.time,
      student: editedData.nickname || editedData.student,
      teacher: editedData.teacher,
      class: editedData.class,
      room: editedData.room,
      remark: editedData.remark,
      warning: "",
    };

    setScheduleRows(updatedRows);
    setEditDialogOpen(false);
    setSelectedRowData(null);
    setSelectedRowIndex(-1);
  };

  return (
    <div className="py-6 px-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-orange-500 mb-1">
            Confirming Class Schedule
          </h1>
          <p className="text-lg text-gray-700">{courseName}</p>
          <p className="text-sm text-gray-500 mt-1">
            Double-click any row to edit the schedule
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onCancel}
            className="text-red-500 border-red-500 hover:bg-red-50 hover:text-red-600 rounded-full px-6"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            className="bg-green-500 text-white hover:bg-green-600 rounded-full px-6"
          >
            Confirm
          </Button>
        </div>
      </div>

      {/* Schedule Table */}
      <div className="border rounded-lg bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Date
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Time
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Student
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Teacher
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Class
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Room
              </TableHead>
              <TableHead className="font-semibold text-gray-700 border-r text-center h-20">
                Remark
              </TableHead>
              <TableHead className="font-semibold text-gray-700 text-center h-20">
                Warning
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {scheduleRows.map((row, index) => (
              <TableRow
                key={index}
                className="hover:bg-gray-50 cursor-pointer"
                onDoubleClick={() => handleRowDoubleClick(row, index)}
                title="Double-click to edit"
              >
                <TableCell className="border-r text-center h-20">
                  {row.date}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.time}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.student}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.teacher}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.class}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.room}
                </TableCell>
                <TableCell className="border-r text-center h-20">
                  {row.remark}
                </TableCell>
                <TableCell className="max-w-[150px] text-center h-20">
                  {row.warning && (
                    <span className="text-red-500 text-sm text-wrap">
                      {row.warning}{" "}
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Edit Dialog */}
      <EditScheduleDialog
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        initialData={selectedRowData || undefined}
        onSave={handleSaveEdit}
        originalIndex={selectedRowIndex}
      />
    </div>
  );
}

export default ClassScheduleConfirm;
