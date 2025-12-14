import TeacherDetail from "@/components/entities/teachers/details/teacher.detail.left";
import { TeacherDetailRight } from "@/components/entities/teachers/details/teacher-detail-right";
import ResponsiveDetailLayout from "@/components/shared/responsive-detail-layout";
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
  
  return (
    <ResponsiveDetailLayout
      detailTitle={`Teacher Details - ${teacher.name}`}
      detailDescription="Teacher information and details"
      rightContent={
        <TeacherDetailRight
          teacherId={Number(id)}
          teacher={teacher}
          searchParams={resolvedSearchParams}
        />
      }
    >
      <TeacherDetail teacher={teacher} />
    </ResponsiveDetailLayout>
  );
}
