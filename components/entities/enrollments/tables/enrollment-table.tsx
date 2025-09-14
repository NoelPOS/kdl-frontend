"use client";

import { Enrollment } from "@/app/types/enrollment.type";
import { showToast } from "@/lib/toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";

export function EnrollmentTableWithSelection({
  enrollments,
}: {
  enrollments: Enrollment[];
}) {
  const [selectedEnrollments, setSelectedEnrollments] = useState<Set<number>>(
    new Set()
  );
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(
    null
  );
  const router = useRouter();

  // Build a map for O(1) lookup session_id -> enrollment
  const enrollmentMap = useMemo(() => {
    const map = new Map<number, Enrollment>();
    enrollments.forEach((e) => map.set(e.session_id, e));
    return map;
  }, [enrollments]);

  const handleSelection = (
    sessionId: number,
    studentId: number,
    isChecked: boolean
  ) => {
    setSelectedEnrollments((prev) => {
      const newSet = new Set(prev);

      if (isChecked) {
        // If no student selected yet, lock selection to this student
        if (selectedStudentId === null) {
          setSelectedStudentId(studentId);
          newSet.add(sessionId);
        } else if (selectedStudentId === studentId) {
          newSet.add(sessionId);
        } else {
          showToast.error(
            "You can only select enrollments from the same student."
          );
          return prev; // unchanged
        }
      } else {
        newSet.delete(sessionId);
        // If none left, reset studentId lock
        if (newSet.size === 0) {
          setSelectedStudentId(null);
        }
      }

      return newSet;
    });
  };

  const handleCreateInvoiceForSelected = () => {
    if (selectedEnrollments.size === 0) return;

    const selectedArray = Array.from(selectedEnrollments);
    const firstEnrollment = enrollmentMap.get(selectedArray[0]);
    if (!firstEnrollment) return;

    const sessionIds = selectedArray.join(",");
    const queryParams = new URLSearchParams({ sessionIds });

    router.push(
      `/enrollment/${
        firstEnrollment.student_id
      }/sessions?${queryParams.toString()}`
    );
  };

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      {selectedEnrollments.size > 0 && (
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedEnrollments.size} enrollment(s) selected
            </span>
            <Button
              onClick={handleCreateInvoiceForSelected}
              className="bg-yellow-500 hover:bg-yellow-600 text-white"
            >
              Create Invoice for Selected
            </Button>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto bg-white rounded-2xl shadow-sm border" style={{ maxWidth: '100vw' }}>
        <Table className="min-w-max w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[50px]">
              No.
            </TableHead>
            <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[100px]">
              Date
            </TableHead>
            <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[150px]">
              Student Name
            </TableHead>
            <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[200px]">
              Description
            </TableHead>
            <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[100px]">
              Amount
            </TableHead>
            <TableHead className="border-2 h-20 border-gray-300 text-center font-semibold whitespace-nowrap min-w-[80px]">
              Select
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {enrollments.map((enrollment, index) => {
            const isSelected = selectedEnrollments.has(enrollment.session_id);
            const isSameStudent =
              selectedStudentId === null ||
              selectedStudentId === enrollment.student_id;
            const isDimmed =
              selectedStudentId !== null &&
              selectedStudentId !== enrollment.student_id;

            return (
              <TableRow
                key={enrollment.session_id}
                className={`${isSelected ? "bg-blue-50" : ""} ${
                  isDimmed ? "opacity-30" : ""
                } transition-opacity duration-200`}
              >
                <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[50px]">
                  {index + 1}
                </TableCell>
                <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[100px]">
                  {new Date(enrollment.session_createdat).toLocaleDateString(
                    "en-GB"
                  )}
                </TableCell>
                <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[150px]">
                  {enrollment.student_name}
                </TableCell>
                <TableCell className="border-2 h-20 border-gray-300 text-center px-2 min-w-[200px] max-w-[250px]">
                  <div className="truncate" title={enrollment.course_title}>
                    {enrollment.course_title}
                  </div>
                </TableCell>
                <TableCell className="border-2 h-20 border-gray-300 text-center whitespace-nowrap px-2 min-w-[100px]">
                  {enrollment.classoption_tuitionfee}
                </TableCell>
                <TableCell className="border-2 h-20 border-gray-300 text-center px-2 min-w-[80px]">
                  <div className="flex justify-center">
                    <Checkbox
                      checked={isSelected}
                      disabled={!isSameStudent}
                      onCheckedChange={(checked) =>
                        handleSelection(
                          enrollment.session_id,
                          enrollment.student_id,
                          Boolean(checked)
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
    </div>
  );
}
