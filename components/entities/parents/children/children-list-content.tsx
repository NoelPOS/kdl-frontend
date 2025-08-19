"use client";

import { useEffect, useState, useCallback } from "react";
import { getParentChildren, ParentChild, ParentChildFilter } from "@/lib/api";
import { Pagination } from "@/components/ui/pagination";
import { StudentCard } from "@/components/entities/students/cards/student-card";

interface ChildrenListContentProps {
  parentId: number;
  searchParams: {
    query?: string;
    page?: string;
  };
}

export default function ChildrenListContent({
  parentId,
  searchParams,
}: ChildrenListContentProps) {
  const [children, setChildren] = useState<ParentChild[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalCount: 0,
    hasNext: false,
    hasPrev: false,
  });

  const currentPage = parseInt(searchParams.page || "1");
  const searchQuery = searchParams.query;

  const fetchChildren = useCallback(async () => {
    setLoading(true);
    try {
      const response = await getParentChildren(
        parentId,
        { query: searchQuery },
        currentPage,
        12
      );
      setChildren(response.children);
      setPagination(response.pagination);
    } catch (error) {
      console.error("Failed to fetch children:", error);
      setChildren([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalCount: 0,
        hasNext: false,
        hasPrev: false,
      });
    } finally {
      setLoading(false);
    }
  }, [parentId, searchQuery, currentPage]);

  useEffect(() => {
    fetchChildren();
  }, [parentId, searchQuery, currentPage, fetchChildren]);

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-2xl p-6 h-48"></div>
          </div>
        ))}
      </div>
    );
  }

  if (children.length && children.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-gray-400 text-6xl mb-4">👨‍👩‍👧‍👦</div>
        <h3 className="text-xl font-semibold text-gray-700 mb-2">
          {searchQuery ? "No children found" : "No children connected"}
        </h3>
        <p className="text-gray-500">
          {searchQuery
            ? `No children match "${searchQuery}"`
            : "This parent doesn't have any connected children yet."}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {children.map((child) => (
          <StudentCard key={child.id} student={child.student} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-8">
          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            hasNext={pagination.hasNext}
            hasPrev={pagination.hasPrev}
            itemsPerPage={12}
            itemName="children"
          />
        </div>
      )}
    </div>
  );
}
