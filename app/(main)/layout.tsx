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
      <div className="flex min-h-screen w-full  relative">
        <AppSidebar />
        <main className="flex-1 min-w-0 bg-my-yellow overflow-x-auto pt-10 md:pt-0">{children}</main>
      </div>
    </SidebarProvider>
  );
}
