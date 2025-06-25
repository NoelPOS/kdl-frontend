import React from "react";
import { Parent } from "@/app/types/parent.type";
import { Button } from "@/components/ui/button";

export function ParentCard({ parent }: { parent: Parent }) {
  return (
    <div className="bg-purple-100 rounded-lg p-4 border border-purple-100 relative max-w-[250px]">
      <div className="flex flex-col items-center text-center mb-4">
        <div className="h-16 w-16 mb-3 bg-purple-300 rounded-full flex items-center justify-center text-2xl font-bold text-white">
          {parent.name.charAt(0)}
        </div>
        <h3 className="font-semibold text-purple-500 mb-2">{parent.name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div>Email: {parent.email}</div>
          <div>Phone: {parent.phone}</div>
          <div>Status: {parent.active ? "Active" : "Inactive"}</div>
        </div>
      </div>
      <Button className="w-full bg-purple-400 hover:bg-purple-500 cursor-pointer">
        Details
      </Button>
    </div>
  );
}
