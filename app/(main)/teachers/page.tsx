import AddNewTeacher from "@/components/teachers/add-new-teacher/add-new-teacher.dialog";
import TeacherFilter from "@/components/teachers/filter-teacher";
import TeacherSearch from "@/components/teachers/search/teacher.search";
import TeacherList from "@/components/teachers/teacher.list";
import { Suspense } from "react";

export default function TeachersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string; active?: string }>;
}) {
  const query = "";
  const active = "all";

  console.log(searchParams);

  return (
    <div className="p-6">
      <div className="flex items-center justify-center mb-6 ">
        <div className="flex items-center justify-around w-full gap-4">
          <div className="flex-1/4"></div>
          <TeacherSearch />
          <TeacherFilter />
        </div>
        <AddNewTeacher />
      </div>
      <Suspense
        key={`${query || ""}${active || ""}`}
        fallback={<div>Loading...</div>}
      >
        <TeacherList query={query || ""} active={active || ""} />
      </Suspense>
    </div>
  );
}
