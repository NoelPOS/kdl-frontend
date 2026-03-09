"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Student } from "@/app/types/course.type";
import EnrollmentWizard from "@/components/entities/enrollments/wizard/enrollment-wizard";

function StudentDetailRightClient({ studentData }: { studentData: Student[] }) {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);

  const student = studentData[0];

  return (
    <>
      <Button
        variant="outline"
        className="flex items-center gap-2 rounded-full"
        onClick={() => setWizardOpen(true)}
      >
        <Plus className="h-4 w-4" />
        Add Course
      </Button>

      <EnrollmentWizard
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        mode="from-student"
        prefillStudentId={student ? Number(student.id) : undefined}
        prefillStudentName={student?.name}
        studentData={student}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}

export default StudentDetailRightClient;
