import React from "react";
import { Button } from "@/components/ui/button";
import { Teacher } from "@/app/types/teacher.type";

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  return (
    <div className="bg-green-100 rounded-lg p-4 border border-green-100 relative max-w-[250px]">
      <div className="flex flex-col items-center text-center mb-4">
        <div className="h-16 w-16 mb-3 bg-green-300 rounded-full flex items-center justify-center text-2xl font-bold text-white">
          {teacher.name.charAt(0)}
        </div>
        <h3 className="font-semibold text-green-500 mb-2">{teacher.name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Subject: {teacher.subject}</div>
          <div>Phone: {teacher.phone}</div>
          <div>Status: {teacher.active ? "Active" : "Inactive"}</div>
        </div>
      </div>
      <Button className="w-full bg-green-400 hover:bg-green-500 cursor-pointer">
        Details
      </Button>
    </div>
  );
}
