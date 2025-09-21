"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MenuIcon, X } from "lucide-react";

interface ResponsiveDetailLayoutProps {
  children: React.ReactNode;
  rightContent: React.ReactNode;
  detailTitle: string;
  detailDescription?: string;
}

export default function ResponsiveDetailLayout({
  children,
  rightContent,
  detailTitle,
  detailDescription = "Detail information",
}: ResponsiveDetailLayoutProps) {
  const [isMobileDetailOpen, setIsMobileDetailOpen] = useState(false);

  return (
    <div className="relative">
      {/* Mobile Trigger Button */}
      <div className="fixed top-4 right-4 z-50 md:hidden">
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 bg-yellow-500 hover:bg-yellow-600 shadow-lg hover:shadow-xl transition-all duration-200 border-none"
          onClick={() => setIsMobileDetailOpen(true)}
        >
          <MenuIcon className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Mobile Sheet */}
      <Sheet open={isMobileDetailOpen} onOpenChange={setIsMobileDetailOpen}>
        <SheetContent
          side="left"
          className="w-80 p-0 overflow-y-auto"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>{detailTitle}</SheetTitle>
            <SheetDescription>{detailDescription}</SheetDescription>
          </SheetHeader>
          {children}
        </SheetContent>
      </Sheet>

      {/* Desktop & Mobile Layout */}
      <div className="flex min-h-screen">
        {/* Left Side - Detail Panel (hidden on mobile) */}
        <div className="hidden md:block">
          {children}
        </div>

        {/* Right Side - Main Content with mobile padding */}
        <div className="flex-1 w-full min-w-0 pt-20 md:pt-0">
          {rightContent}
        </div>
      </div>
    </div>
  );
}