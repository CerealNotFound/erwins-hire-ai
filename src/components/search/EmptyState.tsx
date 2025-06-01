"use client";

import React from "react";
import { Flower } from "lucide-react";

export const EmptyState = () => {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-6">
      <div className="text-center max-w-md">
        <Flower
          width={48}
          height={48}
          className="text-orange-600 animate-slow-spin mx-auto mb-6"
        />
        <h2 className="text-3xl font-bold text-white mb-3">Find Perfect Candidates</h2>
        <p className="text-neutral-400 text-lg">
          Search through our database of talented professionals
        </p>
      </div>
    </div>
  );
};