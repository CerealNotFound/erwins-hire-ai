"use client";
import {
  Calendar,
  Radio,
  Inbox,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";
import { usePathname } from "next/navigation";
import Link from "next/link";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/hire",
    icon: LayoutDashboard,
  },
  {
    title: "Campaign",
    url: "/hire/campaign",
    icon: Radio,
  },
  {
    title: "Calendar",
    url: "/hire/calendar",
    icon: Calendar,
  },
  {
    title: "Search",
    url: "/hire/search",
    icon: Search,
  },
  {
    title: "Settings",
    url: "/hire/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <Sidebar className="font-[Inter]">
      <SidebarContent className="bg-black">
        <SidebarGroup>
          <SidebarGroupLabel>Application</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => {
                const isActive =
                  pathname === item.url ||
                  (item.url === "/hire" && pathname === "/hire");

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`${isActive ? "!bg-white !text-black" : ""}`}
                    >
                      <Link href={item.url}>
                        <item.icon strokeWidth={2.2} className="m-1" />
                        <span
                          className={cn(
                            // "transition-colors",
                            isActive ? "text-black" : "text-white"
                          )}
                        >
                          {item.title}
                        </span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
