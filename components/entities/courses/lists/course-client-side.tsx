"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CourseCard } from "../cards/course-card";
import { Pagination } from "@/components/ui/pagination";
import EnrollmentWizard from "@/components/entities/enrollments/wizard/enrollment-wizard";
import { Course } from "@/app/types/course.type";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

function CourseClientSide({
  courses,
  pagination,
  lastUpdated,
}: {
  courses: Course[];
  pagination: PaginationData;
  lastUpdated?: Date;
}) {
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<number>(-1);
  const [selectedCourseName, setSelectedCourseName] = useState("");

  const handleOpenWizard = (courseId: number) => {
    setSelectedCourseId(courseId);
    setWizardOpen(true);
  };

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 justify-items-center">
        {courses.length > 0 &&
          courses.map((course: Course, index: number) => (
            <CourseCard
              key={index}
              course={course}
              setCourseId={setSelectedCourseId}
              setCourseName={setSelectedCourseName}
              onOpenDialog={handleOpenWizard}
            />
          ))}
      </div>

      {courses.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={10}
          itemName="courses"
        />
      )}

      <EnrollmentWizard
        key={selectedCourseId}
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        mode="from-course"
        prefillCourseId={selectedCourseId}
        prefillCourseTitle={selectedCourseName}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}

export default CourseClientSide;
