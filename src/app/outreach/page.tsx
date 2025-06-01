import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus,
  Users,
  MessageSquare,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react";
import OutreachForm from "@/components/outreach-form";
import CampaignList from "@/components/campaigns/campaign-list";
import CampaignMetrics from "@/components/campaigns/campaign-metrics";

export default function OutreachPage() {
  return (
    <div className="min-h-screen pt-16 pb-8">
      <div className="container mx-auto px-6 space-y-8">
        {/* Header Section */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Outreach Command Center
            </h1>
            <p className="text-neutral-400">
              Manage your recruitment campaigns and track candidate engagement
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm">
              <TrendingUp className="w-4 h-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Quick Stats */}
        <Suspense fallback={<MetricsSkeleton />}>
          <CampaignMetrics />
        </Suspense>

        {/* Main Content Tabs */}
        <Tabs defaultValue="campaigns" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-muted border border-neutral-200">
            <TabsTrigger
              value="campaigns"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Users className="w-4 h-4 mr-2" />
              My Campaigns
            </TabsTrigger>
            <TabsTrigger
              value="create"
              className="data-[state=active]:bg-orange-500 data-[state=active]:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Campaign
            </TabsTrigger>
          </TabsList>

          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">
                Active Campaigns
              </h2>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                <Plus className="w-4 h-4 mr-2" />
                Quick Create
              </Button>
            </div>

            <Suspense fallback={<CampaignsSkeleton />}>
              <CampaignList />
            </Suspense>
          </TabsContent>

          <TabsContent value="create" className="space-y-6">
            <div className="max-w-4xl mx-auto">
              <div className="bg-neutral rounded-lg border border-neutral-200 p-8 shadow-sm">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-white mb-2">
                    Launch New Campaign
                  </h2>
                  <p className="text-neutral-400">
                    Set up your outreach parameters and start connecting with
                    candidates
                  </p>
                </div>
                <OutreachForm />
              </div>
            </div>
          </TabsContent>
        </Tabs>
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
