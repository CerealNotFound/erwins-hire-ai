import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarNavbar } from "@/components/sidebar-navbar";

export default function SidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <SidebarNavbar />
        <main className="flex-1">{children}</main>
      </div>
    </SidebarProvider>
  );
}
