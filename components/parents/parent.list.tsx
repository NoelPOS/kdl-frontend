import React from "react";
import { ParentCard } from "./parent-card";
import { fetchParents, searchParents } from "@/lib/axio";

export default async function ParentList({ query }: { query: string }) {
  let parents;
  if (query) {
    parents = await searchParents(query);
  } else {
    parents = await fetchParents();
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {parents.map((parent) => (
        <ParentCard key={parent.id} parent={parent} />
      ))}
    </div>
  );
}
