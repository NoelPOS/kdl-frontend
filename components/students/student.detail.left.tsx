import React from "react";
import { Student } from "@/app/types/student.type";
import StudentDetailClient from "./student.detail.left.client";

export default async function StudentDetail({
  student,
}: {
  student: Partial<Student>;
}) {
  return <StudentDetailClient student={student} />;
}
