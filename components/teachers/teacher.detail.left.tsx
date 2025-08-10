import React from "react";
import { Teacher } from "@/app/types/teacher.type";
import TeacherDetailClient from "./teacher.detail.left.client";

export default function TeacherDetail({
  teacher,
}: {
  teacher: Partial<Teacher>;
}) {
  return <TeacherDetailClient teacher={teacher} />;
}
