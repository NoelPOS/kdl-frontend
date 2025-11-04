"use client";

import type * as React from "react";
import { LogOut, MenuIcon } from "lucide-react";
import { useAuth } from "@/context/auth.context";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import SidebarDetail from "./sidebar-detail";

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <>
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <SidebarTrigger className="h-12 w-12 bg-yellow-500 hover:bg-yellow-600 shadow-lg hover:shadow-xl transition-all duration-200">
          <MenuIcon className="h-12 w-12 " /> 
        </SidebarTrigger>
      </div>

      <Sidebar className="border-r border-gray-200" {...props}>
        <SidebarHeader className="p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="/student.png" alt={user?.name || "User"} />
              <AvatarFallback className="bg-gray-200 text-gray-600">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="font-semibold text-gray-900">
                {user?.name || "User"}
              </span>
              <span className="text-sm text-gray-500 capitalize">
                {user?.role || "User"}
              </span>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent className="px-4 py-2">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarDetail />
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="p-4">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="group w-full justify-start h-10 px-3 text-gray-700 hover:text-yellow-500 hover:scale-105 transition-all duration-200 hover:border hover:border-yellow-500"
          >
            <LogOut className="h-4 w-4 mr-3" />
            <span>Logout</span>
          </Button>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}

export default AppSidebar;
