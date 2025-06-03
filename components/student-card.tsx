"use client";

import { User, Clock, Phone } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Student } from "@/lib/types";

interface StudentCardProps {
  student: Student;
  onDetails?: () => void;
}

export function StudentCard({ student, onDetails }: StudentCardProps) {
  return (
    <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 relative">
      {!student.hasConsent && (
        <Badge variant="destructive" className="absolute top-3 right-3 text-xs">
          No consent for ads
        </Badge>
      )}

      <div className="flex flex-col items-center text-center mb-4">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarImage
            src="/placeholder.svg?height=64&width=64"
            alt={student.fullName}
          />
          <AvatarFallback>{student.fullName.charAt(0)}</AvatarFallback>
        </Avatar>

        <h3 className="font-semibold text-orange-500 mb-2">
          {student.fullName}
        </h3>

        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {student.fullName}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {student.age} yrs old
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {student.phone}
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-blue-400 hover:bg-blue-500"
        onClick={onDetails}
      >
        Details
      </Button>
    </div>
  );
}
