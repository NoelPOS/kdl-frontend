import ParentDetail from "@/components/entities/parents/details/parent.detail.left";
import ParentDetailRight from "@/components/entities/parents/details/parent-detail-right";
import ResponsiveDetailLayout from "@/components/shared/responsive-detail-layout";
import { getParentById } from "@/lib/api";
import { cookies } from "next/headers";

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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value || "";
  const { id } = await params;
  const resolvedSearchParams = (await searchParams) || {};
  const parent = await getParentById(Number(id), accessToken);

  return (
    <ResponsiveDetailLayout
      detailTitle={`Parent Details - ${parent.name}`}
      detailDescription="Parent information and details"
      rightContent={
        <ParentDetailRight
          parentId={Number(id)}
          searchParams={resolvedSearchParams}
        />
      }
    >
      <ParentDetail parent={parent} />
    </ResponsiveDetailLayout>
  );
}
