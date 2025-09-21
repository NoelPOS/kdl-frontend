import StudentDetail from "@/components/entities/students/details/student.detail.left";
import StudentDetailRight from "@/components/entities/students/details/student.detail.right";
import ResponsiveDetailLayout from "@/components/shared/responsive-detail-layout";
import { getStudentById } from "@/lib/api";
import { cookies } from "next/headers";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    courseName?: string;
    status?: string;
    payment?: string;
    page?: string;
  }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value || "";
  const { id } = (await params) || -1;
  const resolvedSearchParams = (await searchParams) || {};
  const student = await getStudentById(Number(id), accessToken);
  
  return (
    <ResponsiveDetailLayout
      detailTitle={`Student Details - ${student.nickname || student.name}`}
      detailDescription="Student information and details"
      rightContent={
        <StudentDetailRight
          student={{
            id: student.id ?? "",
            name: student.name ?? "",
            nickname: student.nickname ?? "",
          }}
          searchParams={resolvedSearchParams}
        />
      }
    >
      <StudentDetail student={student} />
    </ResponsiveDetailLayout>
  );
}
