"use client";

import React, { useState } from "react";
import { useAtom } from "jotai";
import { CandidateRow } from "./CandidateRow";
import { ProcessedCandidate } from "@/app/search/page";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  selectedCandidateIdsAtom,
  selectedCandidatesAtom,
  selectedCandidatesCountAtom,
  clearAllSelectionsAtom,
  selectAllCandidatesAtom,
} from "@/lib/atoms/selectedCandidates";
import {
  campaignsAtom,
  loadingCampaignsAtom,
  Campaign,
} from "@/lib/atoms/campaigns";
import {
  Users,
  Send,
  X,
  CheckSquare,
  Square,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  Mail,
} from "lucide-react";
import { toast } from "sonner";

interface SearchResultsProps {
  results: ProcessedCandidate[];
  selectedCandidate: ProcessedCandidate | null;
  onCandidateSelect: (candidate: ProcessedCandidate) => void;
  searchId: string;
  campaignId?: string; // Optional campaign context
}

interface OutreachProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  currentCandidate: string;
  isProcessing: boolean;
  failedCandidates: string[];
}

// Types for question generation
interface QuestionGenerationRequest {
  role: string;
  candidateProfile: {
    name: string;
    resume: string;
    projects?: string[];
    skills: string[];
    experience_years: number;
  };
  assessmentConfig: {
    difficulty_levels: {
      level_1: { count: number };
      level_2: { count: number };
      level_3: { count: number };
      level_4: { count: number };
      level_5: { count: number };
    };
    culture_questions: string[];
  };
}

interface GeneratedQuestion {
  id: string;
  question: string;
  difficulty_level: number;
  category: string;
  expected_focus: string;
}

interface QuestionGenerationResponse {
  questions: GeneratedQuestion[];
  total_questions: number;
}

