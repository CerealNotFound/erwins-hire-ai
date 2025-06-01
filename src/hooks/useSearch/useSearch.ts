"use client";
import { useState } from "react";

export const useSearch = (engine: "gemini" | "openai" = "gemini") => {
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [reformulatedQuery, setReformulatedQuery] = useState<string>();
  const [currentSearchId, setCurrentSearchId] = useState<string | null>(null);

  const searchCandidates = async (
    query: string,
    filters?: {
      min_experience?: number;
      max_experience?: number;
      required_skills?: string[];
      location?: string;
    }
  ) => {
    if (!query.trim()) return null;

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
      
      // CRITICAL: Capture the search ID from response
      const newSearchId = data.searchId || data.queryId;
      
      setSearchResults(data.data || []);
      setReformulatedQuery(data.reformulatedQuery);
      setCurrentSearchId(newSearchId);
      
      return newSearchId; // Return so parent component can use it
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
      setCurrentSearchId(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { 
    searchCandidates, 
    loading, 
    searchResults, 
    setSearchResults, 
    reformulatedQuery,
    currentSearchId,
    setCurrentSearchId
  };
};