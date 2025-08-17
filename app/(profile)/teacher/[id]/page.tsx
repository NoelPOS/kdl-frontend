import TeacherDetail from "@/components/entities/teachers/details/teacher.detail.left";
import { TeacherDetailRight } from "@/components/entities/teachers/details/teacher-detail-right";
import { getTeacherById } from "@/lib/api";

interface TeacherDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}

export default async function TeacherDetailPage({
  params,
  searchParams,
}: TeacherDetailPageProps) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const teacher = await getTeacherById(Number(id));
  console.log("TeacherDetailPage", teacher);

  return (
    <div className="relative">
      <div className="flex min-h-screen">
        <TeacherDetail teacher={teacher} />
        <TeacherDetailRight
          teacherId={Number(id)}
          searchParams={resolvedSearchParams}
        />
      </div>
    </div>
  );
}
