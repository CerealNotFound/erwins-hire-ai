"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Users,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  Mail,
  Phone,
  Building,
  Calendar,
  TrendingUp,
  Target,
  Activity,
  Loader2,
  Zap,
  ArrowDown,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import ICPDisplay, { ICPConfig } from "@/components/campaigns/ICPDisplay";
import { useAtom } from "jotai";
import {
  candidateRankingsAtom,
  loadingRankingsAtom,
  rankingsErrorAtom,
} from "@/lib/atoms/analyzedInterviews";
import { AIAnalysisResults } from "@/components/campaigns/analysisResults";

interface CampaignDetail {
  id: string;
  campaign_name: string;
  role: string;
  description: string;
  questions: string[];
  created_at: string;
  is_active: boolean;
  pipeline: {
    shortlisted: number;
    reached: number;
    in_progress: number;
    completed: number;
    abandoned: number;
  };
  metrics: {
    response_rate: number;
    reach_rate: number;
    total_shortlisted: number;
    total_reached: number;
    completed_interviews: number;
  };
  icp_config: ICPConfig;
  conversations: any[];
  shortlisted_candidates: any[];
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedInsights, setExpandedInsights] = useState(new Set<string>());
  const [viewMode, setViewMode] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasAnalysis, setHasAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [candidateRankings, setCandidateRankings] = useAtom(
    candidateRankingsAtom
  );
  const [loadingRankings, setLoadingRankings] = useAtom(loadingRankingsAtom);
  const [rankingsError, setRankingsError] = useAtom(rankingsErrorAtom);

  useEffect(() => {
    if (campaignId) {
      fetchCampaignDetails();
      fetchRankings(campaignId);
    }
  }, [campaignId]);

  useEffect(() => {
    console.log(campaign);
  }, [campaign]);

  const handleAnalysis = async () => {
    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/campaigns/${campaignId}/generate-ai-analysis`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            campaignId: campaignId,
          }),
        }
      );

      if (response.ok) {
        const analysisData = await response.json();
        setHasAnalysis(true);
        setViewMode("ranked");

        // Refresh both campaign details and rankings
        await fetchCampaignDetails();
        await fetchRankings(campaignId); // Fetch the persisted rankings

        console.log(analysisData);
      } else {
        setError("Analysis failed. Please try again.");
      }
    } catch (error) {
      console.error("Failed to run analysis:", error);
      setError("Network error during analysis");
    } finally {
      setIsGenerating(false);
    }
  };

  const toggleInsights = (candidateId: string) => {
    const newExpanded = new Set(expandedInsights);
    if (newExpanded.has(candidateId)) {
      newExpanded.delete(candidateId);
    } else {
      newExpanded.add(candidateId);
    }
    setExpandedInsights(newExpanded);
  };

  const fetchCampaignDetails = async () => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data);
        setCampaign(data.campaign);
      }
    } catch (error) {
      console.error("Failed to fetch campaign details:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInterview = (conversationId: string) => {
    router.push(`/hire/campaign/${campaignId}/interviews/${conversationId}`);
  };

  const fetchRankings = async (campaignId: string) => {
    setLoadingRankings(true);
    setRankingsError(null);

    try {
      const response = await fetch("/api/campaigns/rankings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ campaignId }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch rankings");
      }

      const data = await response.json();
      setCandidateRankings(data.rankings || []);
      setHasAnalysis(data.hasAnalysis || false);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      setRankingsError(
        error instanceof Error ? error.message : "Failed to fetch rankings"
      );
    } finally {
      setLoadingRankings(false);
    }
  };
  const completedCount = campaign?.conversations.filter(
    (c) => c.status === "completed"
  ).length;
  const inProgressCount = campaign?.conversations.filter(
    (c) => c.status === "in_progress"
  ).length;

  const shouldShowAnalysisButton = completedCount && completedCount > 0;
  const hasExistingAnalysis = candidateRankings.length > 0 || hasAnalysis;

  // const getFilteredConversations = () => {
  //   let filtered = [campaign?.conversations];

  //   switch (viewMode) {
  //     case "completed":
  //       filtered = filtered.filter((c: any) => c.status === "completed");
  //       break;
  //     case "in_progress":
  //       filtered = filtered.filter((c: any) => c.status === "in_progress");
  //       break;
  //     case "ranked":
  //       filtered = filtered.filter((c: any) => c.status === "completed");
  //       break;
  //   }

  //   if (viewMode === "ranked" && hasAnalysis) {
  //     return filtered
  //       .map((conversation: any) => {
  //         const ranking =
  //           rankings?.find(
  //             (r: any) => r.conversation?.id === conversation?.id
  //           ) ||
  //           conversation?.ranking ||
  //           conversation?.analysis;
  //         return { conversation, ranking };
  //       })
  //       .sort((a, b) => {
  //         if (a.ranking && b.ranking) {
  //           return (
  //             (a.ranking.rank_position || 999) -
  //             (b.ranking.rank_position || 999)
  //           );
  //         }
  //         return 0;
  //       });
  //   }

  //   return filtered
  //     .map((conversation: any) => {
  //       const ranking =
  //         rankings.find((r: any) => r.conversation?.id === conversation?.id) ||
  //         conversation?.ranking ||
  //         conversation?.analysis;
  //       return { conversation, ranking };
  //     })
  //     .sort((a, b) => {
  //       if (a.conversation.status !== b.conversation.status) {
  //         return a.conversation.status === "completed" ? -1 : 1;
  //       }
  //       return (
  //         new Date(b.conversation.started_at).getTime() -
  //         new Date(a.conversation.started_at).getTime()
  //       );
  //     });
  // };

  // const filteredConversations = getFilteredConversations();

  if (loading) {
    return (
      <div className="min-h-screen mt-10 pb-8">
        <div className="container mx-auto px-6">
          <div className="space-y-6">
            <div className="h-8 w-64 bg-neutral-400 rounded animate-pulse" />
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="border-neutral-400">
                  <CardHeader>
                    <div className="h-4 w-20 bg-neutral-400 rounded animate-pulse" />
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 w-16 bg-neutral-400 rounded animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen pb-8">
        <div className="container mx-auto px-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-white mb-2">
              Campaign Not Found
            </h2>
            <p className="text-neutral-400 mb-4">
              The campaign you're looking for doesn't exist.
            </p>
            <Button onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const completionRate =
    campaign.pipeline.reached > 0
      ? (campaign.pipeline.completed / campaign.pipeline.reached) * 100
      : 0;

  return (
    <div className="min-h-screen bg-black pt-10 pb-8">
      <div className="container mx-auto px-6 space-y-8">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button
            size="sm"
            onClick={() => router.push("/hire/campaign")}
            className="hover:bg-neutral-100 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>
        </div>
        {/* Campaign Info */}
        <div className="bg-neutral-900/50 rounded-lg  p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold text-white">
                  {campaign.campaign_name}
                </h1>
                <Badge
                  className={
                    campaign.is_active
                      ? "bg-green-100 text-green-800 hover:bg-green-100"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-100"
                  }
                >
                  {campaign.is_active ? "Active" : "Archived"}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm text-neutral-400 mb-3">
                <span className="font-medium">{campaign.role}</span>
                <span>•</span>
                <span>
                  Created {formatDistanceToNow(new Date(campaign.created_at))}{" "}
                  ago
                </span>
                <span>•</span>
                <span>{campaign.questions.length} questions</span>
              </div>
              {campaign.description && (
                <p className="text-neutral-300">{campaign.description}</p>
              )}
            </div>
          </div>
        </div>
        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* <Card className=" ">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Shortlisted
              </CardTitle>
              <Target className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {campaign.pipeline.shortlisted}
              </div>
              <p className="text-sm text-neutral-400">candidates identified</p>
            </CardContent>
          </Card> */}

          <Card className="bg-neutral-900/50 border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Reached Out
              </CardTitle>
              <MessageSquare className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {campaign.pipeline.reached}
              </div>
              <p className="text-xs text-neutral-400">candidates via email</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                In Progress
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {campaign.pipeline.in_progress}
              </div>
              <p className="text-xs text-neutral-400">active interviews</p>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900/50 border-none">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-neutral-400">
                Completed
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-white">
                {campaign.pipeline.completed}
              </div>
              <p className="text-xs text-neutral-400">
                {campaign.metrics.response_rate.toFixed(1)}% response rate
              </p>
            </CardContent>
          </Card>
        </div>
        {campaign.icp_config && <ICPDisplay icpConfig={campaign.icp_config} />}

        {/* Progress Overview */}
        <Card className="border-none bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-orange-500" />
              Campaign Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Interview Completion</span>
                <span className="text-neutral-900 font-medium">
                  {campaign.pipeline.completed}/{campaign.pipeline.reached}
                </span>
              </div>
              <Progress value={completionRate} className="h-3" />
              <div className="grid grid-cols-3 gap-4 text-xs text-center">
                {/* <div className="p-2 bg-neutral-800 rounded">
                  <div className="font-medium text-blue-300">
                    {campaign.pipeline.shortlisted}
                  </div>
                  <div className="text-blue-300">Shortlisted</div>
                </div> */}
                <div className="p-2 bg-neutral-800/50 rounded">
                  <div className="font-medium text-orange-700">
                    {campaign.pipeline.reached}
                  </div>
                  <div className="text-orange-600">Reached</div>
                </div>
                <div className="p-2 bg-neutral-800/50 rounded">
                  <div className="font-medium text-yellow-700">
                    {campaign.pipeline.in_progress}
                  </div>
                  <div className="text-yellow-600">In Progress</div>
                </div>
                <div className="p-2 bg-neutral-800/50 rounded">
                  <div className="font-medium text-green-700">
                    {campaign.pipeline.completed}
                  </div>
                  <div className="text-green-600">Completed</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {shouldShowAnalysisButton && (
          <Button
            onClick={handleAnalysis}
            disabled={isGenerating || loadingRankings}
            className="flex cursor-pointer items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-all"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4" />
                {hasExistingAnalysis ? "Re-analyze" : "AI Analysis"}
              </>
            )}
          </Button>
        )}

        {/* Loading state for rankings */}
        {loadingRankings && (
          <Card className="border-none bg-neutral-900/50">
            <CardContent className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              <span>Loading analysis results...</span>
            </CardContent>
          </Card>
        )}

        {/* Error state */}
        {rankingsError && (
          <Card className="border-none bg-red-900/20 border-red-500/20">
            <CardContent className="py-4">
              <div className="flex items-center gap-2 text-red-400">
                <AlertTriangle className="h-4 w-4" />
                <span>{rankingsError}</span>
              </div>
            </CardContent>
          </Card>
        )}

        <AIAnalysisResults
          candidateRankings={candidateRankings}
          loadingRankings={loadingRankings}
          campaign={campaign}
          expandedInsights={expandedInsights}
          toggleInsights={toggleInsights}
        />

        <div className="space-y-4">
          {campaign.conversations.length === 0 ? (
            <Card className=" ">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <MessageSquare className="h-12 w-12 text-neutral-400 mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  No interviews yet
                </h3>
                <p className="text-neutral-600 text-center">
                  Start reaching out to shortlisted candidates to begin
                  interviews
                </p>
              </CardContent>
            </Card>
          ) : (
            campaign.conversations.map((conversation) => (
              <Card
                key={conversation.id}
                className="border-none bg-neutral-900/50 hover:shadow-md transition-shadow"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {conversation.candidates?.full_name
                            ?.split(" ")
                            .map((n: any) => n[0])
                            .join("") || "AN"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="space-y-2">
                        <div>
                          <h3 className="font-semibold text-white">
                            {conversation.candidates?.full_name ||
                              "Unknown Candidate"}
                          </h3>
                          <p className="text-sm text-neutral-300">
                            {conversation.candidates?.title} at{" "}
                            {conversation.candidates?.current_company}
                          </p>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-neutral-500">
                          {conversation.candidates?.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {conversation.candidates.email}
                            </div>
                          )}
                          {conversation.candidates?.phone && (
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {conversation.candidates.phone}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={
                              conversation.status === "completed"
                                ? "bg-green-100 text-green-800 hover:bg-green-100"
                                : conversation.status === "in_progress"
                                ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                                : "bg-red-100 text-red-800 hover:bg-red-100"
                            }
                          >
                            {conversation.status.replace("_", " ")}
                          </Badge>
                          <span className="text-xs text-neutral-500">
                            {conversation.questions_answered}/
                            {conversation.total_questions} answered
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-neutral-500">
                        {formatDistanceToNow(new Date(conversation.started_at))}{" "}
                        ago
                      </span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewInterview(conversation.id)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
