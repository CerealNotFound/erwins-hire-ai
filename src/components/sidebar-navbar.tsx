"use client";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useApiToast } from "./promise-sonner/promise-sonner";
import { useRouter } from "next/navigation";
// Add any other sidebar-specific nav items you need

export function SidebarNavbar() {
  const { callApi } = useApiToast();
  const router = useRouter();

  const signout = () => {
    callApi({
      url: "/api/auth/signout",
      method: "POST",
      loadingMessage: "Signing out...",
      successMessage: () => "Signed out successfully! :D",
      errorMessage: (err) => `Sign out failed: ${err.message}`,
      onSuccess: (data) => {
        console.log("User Signed in:", data);
        router.push("/login");
      },
    });
  };

  return (
    <nav className="flex items-center justify-between p-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex items-center gap-4">
        <SidebarTrigger />
        {/* <h1 className="text-xl font-semibold">Dashboard</h1> */}
      </div>

      {/* Add sidebar-specific nav items */}
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm">
          Settings
        </Button>
        <Button variant="ghost" size="sm">
          Profile
        </Button>
        <Button
          size={"sm"}
          variant="ghost"
          className="text-neutral-300 hover:bg-neutral-800 w-18 justify-start"
          onClick={signout}
        >
          Logout
        </Button>
      </div>
    </nav>
  );
}
