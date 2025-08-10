import { fetchFilteredPackages } from "@/lib/axio";
import PackageClientSide from "./package-client-side";

export default async function PackageList({
  query,
  status,
  classMode,
  page = 1,
}: {
  query: string;
  status: string;
  classMode: string;
  page?: number;
}) {
  const { packages, pagination } = await fetchFilteredPackages(
    { query, status, classMode },
    page,
    6
  );

  return <PackageClientSide packages={packages} pagination={pagination} />;
}
