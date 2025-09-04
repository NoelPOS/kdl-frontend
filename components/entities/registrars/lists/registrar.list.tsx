import React from "react";
import { RegistrarCard } from "../cards/registrar-card";
import { Registrar } from "@/app/types/registrar.type";
import { Pagination } from "@/components/ui/pagination";
import { fetchRegistrars } from "@/lib/api";
import { cookies } from "next/headers";

interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export default async function RegistrarList({
  query,
  page = 1,
}: {
  query: string;
  page?: number;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;

  const { registrars, pagination } = await fetchRegistrars(
    query,
    page,
    10,
    accessToken
  );
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
        {registrars.length === 0 ? (
          <div className="col-span-full text-center text-gray-500 py-8">
            No registrars found
          </div>
        ) : (
          registrars.map((registrar) => (
            <RegistrarCard key={registrar.id} registrar={registrar} />
          ))
        )}
      </div>

      {registrars.length > 0 && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalCount={pagination.totalCount}
          hasNext={pagination.hasNext}
          hasPrev={pagination.hasPrev}
          itemsPerPage={10}
          itemName="registrars"
        />
      )}
    </div>
  );
}
