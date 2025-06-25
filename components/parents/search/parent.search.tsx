"use client";
import { Search } from "lucide-react";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";

export default function ParentSearch() {
  const [search, setSearch] = useState("");
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    console.log("Search parents:", e.target.value);
  };
  return (
    <div className="relative flex-2/4">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black h-4 w-4" />
      <Input
        placeholder="Search ..."
        className="pl-10 w-[20rem] rounded-full border-black"
        onChange={handleSearch}
        value={search}
      />
    </div>
  );
}
