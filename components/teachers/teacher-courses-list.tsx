import { Suspense } from "react";
import TeacherCoursesListContent from "./teacher-courses-list-content";

interface TeacherCoursesListProps {
  teacherId: number;
  searchParams: {
    query?: string;
    page?: string;
  };
}

function TeacherCoursesListLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div key={index} className="animate-pulse">
          <div className="bg-gray-200 rounded-2xl p-6 h-48"></div>
        </div>
      ))}
    </div>
  );
}

export default function TeacherCoursesList({
  teacherId,
  searchParams,
}: TeacherCoursesListProps) {
  // Create a key for Suspense to re-trigger when search params change
  const suspenseKey = `${searchParams.query || ""}${searchParams.page || ""}`;

  return (
    <Suspense key={suspenseKey} fallback={<TeacherCoursesListLoading />}>
      <TeacherCoursesListContent
        teacherId={teacherId}
        searchParams={searchParams}
      />
    </Suspense>
  );
}
