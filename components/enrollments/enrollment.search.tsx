"use client";

import { Search } from "lucide-react";
import React from "react";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useDebouncedCallback } from "use-debounce";
import { Input } from "../ui/input";

const EnrollmentSearch = () => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { replace } = useRouter();

  const handleSearch = useDebouncedCallback((term: string) => {
    const params = new URLSearchParams(searchParams);
    if (term) {
      params.set("query", term);
    } else {
      params.delete("query");
    }
    replace(`${pathname}?${params.toString()}`);
  }, 300);

  return (
    <div className="relative flex-2/4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
      <Input
        placeholder="Search invoices..."
        className="pl-10 w-[20rem] rounded-full border-black"
        onChange={(e) => {
          handleSearch(e.target.value);
        }}
        defaultValue={searchParams.get("query")?.toString()}
      />
    </div>
  );
};

export default EnrollmentSearch;
