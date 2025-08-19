import TeacherDetail from "@/components/entities/teachers/details/teacher.detail.left";
import { TeacherDetailRight } from "@/components/entities/teachers/details/teacher-detail-right";
import { getTeacherById } from "@/lib/api";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value || "";
  const { id } = await params;
  const resolvedSearchParams = await searchParams;
  const teacher = await getTeacherById(Number(id), accessToken);
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
