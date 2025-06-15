"use client";

import React from "react";
import { useAtom } from "jotai";
import { CandidateRow } from "./CandidateRow";
import { ProcessedCandidate } from "@/app/search/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  selectedCandidateIdsAtom, 
  selectedCandidatesAtom,
  selectedCandidatesCountAtom,
  clearAllSelectionsAtom,
  selectAllCandidatesAtom 
} from "@/lib/atoms/selectedCandidates";
import { 
  Users, 
  Send, 
  X, 
  CheckSquare, 
  Square 
} from "lucide-react";

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
  const [selectedIds] = useAtom(selectedCandidateIdsAtom);
  const [selectedCandidates] = useAtom(selectedCandidatesAtom);
  const [selectedCount] = useAtom(selectedCandidatesCountAtom);
  const [, clearAllSelections] = useAtom(clearAllSelectionsAtom);
  const [, selectAllCandidates] = useAtom(selectAllCandidatesAtom);

  const allSelected = selectedCount === results.length && results.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < results.length;

  const handleSelectAll = () => {
    if (allSelected) {
      clearAllSelections();
    } else {
      selectAllCandidates(results);
    }
  };

  const handleAddToOutreach = async () => {
    // Dummy function for now - you'll implement the real logic
    console.log("Adding to outreach:", selectedCandidates);
    alert(`Adding ${selectedCount} candidates to outreach!`);
    // Clear selections after adding to outreach
    clearAllSelections();
  };

  return (
    <div className="flex-1 mt-10 overflow-y-auto px-6 py-6">
      <div className="max-w-5xl mx-auto">
        {/* Header with Batch Actions */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-2xl font-semibold text-white mb-2">
                Search Results ({results.length})
              </h3>
              <p className="text-neutral-400 text-lg">
                Found {results.length} matching candidates
              </p>
            </div>

            {/* Batch Actions */}
            {selectedCount > 0 && (
              <div className="flex items-center gap-3">
                <Badge variant="outline" className="text-emerald-400 border-emerald-400">
                  <Users className="w-4 h-4 mr-1" />
                  {selectedCount} selected
                </Badge>
                
                <Button
                  onClick={handleAddToOutreach}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="sm"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Add to Outreach
                </Button>
                
                <Button
                  onClick={clearAllSelections}
                  variant="ghost"
                  size="sm"
                  className="text-neutral-400 hover:text-white"
                >
                  <X className="w-4 h-4 mr-2" />
                  Clear
                </Button>
              </div>
            )}
          </div>

          {/* Select All Controls */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              onClick={handleSelectAll}
              variant="ghost"
              size="sm"
              className="text-neutral-400 hover:text-white"
            >
              {allSelected ? (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Deselect All
                </>
              ) : (
                <>
                  <Square className="w-4 h-4 mr-2" />
                  Select All
                </>
              )}
            </Button>
            
            {someSelected && (
              <span className="text-sm text-neutral-500">
                ({selectedCount} of {results.length} selected)
              </span>
            )}
          </div>
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