"use client";

import { useState } from "react";
import { ConnectParentStudentDialog } from "../dialogs/connect-parent-student-dialog";
import ChildrenFilter from "../children/children-filter";
import ChildrenList from "../children/children-list";

interface ParentDetailRightProps {
  parentId: number;
  searchParams: {
    query?: string;
    page?: string;
  };
}

export default function ParentDetailRight({
  parentId,
  searchParams,
}: ParentDetailRightProps) {
  const [refreshKey, setRefreshKey] = useState(0);

  const handleConnectSuccess = () => {
    // Force refresh of the children list by changing the key
    setRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="flex-1 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Children</h1>
        <ConnectParentStudentDialog
          parentId={parentId}
          onSuccess={handleConnectSuccess}
        />
      </div>

      <ChildrenFilter />

      <div className="mt-6" key={refreshKey}>
        <ChildrenList parentId={parentId} searchParams={searchParams} />
      </div>
    </div>
  );
}
