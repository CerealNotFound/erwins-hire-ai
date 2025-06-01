"use client";

import React from "react";
import { CandidateRow } from "./CandidateRow";
import { ProcessedCandidate } from "@/app/search/page";

interface SearchResultsProps {
  results: ProcessedCandidate[];
  selectedCandidate: ProcessedCandidate | null;
  onCandidateSelect: (candidate: ProcessedCandidate) => void;
  searchId: string;
}

export const SearchResults = ({
  results,
  selectedCandidate,
  onCandidateSelect,
  searchId,
}: SearchResultsProps) => {
  return (
    <div className="flex-1 overflow-y-auto px-6 py-6">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h3 className="text-2xl font-semibold text-white mb-2">
            Search Results ({results.length})
          </h3>
          <p className="text-neutral-400 text-lg">
            Found {results.length} matching candidates
          </p>
        </div>

        <div className="space-y-6">
          {results.map((candidate) => (
            <CandidateRow
              key={candidate.id}
              candidate={candidate}
              onClick={() => onCandidateSelect(candidate)}
              isSelected={selectedCandidate?.id === candidate.id}
              searchId={searchId}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
