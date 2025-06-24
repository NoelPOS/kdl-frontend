import React from "react";
import { StudentCard } from "./student-card";
import {
  fetchStudents,
  searchStudents,
  fetchActiveStudents,
  fetchInactiveStudents,
} from "@/lib/axio";
import { Student } from "@/app/types/student.type";

export default async function StudentList({
  query,
  active,
}: {
  query: string;
  active: string;
}) {
  let students: Student[];
  if (active === "active") {
    students = await fetchActiveStudents();
  } else if (active === "inactive") {
    students = await fetchInactiveStudents();
  } else if (active == "all") {
    students = (await fetchStudents()).students;
  } else if (query) {
    students = await searchStudents(query);
  } else {
    students = (await fetchStudents()).students;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {students &&
        students.map((student) => (
          <StudentCard key={student.id} student={student} />
        ))}
    </div>
  );
}
