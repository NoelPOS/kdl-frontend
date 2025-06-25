import React from "react";
import { ParentCard } from "./parent-card";
import { Parent } from "@/app/types/parent.type";

const dummyParents: Parent[] = [
  {
    id: 1,
    name: "Alice Brown",
    phone: "111-222-3333",
    email: "alice@example.com",
    active: true,
  },
  {
    id: 2,
    name: "Bob White",
    phone: "444-555-6666",
    email: "bob@example.com",
    active: false,
  },
];

export default function ParentList({
  query,
  active,
}: {
  query: string;
  active: string;
}) {
  let parents = dummyParents;
  if (active === "active") {
    parents = parents.filter((p) => p.active);
  } else if (active === "inactive") {
    parents = parents.filter((p) => !p.active);
  }
  if (query) {
    parents = parents.filter((p) =>
      p.name.toLowerCase().includes(query.toLowerCase())
    );
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-2">
      {parents.map((parent) => (
        <ParentCard key={parent.id} parent={parent} />
      ))}
    </div>
  );
}
