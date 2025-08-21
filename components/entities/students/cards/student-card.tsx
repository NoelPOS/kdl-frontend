"use client";

import { User, Clock, Phone, Pizza, Ban } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Student } from "@/app/types/student.type";
import { useRouter } from "next/navigation";

interface StudentCardProps {
  student: Student;
}

function calculateAge(dob: string): number {
  const birthDate = new Date(dob);
  const today = new Date();

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  const dayDiff = today.getDate() - birthDate.getDate();
  if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
    age--;
  }

  return age;
}

export function StudentCard({ student }: StudentCardProps) {
  const [pizzaHovered, setPizzaHovered] = useState(false);
  const [banHovered, setBanHovered] = useState(false);

  const router = useRouter();

  // Check if student has any allergies or dietary restrictions
  const hasAllergiesOrDietaryRestrictions =
    (student.allergic &&
      student.allergic.length > 0 &&
      student.allergic.some((item) => item.trim() !== "")) ||
    (student.doNotEat &&
      student.doNotEat.length > 0 &&
      student.doNotEat.some((item) => item.trim() !== ""));

  return (
    <div className="bg-blue-100 rounded-lg p-4 border border-blue-100 relative max-w-[250px]">
      <>
        {/* Only show Pizza icon if student has allergies or dietary restrictions */}
        {hasAllergiesOrDietaryRestrictions && (
          <Pizza
            className="absolute top-2 right-2 h-5 w-5 text-red-500"
            onMouseEnter={() => setPizzaHovered(true)}
          />
        )}
        {!student.adConcent && (
          <Ban
            className={`absolute ${
              hasAllergiesOrDietaryRestrictions ? "top-10" : "top-2"
            } right-2 h-5 w-5 text-red-500`}
            onMouseEnter={() => setBanHovered(true)}
          />
        )}
      </>

      {pizzaHovered && hasAllergiesOrDietaryRestrictions && (
        <div
          className="absolute inset-0 bg-blue-100 rounded-lg border border-blue-100 p-4 flex flex-col z-50"
          onMouseLeave={() => setPizzaHovered(false)}
        >
          <div
            className="flex-1 overflow-y-auto text-xs text-gray-700 leading-relaxed"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {student.allergic.map((allergy: string) => (
              <div key={allergy} className="flex items-start mb-2 gap-3">
                <Pizza className="h-5 w-5 inline-block mr-1 text-red-500" />
                <div className="flex flex-col items-start mb-2">
                  <h1 className="font-bold text-lg text-red-500">
                    Allergic To
                  </h1>
                  <p className="whitespace-pre-line">{allergy}</p>
                </div>
              </div>
            ))}
            {student.doNotEat.map((dne: string) => (
              <div key={dne} className="flex items-start mb-2 gap-3">
                <Pizza className="h-5 w-5 inline-block mr-1 text-red-500" />
                <div className="flex flex-col items-start mb-2">
                  <h1 className="font-bold text-lg text-red-500">Do not eat</h1>
                  <p className="whitespace-pre-line">{dne}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {banHovered && (
        <div
          className="absolute inset-0 bg-blue-50 rounded-lg border border-blue-100 p-4 flex flex-col z-50"
          onMouseLeave={() => setBanHovered(false)}
        >
          <div
            className="flex-1 overflow-y-auto text-xs text-gray-700 leading-relaxed"
            style={{
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {!student.adConcent && (
              <>
                <Ban className="h-5 w-5 inline-block mr-1 text-red-500" />
                <p className="whitespace-pre-line text-bold">
                  The provided party does not allows to take picture of them.{" "}
                </p>
              </>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-col items-center text-center mb-4">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarImage src={student.profilePicture} alt={student.name} />
          <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
        </Avatar>

        <h3 className="font-semibold text-orange-500 mb-2">{student.name}</h3>

        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {student.name}
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {calculateAge(student.dob)} yrs old
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {student.phone}
          </div>
        </div>
      </div>

      <Button
        className="w-full bg-blue-400 hover:bg-blue-500 cursor-pointer"
        onClick={() => router.push(`/student/${student.id}`)}
      >
        Details
      </Button>
    </div>
  );
}
