import "../globals.css";
import { SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/layout/sidebar/sidebar";

export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen min-w-screen bg-gray-100 relative">
        <AppSidebar />
        <main className="flex-1 bg-my-yellow">{children}</main>
      </div>
    </SidebarProvider>
  );
}
