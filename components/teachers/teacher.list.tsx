import { Teacher } from "@/app/types/teacher.type";
import React from "react";
import { TeacherCard } from "./teacher-card";

const dummyTeachers: Teacher[] = [
  {
    id: 1,
    name: "John Doe",
    subject: "Math",
    phone: "123-456-7890",
    active: true,
  },
  {
    id: 2,
    name: "Jane Smith",
    subject: "Science",
    phone: "987-654-3210",
    active: false,
  },
];

export default function TeacherList({
  query,
  active,
}: {
  query: string;
  active: string;
}) {
  let teachers = dummyTeachers;
  if (active === "active") {
    teachers = teachers.filter((t) => t.active);
  } else if (active === "inactive") {
    teachers = teachers.filter((t) => !t.active);
  }
  if (query) {
    teachers = teachers.filter((t) =>
      t.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {teachers.map((teacher) => (
        <TeacherCard key={teacher.id} teacher={teacher} />
      ))}
    </div>
  );
}
