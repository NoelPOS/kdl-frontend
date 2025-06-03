"use client";

import type * as React from "react";
import {
  Calendar,
  BookOpen,
  Users,
  GraduationCap,
  UserCheck,
  Percent,
  Bell,
  MessageSquare,
  User,
  FileText,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Menu items data
const menuItems = [
  {
    title: "today",
    icon: Calendar,
    url: "/",
    isActive: true,
  },
  {
    title: "schedule",
    icon: Calendar,
    url: "schedule",
  },
  {
    title: "courses",
    icon: BookOpen,
    url: "courses",
  },
  {
    title: "students",
    icon: Users,
    url: "students",
  },
  {
    title: "teachers",
    icon: GraduationCap,
    url: "#",
  },
  {
    title: "parents",
    icon: UserCheck,
    url: "#",
  },
  {
    title: "discount",
    icon: Percent,
    url: "#",
  },
  {
    title: "notifications",
    icon: Bell,
    url: "#",
  },
  {
    title: "feedback",
    icon: MessageSquare,
    url: "#",
  },
  {
    title: "users",
    icon: User,
    url: "#",
  },
  {
    title: "invoices",
    icon: FileText,
    url: "#",
  },
];

export function SidebarDetail() {
  const pathname2 = usePathname().slice(1); // Remove leading slash
  return (
    <SidebarMenu className="space-y-0">
      {menuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={pathname2 == item.title}
            className="group relative h-10 px-3 text-gray-700 hover:scale-105  transition-all duration-200 hover:border hover:border-yellow-500 hover:text-yellow-500 data-[active=true]:text-yellow-500 data-[active=true]:bg-transparent data-[active=true]:font-medium"
          >
            <Link href={item.url} className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
              {/* capatilize the item.title */}
              <span className="hidden sm:inline-block transition-all duration-200">
                {item.title.charAt(0).toUpperCase() + item.title.slice(1)}
              </span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}

export default SidebarDetail;
