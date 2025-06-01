"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  MoreHorizontal,
  Users,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Archive,
  Copy,
  Trash2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from "date-fns";

interface Campaign {
  id: string;
  campaign_name: string;
  role: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  questions: string[];
  // Aggregated data
  total_candidates: number;
  interviews_started: number;
  interviews_completed: number;
  response_rate: number;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await fetch("/api/campaigns");
      if (response.ok) {
        const data = await response.json();
        setCampaigns(data.campaigns);
      }
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewCampaign = (campaignId: string) => {
    router.push(`/outreach/campaigns/${campaignId}`);
  };

  const handleArchiveCampaign = async (campaignId: string) => {
    try {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: false }),
      });

      if (response.ok) {
        fetchCampaigns(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to archive campaign:", error);
    }
  };

  const handleDuplicateCampaign = async (campaign: Campaign) => {
    try {
      const response = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaign_name: `${campaign.campaign_name} (Copy)`,
          role: campaign.role,
          description: campaign.description,
          questions: campaign.questions,
        }),
      });

      if (response.ok) {
        fetchCampaigns(); // Refresh the list
      }
    } catch (error) {
      console.error("Failed to duplicate campaign:", error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="border-neutral-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-48 bg-neutral-200 rounded animate-pulse" />
                  <div className="h-4 w-32 bg-neutral-200 rounded animate-pulse" />
                </div>
                <div className="h-6 w-16 bg-neutral-200 rounded-full animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 text-sm">
                <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 w-24 bg-neutral-200 rounded animate-pulse" />
                <div className="h-4 w-16 bg-neutral-200 rounded animate-pulse" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <Card className="border-neutral-200">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Users className="h-12 w-12 text-neutral-400 mb-4" />
          <h3 className="text-lg font-semibold text-neutral-900 mb-2">
            No campaigns yet
          </h3>
          <p className="text-neutral-600 text-center mb-4">
            Create your first outreach campaign to start connecting with
            candidates
          </p>
          <Button
            onClick={() => router.push("/outreach?tab=create")}
            className="bg-orange-500 hover:bg-orange-600"
          >
            <MessageSquare className="w-4 h-4 mr-2" />
            Create Campaign
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {campaigns.map((campaign) => {
        const completionRate =
          campaign.total_candidates > 0
            ? (campaign.interviews_completed / campaign.total_candidates) * 100
            : 0;

        const statusColor = campaign.is_active
          ? "bg-green-100 text-green-800 hover:bg-green-100"
          : "bg-neutral-100 text-neutral-600 hover:bg-neutral-100";

        return (
          <Card
            key={campaign.id}
            className="border-neutral-200 hover:shadow-md transition-all duration-200"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <CardTitle className="text-lg text-white">
                      {campaign.campaign_name}
                    </CardTitle>
                    <Badge className={statusColor}>
                      {campaign.is_active ? "Active" : "Archived"}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-neutral-400">
                    <span className="font-medium">{campaign.role}</span>
                    <span className="text-neutral-400">•</span>
                    <span>
                      Created{" "}
                      {formatDistanceToNow(new Date(campaign.created_at))} ago
                    </span>
                  </div>
                  {campaign.description && (
                    <p className="text-sm text-neutral-300 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}
                </div>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => handleViewCampaign(campaign.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDuplicateCampaign(campaign)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Duplicate
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {campaign.is_active ? (
                      <DropdownMenuItem
                        onClick={() => handleArchiveCampaign(campaign.id)}
                      >
                        <Archive className="h-4 w-4 mr-2" />
                        Archive
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                {/* Progress Bar */}
                {campaign.total_candidates > 0 && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-neutral-600">
                        Interview Progress
                      </span>
                      <span className="text-neutral-900 font-medium">
                        {campaign.interviews_completed}/
                        {campaign.total_candidates}
                      </span>
                    </div>
                    <Progress value={completionRate} className="h-2" />
                  </div>
                )}

                {/* Stats Row */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-neutral-400" />
                    <span className="text-neutral-600">
                      {campaign.total_candidates} candidates
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-blue-500" />
                    <span className="text-neutral-600">
                      {campaign.interviews_started} interviews
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-neutral-600">
                      {campaign.response_rate.toFixed(1)}% response rate
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span className="text-neutral-600">
                      {campaign.questions.length} questions
                    </span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-end pt-2">
                  <Button
                    onClick={() => handleViewCampaign(campaign.id)}
                    variant="outline"
                    size="sm"
                    className="hover:bg-orange-50 hover:border-orange-200"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Campaign
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
