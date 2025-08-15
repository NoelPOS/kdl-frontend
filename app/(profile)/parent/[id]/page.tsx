import ParentDetail from "@/components/entities/parents/details/parent.detail.left";
import ParentDetailRight from "@/components/entities/parents/details/parent-detail-right";
import { getParentById } from "@/lib/axio";

export default async function ParentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{
    query?: string;
    page?: string;
  }>;
}) {
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const parent = await getParentById(Number(id));

  console.log("ParentDetailPage", parent);

  return (
    <div className="relative">
      <div className="flex min-h-screen">
        <ParentDetail parent={parent} />
        <ParentDetailRight
          parentId={Number(id)}
          searchParams={resolvedSearchParams}
        />
      </div>
    </div>
  );
}
