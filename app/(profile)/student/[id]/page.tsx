import StudentDetail from "@/components/entities/students/details/student.detail.left";
import StudentDetailRight from "@/components/entities/students/details/student.detail.right";
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
  // console.log("StudentDetailPage", student);
  return (
    <div className="relative">
      <div className="flex min-h-screen ">
        {/* Left Side - Student Information */}
        <StudentDetail student={student} />

        {/* Right Side - Courses */}
        <StudentDetailRight
          student={{
            id: student.id ?? "",
            name: student.name ?? "",
            nickname: student.nickname ?? "",
          }}
          searchParams={resolvedSearchParams}
        />
      </div>
    </div>
  );
}
