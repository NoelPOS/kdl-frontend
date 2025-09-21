import RegistrarDetail from "@/components/entities/registrars/details/registrar.detail.left";
import ResponsiveDetailLayout from "@/components/shared/responsive-detail-layout";
import { getRegistrarById } from "@/lib/api";
import { cookies } from "next/headers";

export default async function RegistrarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value || "";
  const { id } = await params;
  const registrar = await getRegistrarById(Number(id), accessToken);

  return (
    <ResponsiveDetailLayout
      detailTitle={`Registrar Details - ${registrar.name}`}
      detailDescription="Registrar information and details"
      rightContent={
        <div className="flex-1 p-8 bg-gray-50">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              Welcome to Registrar Details
            </h1>
            <p className="text-gray-600">
              Hello world! This is the right side content for the registrar detail page.
              You can add more functionality here as needed.
            </p>
          </div>
        </div>
      }
    >
      <RegistrarDetail registrar={registrar} />
    </ResponsiveDetailLayout>
  );
}
