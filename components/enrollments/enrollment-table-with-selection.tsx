"use client";

import { Enrollment } from "@/app/types/enrollment.type";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function EnrollmentTableWithSelection({
  enrollments,
}: {
  enrollments: Enrollment[];
}) {
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<number>>(
    new Set()
  );
  const router = useRouter();

  const handleSelection = (
    sessionId: number,
    studentId: number,
    isChecked: boolean
  ) => {
    setSelectedEnrollments((prev) => {
      const newSet = new Set(prev);

      if (isChecked) {
        // If selecting, check if we can select this student
        const currentStudentIds = Array.from(prev).map((id) => {
          const enrollment = enrollments.find((e) => e.session_id === id);
          return enrollment?.student_id;
        });

        // Remove undefined values and check if there are other students
        const validStudentIds = currentStudentIds.filter(
          (id) => id !== undefined
        );
        const hasOtherStudents =
          validStudentIds.length > 0 &&
          validStudentIds.some((id) => id !== studentId);

        if (hasOtherStudents) {
          // Can't select different students
          alert("You can only select enrollments from the same student.");
          return prev;
        }

        newSet.add(sessionId);
      } else {
        newSet.delete(sessionId);
      }

      return newSet;
    });
  };

  const handleCreateInvoiceForSelected = () => {
    if (selectedEnrollments.size === 0) {
      alert("Please select at least one enrollment.");
      return;
    }

    const selectedArray = Array.from(selectedEnrollments);
    const firstEnrollment = enrollments.find(
      (e) => e.session_id === selectedArray[0]
    );

    if (!firstEnrollment) return;

    // Create URL with query parameters instead of dynamic route
    const sessionIds = selectedArray.join(",");
    const queryParams = new URLSearchParams({
      sessionIds: sessionIds,
    });

    router.push(
      `/enrollment/${
        firstEnrollment.student_id
      }/sessions?${queryParams.toString()}`
    );
  };

  // Get current selected student info
  const getSelectedStudentInfo = () => {
    if (selectedEnrollments.size === 0) return null;

    const firstSelected = Array.from(selectedEnrollments)[0];
    const enrollment = enrollments.find((e) => e.session_id === firstSelected);
    return enrollment;
  };

  const selectedStudentInfo = getSelectedStudentInfo();

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      {selectedEnrollments.size > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-blue-900">
                {selectedEnrollments.size} enrollment(s) selected
              </span>
              {selectedStudentInfo && (
                <span className="text-sm text-blue-700">
                  Student: {selectedStudentInfo.student_name} (ID:{" "}
                  {selectedStudentInfo.student_id})
                </span>
              )}
            </div>
            <Button
              onClick={handleCreateInvoiceForSelected}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Create Invoice for Selected
            </Button>
          </div>
        </div>
      )}

      <Table className="bg-white table-fixed rounded-2xl">
        <TableHeader>
          <TableRow>
            <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold w-16">
              No.
            </TableHead>
            <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold w-32">
              Date
            </TableHead>
            <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold w-24">
              Student Id
            </TableHead>
            <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
              Student Name
            </TableHead>
            <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold">
              Description
            </TableHead>
            <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold w-32">
              Amount
            </TableHead>
            <TableHead className="border-2 border-gray-300 h-20 text-center whitespace-normal font-semibold w-20">
              Select
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment, index) => {
            const isSelected = selectedEnrollments.has(enrollment.session_id);

            return (
              <TableRow
                key={enrollment.session_id}
                className={isSelected ? "bg-blue-50" : ""}
              >
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {index + 1}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {new Date(enrollment.session_createdat).toLocaleDateString()}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {enrollment.student_id}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {enrollment.student_name}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {enrollment.course_title}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  {enrollment.classoption_tuitionfee}
                </TableCell>
                <TableCell className="border-2 border-gray-300 h-20 text-center whitespace-normal">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) =>
                        handleSelection(
                          enrollment.session_id,
                          enrollment.student_id,
                          checked as boolean
                        )
                      }
                    />
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
