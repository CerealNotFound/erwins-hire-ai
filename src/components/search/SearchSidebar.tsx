"use client";

import React from "react";
import { Sidebar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApiToast } from "../promise-sonner/promise-sonner";
import { useRouter } from "next/navigation";

interface SearchSidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  searches: { id: string; query_text: string }[] | null;
  activeSearchId: string | null;
  onSearchSelect: (searchId: string) => void;
}

export const SearchSidebar = ({
  isOpen,
  onToggle,
  searches,
  activeSearchId,
  onSearchSelect,
}: SearchSidebarProps) => {
  const router = useRouter();
  const { callApi } = useApiToast();

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
    <>
      <div
        className={`${isOpen ? "w-1/6 transition-all" : "transition-all w-0"}`}
      >
        <div
          className={`fixed ${
            isOpen ? "w-1/6" : "w-0 hidden"
          } h-screen mt-14 bg-neutral-900 border-r border-neutral-700 transition-all`}
        >
          <div className="p-2 ml-1/6 border-b border-neutral-700">
            <Button
              onClick={onToggle}
              variant="ghost"
              className="text-neutral-300 hover:bg-neutral-800 w-full justify-start"
            >
              <Sidebar className="w-4 h-4 mr-2" />
              Recent Searches
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

          <div className="p-4">
            <div
              className="flex flex-col text-sm space-y-2 overflow-y-auto"
              style={{ height: "calc(100vh - 100px)" }}
            >
              {searches &&
                searches.map((search) => (
                  <div
                    key={search.id}
                    className={`hover:bg-neutral-800 flex gap-2 items-center p-3 rounded-lg cursor-pointer transition-colors ${
                      search.id === activeSearchId ? "bg-neutral-800" : ""
                    }`}
                    onClick={() => onSearchSelect(search.id)}
                  >
                    <div className="text-neutral-300">{search.query_text}</div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <div className="fixed top-20 left-4 z-50">
          <Button
            onClick={onToggle}
            variant="ghost"
            className="text-neutral-300 hover:bg-neutral-800 bg-neutral-900/80 backdrop-blur-sm border border-neutral-700"
          >
            <Sidebar className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );
};
