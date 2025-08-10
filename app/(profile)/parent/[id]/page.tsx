import ParentDetail from "@/components/students/parent.detail.left";
import { getParentById } from "@/lib/axio";

export default async function ParentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const parent = await getParentById(Number(id));
  console.log("ParentDetailPage", parent);
  return (
    <div className="relative">
      <div className="flex min-h-screen">
        <ParentDetail parent={parent} />
        {/* Add children section here later */}
      </div>
    </div>
  );
}
