import StudentDetail from "@/components/students/student.detail.left";
import StudentDetailRight from "@/components/students/student.detail.right";
import { getStudentById } from "@/lib/axio";

export default async function StudentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    query: string;
  }>;
}) {
  const { id } = (await params) || -1;
  const { query } = (await searchParams) || "";
  const student = await getStudentById(Number(id));
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
          query={query}
        />
      </div>
    </div>
  );
}
