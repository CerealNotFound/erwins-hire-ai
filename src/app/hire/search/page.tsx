"use client";

import React, { useEffect, useState } from "react";
import { SearchInput } from "@/components/search/SearchInput";
import { useSearch } from "@/hooks/useSearch/useSearch";
import { useApiToast } from "@/components/promise-sonner/promise-sonner";
import { SearchSidebar } from "@/components/search/SearchSidebar";
import { EmptyState } from "@/components/search/EmptyState";
import { SearchResults } from "@/components/search/SearchResults";
import { CandidateDetailSidebar } from "@/components/search/CandidateDetailSidebar";
import { ProjectEntry } from "@/engine/resumeExtractors/geminiExtractor";

export interface ProcessedCandidate {
  id: string;
  full_name: string;
  linkedin_url: string;
  title: string;
  location: string;
  skills: string[];
  about: string;
  experience: any;
  github_url: string;
  education: any;
  email: string;
  portfolio_url: string;
  projects: ProjectEntry[];
  experience_years: number;
  blog_url: string;
  similarity: number;
  skill_match_score: number;
  semantic_match_score: number;
  skill_match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  overall_score: number;
  experience_match: string;
  shortlisted: boolean;
}

export default function Search() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSearchId, setActiveSearchId] = useState<null | string>(null);
  const [selectedCandidate, setSelectedCandidate] =
    useState<ProcessedCandidate | null>(null);
  const [searches, setSearches] = useState<
    { id: string; query_text: string }[] | null
  >(null);

  const {
    searchCandidates,
    loading,
    searchResults,
    setSearchResults,
    currentSearchId,
  } = useSearch();

  const { callApi } = useApiToast();

  const fetchSearches = async () => {
    await callApi({
      url: "/api/searches",
      method: "GET",
      loadingMessage: `Updating searches...`,
      successMessage: () => "Searches updated successfully!",
      errorMessage: (err) => `Loading failed: ${err.message}`,
      onSuccess: (response) => {
        setSearches(response);
      },
    });
  };

  const fetchSearchCandidates = async () => {
    await callApi({
      url: `/api/searches/candidates?searchId=${activeSearchId}`,
      method: "GET",
      loadingMessage: `Loading candidates...`,
      successMessage: () => "Candidates loaded successfully!",
      errorMessage: (err) => `Loading candidates failed: ${err.message}`,
      onError: (response) => {
        console.error("❌ Failed to load candidates");
        return;
      },
      onSuccess: (response) => {
        console.log(response);
        setSearchResults(response);
      },
    });
  };

  const handleNewSearch = async (query: string) => {
    const newSearchId = await searchCandidates(query);
    if (newSearchId) {
      await fetchSearches();
      setActiveSearchId(newSearchId);
    }
  };

  const handleSearchSelect = (searchId: string) => {
    setActiveSearchId(searchId);
  };

  const toggleSidebar = () => setIsOpen(!isOpen);

  useEffect(() => {
    if (activeSearchId && activeSearchId.trim() !== "") {
      fetchSearchCandidates();
    }
  }, [activeSearchId]);

  useEffect(() => {
    fetchSearches();
  }, []);

  useEffect(() => {
    if (currentSearchId) {
      setActiveSearchId(currentSearchId);
    }
  }, [currentSearchId]);

  return (
    <div className="flex min-h-screen bg-neutral-950">
      <SearchSidebar
        isOpen={isOpen}
        onToggle={toggleSidebar}
        searches={searches}
        activeSearchId={activeSearchId}
        onSearchSelect={handleSearchSelect}
      />

      {/* Main Content */}
      <div
        className={`flex min-h-screen ${
          // isOpen ? "w-5/6" :
          "w-full"
        } flex-col bg-neutral-950 transition-all`}
      >
        {/* Content Area */}
        <div className="flex min-h-screen w-full flex-col bg-neutral-950">
          {searchResults.length === 0 ? (
            <EmptyState />
          ) : (
            <SearchResults
              results={searchResults}
              selectedCandidate={selectedCandidate}
              searchId={activeSearchId as string}
              onCandidateSelect={setSelectedCandidate}
            />
          )}

          {/* Search Input - Sticky at bottom */}
          <div className="sticky bottom-0 w-full flex flex-col items-center bg-neutral-950/75 backdrop-blur-sm border-t border-neutral-800">
            <div className="w-full max-w-4xl px-6 py-4">
              <SearchInput
                searchHandler={handleNewSearch}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Detail Sidebar */}
      {selectedCandidate && (
        <CandidateDetailSidebar
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
