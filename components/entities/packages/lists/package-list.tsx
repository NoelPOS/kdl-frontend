import { fetchFilteredPackages } from "@/lib/api";
import { cookies } from "next/headers";
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
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const { packages, pagination } = await fetchFilteredPackages(
    { query, status, classMode },
    page,
    6,
    accessToken
  );

  return <PackageClientSide packages={packages} pagination={pagination} />;
}
