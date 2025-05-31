"use client";
import { useState } from "react";
import { Candidate, queryPipeline } from "@/lib/query/queryPipeline";

export const useSearch = (engine: "gemini" | "openai" = "gemini") => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<Candidate[]>([]);
  const [reformulatedQuery, setReformulatedQuery] = useState<string>();

  const searchCandidates = async (
    query: string,
    filters?: {
      min_experience?: number;
      max_experience?: number;
      required_skills?: string[];
      location?: string;
    }
  ) => {
    if (!query.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/retrieve-candidate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, filters }),
      });

      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data = await response.json();
      setSearchResults(data.data || []);
      setReformulatedQuery(data.reformulatedQuery);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  return { searchCandidates, loading, searchResults, reformulatedQuery };
};
