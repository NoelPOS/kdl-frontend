import { ParentChild } from "@/lib/axio";
import React from "react";
import { StudentCard } from "@/components/entities/students/cards/student-card";

interface ChildrenGridProps {
  children: ParentChild[];
}

export default function ChildrenGrid({ children }: ChildrenGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children.map((parentChild) => (
        <div key={parentChild.id} className="relative">
          <StudentCard student={parentChild.student} />
          {parentChild.isPrimary && (
            <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Primary
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