export const SearchResults = ({
  results,
  selectedCandidate,
  onCandidateSelect,
  searchId,
  campaignId,
}: SearchResultsProps) => {
  const [selectedIds] = useAtom(selectedCandidateIdsAtom);
  const [selectedCandidates] = useAtom(selectedCandidatesAtom);
  const [selectedCount] = useAtom(selectedCandidatesCountAtom);
  const [, clearAllSelections] = useAtom(clearAllSelectionsAtom);
  const [, selectAllCandidates] = useAtom(selectAllCandidatesAtom);

  // Campaign atoms
  const [campaigns] = useAtom(campaignsAtom);
  const [loadingCampaigns] = useAtom(loadingCampaignsAtom);

  // Dialog state
  const [showCampaignDialog, setShowCampaignDialog] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("");

  // Outreach state
  const [outreachProgress, setOutreachProgress] = useState<OutreachProgress>({
    total: 0,
    processed: 0,
    successful: 0,
    failed: 0,
    currentCandidate: "",
    isProcessing: false,
    failedCandidates: [],
  });

  const allSelected = selectedCount === results.length && results.length > 0;
  const someSelected = selectedCount > 0 && selectedCount < results.length;

  const handleSelectAll = () => {
    if (allSelected) {
      clearAllSelections();
    } else {
      selectAllCandidates(results);
    }
  };

  // Enhanced handleAddToOutreach with progress tracking
  const handleAddToOutreach = async (targetCampaignId: string) => {
    // Initialize progress tracking
    setOutreachProgress({
      total: selectedCandidates.length,
      processed: 0,
      successful: 0,
      failed: 0,
      currentCandidate: "",
      isProcessing: true,
      failedCandidates: [],
    });

    try {
      console.log(
        "🚀 Starting outreach process for:",
        selectedCandidates.length,
        "candidates"
      );

      // Single API call to backend - let it handle everything
      const response = await fetch("/api/outreach-campaigns/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId: targetCampaignId,
          candidates: selectedCandidates,
        }),
      });

      if (!response.ok) {
        throw new Error(`Outreach failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Update progress with final results
      setOutreachProgress((prev) => ({
        ...prev,
        isProcessing: false,
        processed: result.processed,
        successful: result.successes,
        failed: result.failures,
        failedCandidates: result.results
          .filter((r: any) => !r.success)
          .map((r: any) => r.candidateName),
      }));

      console.log(
        `✅ Outreach complete: ${result.successes}/${result.processed} successful`
      );

      toast.success(
        `Outreach complete: ${result.successes}/${result.processed} successful`
      );

      clearAllSelections();
      setOutreachProgress({
        total: 0,
        processed: 0,
        successful: 0,
        failed: 0,
        currentCandidate: "",
        isProcessing: false,
        failedCandidates: [],
      });
    } catch (error: any) {
      console.error("❌ Outreach process failed:", error);
      setOutreachProgress((prev) => ({
        ...prev,
        isProcessing: false,
        failed: prev.total,
        successful: 0,
      }));
    }
  };
  // Handle opening campaign selection dialog
  const handleOpenCampaignDialog = () => {
    if (campaignId) {
      // If we already have a campaign context, use it directly
      handleAddToOutreach(campaignId);
    } else {
      // Open dialog to select campaign
      setShowCampaignDialog(true);
    }
  };

  // Handle campaign selection and start outreach
  const handleCampaignSelection = () => {
    if (!selectedCampaignId) return;

    setShowCampaignDialog(false);
    handleAddToOutreach(selectedCampaignId);
    setSelectedCampaignId("");
  };

  const progressPercentage =
    outreachProgress.total > 0
      ? (outreachProgress.processed / outreachProgress.total) * 100
      : 0;

  return (
    <>
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
              {selectedCount > 0 && !outreachProgress.isProcessing && (
                <div className="flex items-center gap-3">
                  <Badge
                    variant="outline"
                    className="text-emerald-400 border-emerald-400"
                  >
                    <Users className="w-4 h-4 mr-1" />
                    {selectedCount} selected
                  </Badge>

                  <Button
                    onClick={handleOpenCampaignDialog}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                    disabled={outreachProgress.isProcessing}
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

            {/* Progress Tracking */}
            {outreachProgress.isProcessing && (
              <div className="mb-6 p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" />
                    <span className="text-white font-medium">
                      Processing Outreach
                    </span>
                  </div>
                  <div className="text-sm text-neutral-400">
                    {outreachProgress.processed} of {outreachProgress.total}
                  </div>
                </div>

                <Progress value={progressPercentage} className="mb-2 h-2" />

                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">
                    Current: {outreachProgress.currentCandidate}
                  </span>
                  <div className="flex items-center gap-4">
                    <span className="text-emerald-400">
                      <CheckCircle className="w-3 h-3 inline mr-1" />
                      {outreachProgress.successful}
                    </span>
                    {outreachProgress.failed > 0 && (
                      <span className="text-red-400">
                        <AlertCircle className="w-3 h-3 inline mr-1" />
                        {outreachProgress.failed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Completion Status */}
            {!outreachProgress.isProcessing && outreachProgress.total > 0 && (
              <div className="mb-6 p-4 bg-neutral-800/50 border border-neutral-700 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                  <span className="text-white font-medium">
                    Outreach Complete
                  </span>
                </div>
                <div className="text-sm text-neutral-400">
                  {outreachProgress.successful} candidates successfully added to
                  outreach
                  {outreachProgress.failed > 0 && (
                    <span className="text-red-400 ml-2">
                      • {outreachProgress.failed} failed
                    </span>
                  )}
                </div>
                {outreachProgress.failedCandidates.length > 0 && (
                  <div className="mt-2 text-xs text-red-400">
                    Failed: {outreachProgress.failedCandidates.join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* Select All Controls */}
            {!outreachProgress.isProcessing && (
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
            )}
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

      {/* Campaign Selection Dialog */}
      <Dialog open={showCampaignDialog} onOpenChange={setShowCampaignDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Select Campaign</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <Select
              value={selectedCampaignId}
              onValueChange={setSelectedCampaignId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose campaign..." />
              </SelectTrigger>
              <SelectContent>
                {campaigns.map((campaign) => (
                  <SelectItem key={campaign.id} value={campaign.id}>
                    {campaign.campaign_name} - {campaign.role}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowCampaignDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCampaignSelection}
                disabled={!selectedCampaignId}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Start Outreach
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
