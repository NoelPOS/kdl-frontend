import React from "react";
import { StudentCard } from "./student-card";
import { fetchStudents, searchStudents } from "@/lib/axio";
import { Student } from "@/app/types/student.type";

export default async function StudentList({
  query,
}: {
  query: string | undefined;
}) {
  const students: Student[] = query
    ? await searchStudents(query)
    : (await fetchStudents()).students;

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {students.map((student) => (
        <StudentCard key={student.id} student={student} />
      ))}
    </div>
  );
}
