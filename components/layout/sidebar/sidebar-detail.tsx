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
  FileText,
  PlusCircleIcon,
  Receipt,
  ReceiptIcon,
  Package,
} from "lucide-react";

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/auth.context";
import { UserRole } from "@/app/types/auth.type";

// Define menu items with role-based access
interface MenuItem {
  title: string;
  icon: React.ComponentType<any>;
  url: string;
  roles: UserRole[];
}

const menuItems: MenuItem[] = [
  {
    title: "today",
    icon: Calendar,
    url: "/today",
    roles: [UserRole.ADMIN, UserRole.REGISTRAR, UserRole.TEACHER],
  },
  {
    title: "schedule",
    icon: Calendar,
    url: "/schedule",
    roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  },
  {
    title: "courses",
    icon: BookOpen,
    url: "/courses",
    roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  },
  // {
  //   title: "packages",
  //   icon: Package,
  //   url: "/packages",
  //   roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  // },
  {
    title: "students",
    icon: Users,
    url: "/students",
    roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  },
  {
    title: "teachers",
    icon: GraduationCap,
    url: "/teachers",
    roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  },
  {
    title: "parents",
    icon: UserCheck,
    url: "/parents",
    roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  },
  {
    title: "registrars",
    icon: UserCheck,
    url: "/registrars",
    roles: [UserRole.ADMIN],
  },
  {
    title: "fees & Discounts",
    icon: Percent,
    url: "/management-fee",
    roles: [UserRole.ADMIN],
  },
  // {
  //   title: "notifications",
  //   icon: Bell,
  //   url: "/notifications",
  //   roles: [UserRole.ADMIN],
  // },
  {
    title: "feedback",
    icon: MessageSquare,
    url: "/feedback",
    roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  },
  {
    title: "create Invoice",
    icon: FileText,
    url: "/create-invoice",
    roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  },
  {
    title: "invoices & Receipts",
    icon: ReceiptIcon,
    url: "/invoices",
    roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  },
  // {
  //   title: "receipts",
  //   icon: Receipt,
  //   url: "/receipts",
  //   roles: [UserRole.ADMIN, UserRole.REGISTRAR],
  // },
  {
    title: "My Schedules",
    icon: Calendar,
    url: "/my-schedules",
    roles: [UserRole.TEACHER],
  },
];

export function SidebarDetail() {
  const { user } = useAuth();
  const pathname2 = usePathname().split("/")[1];

  // Filter menu items based on user role
  const filteredMenuItems = menuItems.filter(
    (item) => user && item.roles.includes(user.role)
  );

  return (
    <SidebarMenu className="space-y-0">
      {filteredMenuItems.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            isActive={pathname2 === item.title}
            className="group relative h-10 px-3 text-gray-700 hover:scale-105  transition-all duration-200 hover:border hover:border-yellow-500 hover:text-yellow-500 data-[active=true]:text-yellow-500 data-[active=true]:bg-transparent data-[active=true]:font-medium"
          >
            <Link href={item.url} className="flex items-center gap-3">
              <item.icon className="h-4 w-4" />
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
