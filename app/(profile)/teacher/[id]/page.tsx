import TeacherDetail from "@/components/teachers/teacher.detail.left";
import { getTeacherById } from "@/lib/axio";

export default async function TeacherDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const teacher = await getTeacherById(Number(id));
  console.log("TeacherDetailPage", teacher);
  return (
    <div className="relative">
      <div className="flex min-h-screen">
        <TeacherDetail teacher={teacher} />
        {/* Add courses section here later */}
      </div>
    </div>
  );
}
