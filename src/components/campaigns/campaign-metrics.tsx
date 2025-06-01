"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, MessageSquare, CheckCircle, TrendingUp } from "lucide-react";

interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalCandidatesReached: number;
  totalInterviews: number;
  completedInterviews: number;
  averageResponseRate: number;
}

export default function CampaignMetrics() {
  const [metrics, setMetrics] = useState<CampaignMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch("/api/campaigns/metrics");
      if (response.ok) {
        const data = await response.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !metrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-neutral-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-20 bg-neutral-200 rounded animate-pulse" />
              <div className="h-4 w-4 bg-neutral-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-neutral-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-24 bg-neutral-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const responseRate = metrics.averageResponseRate || 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <Card className="border-neutral-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Active Campaigns
          </CardTitle>
          <Users className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {metrics.activeCampaigns}
          </div>
          <p className="text-sm text-neutral-400">
            of {metrics.totalCampaigns} total
          </p>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Candidates Reached
          </CardTitle>
          <MessageSquare className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {metrics.totalCandidatesReached.toLocaleString()}
          </div>
          <p className="text-sm text-neutral-400">across all campaigns</p>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Interviews
          </CardTitle>
          <CheckCircle className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {metrics.completedInterviews}
          </div>
          <p className="text-sm text-neutral-400">
            of {metrics.totalInterviews} started
          </p>
        </CardContent>
      </Card>

      <Card className="border-neutral-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-white">
            Response Rate
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-purple-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {responseRate.toFixed(1)}%
          </div>
          <div className="flex items-center gap-1 mt-1">
            <Badge
              variant={
                responseRate >= 70
                  ? "default"
                  : responseRate >= 50
                  ? "secondary"
                  : "destructive"
              }
              className={`text-xs ${
                responseRate >= 70
                  ? "bg-green-100 text-green-800 hover:bg-green-100"
                  : responseRate >= 50
                  ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  : "bg-red-100 text-red-800 hover:bg-red-100"
              }`}
            >
              {responseRate >= 70
                ? "Excellent"
                : responseRate >= 50
                ? "Good"
                : "Needs Work"}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
