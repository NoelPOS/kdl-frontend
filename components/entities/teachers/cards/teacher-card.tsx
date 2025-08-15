"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Teacher } from "@/app/types/teacher.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function TeacherCard({ teacher }: { teacher: Teacher }) {
  const router = useRouter();
  console.log(teacher.profilePicture);
  return (
    <div className="bg-blue-100 rounded-lg p-4 border border-blue-100 relative max-w-[250px]">
      <div className="flex flex-col items-center text-center mb-4">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarImage src={teacher.profilePicture} alt={teacher.name} />
          <AvatarFallback>{teacher.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-blue-500 mb-2">{teacher.name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {teacher.name}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {teacher.email}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {teacher.contactNo}
          </div>
        </div>
      </div>
      <Button
        className="w-full bg-blue-400 hover:bg-blue-500 cursor-pointer"
        onClick={() => router.push(`/teacher/${teacher.id}`)}
      >
        Details
      </Button>
    </div>
  );
}
