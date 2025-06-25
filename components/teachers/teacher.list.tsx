import React from "react";
import { TeacherCard } from "./teacher-card";
import { fetchTeachers, searchTeachers } from "@/lib/axio";

export default async function TeacherList({ query }: { query: string }) {
  let teachers;
  if (query) {
    teachers = await searchTeachers(query);
  } else {
    teachers = await fetchTeachers();
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {teachers.map((teacher) => (
        <TeacherCard key={teacher.id} teacher={teacher} />
      ))}
    </div>
  );
}
