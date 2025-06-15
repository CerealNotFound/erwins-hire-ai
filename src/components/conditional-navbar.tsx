"use client";
import { usePathname } from "next/navigation";
import { MainNavbar } from "./main-navbar";

export function ConditionalNavbar() {
  const pathname = usePathname();

  const sidebarRoutes = ["/hire"];
  const hasSidebar = sidebarRoutes.some((route) => pathname.startsWith(route));

  if (hasSidebar) {
    return null;
  }

  return <MainNavbar />;
}
