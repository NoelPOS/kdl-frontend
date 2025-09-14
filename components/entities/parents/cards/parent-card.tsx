"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Parent } from "@/app/types/parent.type";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, User } from "lucide-react";
import { useRouter } from "next/navigation";

export function ParentCard({ parent }: { parent: Parent }) {
  const router = useRouter();
  return (
    <div className="bg-blue-100 rounded-lg p-4 border border-blue-100 relative w-full max-w-xs min-w-[240px]">
      <div className="flex flex-col items-center text-center mb-4">
        <Avatar className="h-16 w-16 mb-3">
          <AvatarImage src={parent.profilePicture} alt={parent.name} />
          <AvatarFallback>{parent.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <h3 className="font-semibold text-blue-500 mb-2">{parent.name}</h3>
        <div className="space-y-1 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {parent.name}
          </div>
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            {parent.email}
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            {parent.contactNo}
          </div>
        </div>
      </div>
      <Button
        className="w-full bg-blue-400 hover:bg-blue-500 cursor-pointer"
        onClick={() => router.push(`/parent/${parent.id}`)}
      >
        Details
      </Button>
    </div>
  );
}
