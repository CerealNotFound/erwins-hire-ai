// Updated AI Analysis Results Card with Selection Checkboxes and Finalized Status

import React from "react";
import { useAtom } from "jotai";
import {
  Zap,
  ArrowDown,
  CheckCircle,
  AlertTriangle,
  Target,
  Send,
  Badge,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  selectedRankedCandidateIdsAtom,
  toggleRankedCandidateSelectionAtom,
  RankedCandidate,
} from "@/lib/atoms/selectedRankedCandidates";
import { useState } from "react";
import { Progress } from "@/components/ui/progress";

interface AIAnalysisResultsProps {
  candidateRankings: RankedCandidate[];
  loadingRankings: boolean;
  campaign: any; // Your campaign type
  expandedInsights: Set<string>;
  toggleInsights: (id: string) => void;
}

export const AIAnalysisResults: React.FC<AIAnalysisResultsProps> = ({
  candidateRankings,
  loadingRankings,
  campaign,
  expandedInsights,
  toggleInsights,
}) => {
  const [selectedIds] = useAtom(selectedRankedCandidateIdsAtom);
  const [, toggleSelection] = useAtom(toggleRankedCandidateSelectionAtom);
  const [isSendingEmails, setIsSendingEmails] = useState(false);
  const [sendingProgress, setSendingProgress] = useState(0);

  const handleCheckboxChange = (ranking: RankedCandidate, checked: boolean) => {
    toggleSelection(ranking);
  };

  if (candidateRankings.length === 0 || loadingRankings) {
    return null;
  }

  // Separate candidates into finalized and available
  const availableCandidates = candidateRankings.filter(
    (ranking) => !ranking.is_selected
  );
  const finalizedCandidates = candidateRankings.filter(
    (ranking) => ranking.is_selected
  );

  const handleSendEmails = async () => {
    setIsSendingEmails(true);
    setSendingProgress(0);

    try {
      // Get selected candidates data (only from available candidates)
      const selectedCandidates = availableCandidates.filter((ranking) =>
        selectedIds.has(ranking.id)
      );

      const emails = selectedCandidates.map((ranking) => {
        const candidateData = campaign.conversations.find(
          (c: any) => c.candidates?.id === ranking.candidate_id
        )?.candidates;

        console.log("candidateData", candidateData);

        return {
          candidate: {
            id: ranking.candidate_id,
            full_name: candidateData?.full_name || "Unknown",
            email: candidateData?.email,
          },
          campaign: {
            id: campaign.id,
            role: campaign.role,
            campaign_name: campaign.campaign_name,
            email_config: campaign.email_config,
          },
        };
      });

      setSendingProgress(50);

      const response = await fetch("/api/outreach-campaigns/selection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emails }),
      });

      setSendingProgress(100);

      if (response.ok) {
        const result = await response.json();
        // Handle success - maybe show a toast or update UI
        console.log("Emails sent:", result);
      } else {
        throw new Error("Failed to send emails");
      }
    } catch (error) {
      console.error("Error sending emails:", error);
      // Handle error - maybe show error toast
    } finally {
      setIsSendingEmails(false);
      setTimeout(() => setSendingProgress(0), 1000);
    }
  };

  const renderCandidateCard = (ranking: RankedCandidate, index: number) => {
    // Get candidate data - either embedded or lookup from campaign
    const candidateData =
      ranking.candidate ||
      campaign.conversations.find(
        (c: any) => c.candidates?.id === ranking.candidate_id
      )?.candidates;

    const isSelected = selectedIds.has(ranking.id);
    const isFinalized = ranking.is_selected;

    return (
      <div
        key={ranking.id}
        className={`border rounded-lg p-4 transition-all duration-200 ${
          isFinalized
            ? "bg-neutral-800/30 border-neutral-600 opacity-90"
            : isSelected
            ? "ring-2 ring-emerald-500/50 bg-emerald-900/10 border-emerald-500/30"
            : "border-neutral-700"
        }`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Selection Checkbox - only show for non-finalized candidates */}
            {!isFinalized && (
              <div className="flex items-center pt-1">
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={(checked) =>
                    handleCheckboxChange(ranking, checked as boolean)
                  }
                  className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
                />
              </div>
            )}

            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-100 text-purple-800 font-bold text-sm">
              #{ranking.rank_position}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-semibold text-white">
                  {candidateData?.full_name || "Unknown Candidate"}
                </h4>
                {/* Finalized status badge */}
              </div>
              <p className="text-sm text-neutral-400">
                {candidateData?.title}
                {/* at {candidateData?.current_company} */}
              </p>
              <div className="flex mt-2 gap-2">
                {isFinalized && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-white text-black">
                    {/* <Badge className="h-3 w-3" /> */}
                    Contacted
                  </span>
                )}
                <span
                  className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                    ranking.tier === "exceptional"
                      ? "bg-green-100 text-green-800"
                      : ranking.tier === "excellent"
                      ? "bg-blue-100 text-blue-800"
                      : ranking.tier === "good"
                      ? "bg-yellow-100 text-yellow-800"
                      : ranking.tier === "fair"
                      ? "bg-orange-100 text-orange-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {ranking.tier.charAt(0).toUpperCase() + ranking.tier.slice(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-white">
              {(ranking.final_score * 100).toFixed(2)}%
            </div>
            <div className="text-xs text-neutral-400">Overall Score</div>
          </div>
        </div>

        {/* Score Breakdown */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center p-2 bg-neutral-800/30 rounded">
            <div className="text-lg font-semibold text-blue-400">
              {(ranking.technical_score * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-neutral-400">Technical</div>
          </div>
          <div className="text-center p-2 bg-neutral-800/30 rounded">
            <div className="text-lg font-semibold text-green-400">
              {(ranking.communication_score * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-neutral-400">Communication</div>
          </div>
          <div className="text-center p-2 bg-neutral-800/30 rounded">
            <div className="text-lg font-semibold text-purple-400">
              {(ranking.icp_alignment * 100).toFixed(0)}%
            </div>
            <div className="text-xs text-neutral-400">ICP Alignment</div>
          </div>
        </div>

        {/* Expandable Insights */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleInsights(ranking.id)}
            className="w-full justify-between text-neutral-300 hover:text-white"
          >
            <span>View Detailed Analysis</span>
            <span
              className={`transform transition-transform ${
                expandedInsights.has(ranking.id) ? "rotate-180" : ""
              }`}
            >
              <ArrowDown />
            </span>
          </Button>

          {expandedInsights.has(ranking.id) && (
            <div className="space-y-4 pt-2 border-t border-neutral-300">
              {ranking.strengths.length > 0 && (
                <div>
                  <h5 className="font-medium text-green-400 mb-2 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Strengths
                  </h5>
                  <ul className="space-y-1">
                    {ranking.strengths.map((strength, i) => (
                      <li
                        key={i}
                        className="text-sm text-neutral-300 flex items-start gap-2"
                      >
                        <span className="text-green-400 mt-1">•</span>
                        {strength}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ranking.concerns.length > 0 && (
                <div>
                  <h5 className="font-medium text-red-400 mb-2 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Concerns
                  </h5>
                  <ul className="space-y-1">
                    {ranking.concerns.map((concern, i) => (
                      <li
                        key={i}
                        className="text-sm text-neutral-300 flex items-start gap-2"
                      >
                        <span className="text-red-400 mt-1">•</span>
                        {concern}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {ranking.insights.length > 0 && (
                <div>
                  <h5 className="font-medium text-blue-400 mb-2 flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Key Insights
                  </h5>
                  <ul className="space-y-1">
                    {ranking.insights.map((insight, i) => (
                      <li
                        key={i}
                        className="text-sm text-neutral-300 flex items-start gap-2"
                      >
                        <span className="text-blue-400 mt-1">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="border-none bg-neutral-900/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-purple-500" />
          AI Analysis Results
          {candidateRankings.length > 0 && (
            <span className="text-sm text-neutral-400 ml-2">
              (Last updated:{" "}
              {new Date(candidateRankings[0]?.updated_at).toLocaleDateString()})
            </span>
          )}
          {selectedIds.size > 0 && (
            <div className="flex w-full items-center gap-4">
              <span className="text-sm text-emerald-400 ml-auto">
                {selectedIds.size} selected for outreach
              </span>
              <Button
                onClick={handleSendEmails}
                disabled={isSendingEmails}
                className="cursor-pointer bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
              >
                <Send className="w-4 h-4 mr-2" />
                <span>
                  {isSendingEmails ? "Sending..." : "Send confirmation email"}
                </span>
              </Button>
              {isSendingEmails && (
                <Progress value={sendingProgress} className="w-32 h-2" />
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Show available candidates first, then finalized ones */}
        {availableCandidates.map((ranking, index) =>
          renderCandidateCard(ranking, index)
        )}

        {/* Show finalized candidates if any exist */}
        {finalizedCandidates.length > 0 && (
          <>
            {availableCandidates.length > 0 && (
              <div className="border-t border-neutral-700 pt-4">
                <h3 className="text-sm font-medium text-neutral-400 mb-4 flex items-center gap-2">
                  <Badge className="h-4 w-4" />
                  Previously Contacted Candidates
                </h3>
              </div>
            )}
            {finalizedCandidates.map((ranking, index) =>
              renderCandidateCard(ranking, index)
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};
