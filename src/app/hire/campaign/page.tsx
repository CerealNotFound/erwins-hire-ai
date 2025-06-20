"use client";

import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Plus, Users, TrendingUp } from "lucide-react";
import { useRouter } from "next/navigation";
import CampaignList from "@/components/campaigns/campaign-list";
import CampaignMetrics from "@/components/campaigns/campaign-metrics";

export default function CampaignPage() {
  const router = useRouter();

  const handleCreateCampaign = () => {
    router.push("/hire/campaign/create");
  };

  return (
    <div className="min-h-screen pt-10 pb-8">
      <div className="container mx-auto px-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Campaigns Command Center
            </h1>
            <p className="text-neutral-400">
              Manage your recruitment campaigns and track candidate engagement
            </p>
          </div>
          <Button variant="outline" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            Analytics
          </Button>
        </div>

        {/* Quick Stats */}
        <Suspense fallback={<MetricsSkeleton />}>
          <CampaignMetrics />
        </Suspense>

        {/* Campaigns Section */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-5 h-5 text-orange-500" />
              <h2 className="text-xl font-semibold text-white">
                Active Campaigns
              </h2>
            </div>
            <Button onClick={handleCreateCampaign} className="cursor-pointer">
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </Button>
          </div>

          <Suspense fallback={<CampaignsSkeleton />}>
            <CampaignList />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

// Loading Skeletons
function MetricsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i} className="border-neutral-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-4 rounded" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-8 w-16 mb-2" />
            <Skeleton className="h-3 w-24" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CampaignsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, i) => (
        <Card key={i} className="border-neutral-200">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <Skeleton className="h-5 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-6 text-sm">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
