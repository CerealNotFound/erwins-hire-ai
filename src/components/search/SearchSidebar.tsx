"use client";

import React from "react";
import { Sidebar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "../ui/scroll-area";

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
  return (
    <>
      <div
        className={`w-1/6 absolute z-1 m-4 rounded-md border bg-neutral-900 h-[60vh] transition-all ${
          isOpen ? "translate-x-0" : "-translate-x-[100vw]"
        }`}
      >
        <div className={`border-neutral-700 transition-all`}>
          <div className="p-2 ml-1/6 border-b border-neutral-700">
            <Button
              onClick={onToggle}
              variant="ghost"
              className="text-neutral-300 hover:bg-neutral-800 w-full justify-start"
            >
              <Sidebar className="w-4 h-4 mr-2" />
              Close recent searches
            </Button>
          </div>

          <ScrollArea className="p-2 h-[50vh]">
            <div className="flex flex-col text-sm space-y-2 overflow-y-auto">
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
          </ScrollArea>
        </div>
      </div>

      {/* Floating Toggle Button */}
      {!isOpen && (
        <div className="absolute z-1 p-4">
          <Button
            onClick={onToggle}
            variant="ghost"
            className="text-neutral-300 hover:bg-neutral-800 bg-neutral-900/80 backdrop-blur-sm border border-neutral-700"
          >
            See recent searches
            <Sidebar className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );
};
