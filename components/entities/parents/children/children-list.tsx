import { Suspense } from "react";
import ChildrenListContent from "./children-list-content";
import ChildrenListLoading from "./children-list-loading";
import AuthLoadingPage from "@/components/auth/auth-loading";

interface ChildrenListProps {
  parentId: number;
  searchParams: {
    query?: string;
    page?: string;
  };
}

export default function ChildrenList({
  parentId,
  searchParams,
}: ChildrenListProps) {
  // Create a key for Suspense to re-trigger when search params change
  const suspenseKey = `${searchParams.query || ""}${searchParams.page || ""}`;

  return (
    <Suspense key={suspenseKey} fallback={<AuthLoadingPage />}>
      <ChildrenListContent parentId={parentId} searchParams={searchParams} />
    </Suspense>
  );
}
