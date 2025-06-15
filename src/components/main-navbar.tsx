"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Compass, Search, Upload, User } from "lucide-react";

export const MainNavbar = () => {
  return (
    <div className="w-full border-b h-14 fixed z-10 top-0 border-neutral-200 dark:border-neutral-800 bg-white/90 dark:bg-neutral-950/75 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <div className="text-2xl font-bold tracking-tight">
              <span className="text-orange-500">Hire</span>
              <span className="text-neutral-900 dark:text-white">AI</span>
            </div>
          </a>

          {/* Navigation as */}
          <div className="flex items-center space-x-1">
            <a href="/outreach">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Compass className="w-4 h-4 mr-2" />
                Outreach
              </Button>
            </a>

            <a href="/shortlisted">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <User className="w-4 h-4 mr-2" />
                Shortlisted
              </Button>
            </a>

            <a href="/upload">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </a>

            <a href="/search">
              <Button
                variant="ghost"
                size="sm"
                className="text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <Search className="w-4 h-4 mr-2" />
                Search
              </Button>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
