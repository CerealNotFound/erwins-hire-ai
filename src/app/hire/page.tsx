"use client";

import React, { useState } from "react";
import {
  Plus,
  Search,
  Users,
  Mail,
  TrendingUp,
  Clock,
  CheckCircle,
  ArrowRight,
  Zap,
  Target,
  MessageSquare,
  Calendar,
} from "lucide-react";
import { useAtom, useAtomValue } from "jotai";
import {
  campaignMetricsAtom,
  loadingMetricsAtom,
} from "@/lib/atoms/campaignMetrics";
import { campaignsAtom, loadingCampaignsAtom } from "@/lib/atoms/campaigns";
import { formatDistanceToNow } from "date-fns";
import { useFetchCampaigns } from "@/hooks/useFetchCampaigns";
import CampaignList from "@/components/campaigns/campaign-list";
import { useFetchCampaignMetrics } from "@/hooks/useFetchCampaignMetrics";

export default function Dashboard() {
  useFetchCampaigns();
  useFetchCampaignMetrics();
  const campaigns = useAtomValue(campaignsAtom);
  const campaignMetrics = useAtomValue(campaignMetricsAtom);
  const [loadingMetrics] = useAtom(loadingMetricsAtom);
  const [loadingCampaigns] = useAtom(loadingCampaignsAtom);

  const [recentActivity] = useState([
    {
      type: "response",
      message: "Sarah Chen responded to Frontend Developer campaign",
      time: "2 hours ago",
    },
    {
      type: "added",
      message: "5 new candidates added to Product Manager campaign",
      time: "1 day ago",
    },
    {
      type: "created",
      message: "Campaign 'Senior Frontend Developer' launched",
      time: "2 days ago",
    },
  ]);

  const stats = campaignMetrics
    ? {
        totalCandidates: campaignMetrics.totalCandidatesReached,
        activeEmails: campaignMetrics.totalCandidatesReached, // or keep as separate metric
        responseRate: Math.round(campaignMetrics.averageResponseRate),
        activeCampaigns: campaignMetrics.activeCampaigns,
      }
    : {
        totalCandidates: 0,
        activeEmails: 0,
        responseRate: 0,
        activeCampaigns: 0,
      };

  return (
    <div className="min-h-screen pt-10 pb-8">
      <div className="container mx-auto px-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl font-bold text-white mb-2">
            Welcome to Your Recruitment
            <span className="text-orange-500 ml-2">Command Center</span>
          </h1>
          <p className="text-xl text-neutral-400 max-w-2xl mx-auto">
            Find, engage, and hire top talent with AI-powered precision
          </p>
        </div>

        {/* Quick Action Cards - The Real Hero */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* Primary Action - Search & Add */}
          <a href="/hire/search">
            <div className=" border border-neutral-700 rounded-xl p-8 text-white relative overflow-hidden group hover:bg-neutral-750 hover:border-orange-500 transition-all duration-300 cursor-pointer">
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-500 p-3 rounded-lg">
                    <Search className="w-8 h-8 text-white" />
                  </div>
                  <ArrowRight className="w-6 h-6 text-neutral-400 group-hover:translate-x-1 group-hover:text-orange-500 transition-all duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-2">
                  Find Perfect Candidates
                </h3>
                <p className="text-neutral-300 mb-4">
                  Search our talent pool and add candidates to your campaigns
                  instantly
                </p>
                <div className="border border-neutral-600 rounded-lg p-3">
                  <p className="text-sm font-medium text-neutral-300">
                    🎯 Try: "React developer with 3+ years at startups"
                  </p>
                </div>
              </div>
            </div>
          </a>

          {/* Secondary Action - Create Campaign */}
          <div className="border border-neutral-700 rounded-xl p-8 text-white relative overflow-hidden group hover:bg-neutral-750 hover:border-neutral-600 transition-all duration-300 cursor-pointer">
            <div className="flex items-start justify-between mb-4">
              <div className="bg-neutral-700 p-3 rounded-lg group-hover:bg-orange-500 transition-colors duration-300">
                <Plus className="w-8 h-8 text-neutral-300 group-hover:text-white" />
              </div>
              <ArrowRight className="w-6 h-6 text-neutral-400 group-hover:translate-x-1 group-hover:text-orange-500 transition-all duration-300" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Launch New Campaign</h3>
            <p className="text-neutral-300 mb-4">
              Set up a targeted outreach campaign with AI-crafted messages
            </p>
            <div className="flex items-center gap-2 text-sm text-neutral-400">
              <Clock className="w-4 h-4" />
              <span>Takes 3 minutes to set up</span>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className=" border border-neutral-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-5 h-5 text-neutral-400" />
              <span className="text-2xl font-bold text-white">
                {stats.totalCandidates}
              </span>
            </div>
            <p className="text-sm text-neutral-500">Total Candidates</p>
          </div>

          <div className=" border border-neutral-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Mail className="w-5 h-5 text-neutral-400" />
              <span className="text-2xl font-bold text-white">
                {stats.activeEmails}
              </span>
            </div>
            <p className="text-sm text-neutral-500">Emails Sent</p>
          </div>

          <div className=" border border-neutral-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-white">
                {stats.responseRate}%
              </span>
            </div>
            <p className="text-sm text-neutral-500">Response Rate</p>
          </div>

          <div className=" border border-neutral-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-2">
              <Target className="w-5 h-5 text-neutral-400" />
              <span className="text-2xl font-bold text-white">
                {stats.activeCampaigns}
              </span>
            </div>
            <p className="text-sm text-neutral-500">Active Campaigns</p>
          </div>
        </div>

        {/* Two Column Layout */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Active Campaigns */}
          <div className="lg:col-span-2  border border-neutral-700 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-500" />
                Active Campaigns
              </h2>
              <button className="text-sm text-orange-500 hover:text-orange-400 transition-colors">
                View All
              </button>
            </div>

            {campaigns.length > 0 ? (
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <a key={campaign.id} href={`/hire/campaign/${campaign.id}`}>
                    <div className="bg-neutral-900 border border-neutral-600 rounded-lg p-4 hover:border-neutral-500 transition-colors cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-white mb-1">
                            {campaign.campaign_name}
                          </h3>
                          <div className="flex items-center gap-4 text-sm text-neutral-400">
                            <span className="flex items-center gap-1">
                              <Users className="w-4 h-4" />
                              {campaign.total_candidates} candidates
                            </span>
                            <span className="flex items-center gap-1">
                              <MessageSquare className="w-4 h-4" />
                              {campaign.response_rate} responses
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              Created{" "}
                              {formatDistanceToNow(
                                new Date(campaign.created_at)
                              )}{" "}
                              ago
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${
                              campaign.is_active === true
                                ? "bg-green-500/20 text-white-400"
                                : "bg-neutral-600/50 text-neutral-400"
                            }`}
                          >
                            {campaign.is_active ? "Active" : "Inactive"}
                          </span>
                          <ArrowRight className="w-4 h-4 text-neutral-500" />
                        </div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Target className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-neutral-300 mb-2">
                  No campaigns yet
                </h3>
                <p className="text-neutral-400 mb-4">
                  Create your first campaign to start finding great candidates
                </p>
                <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors">
                  Create Campaign
                </button>
              </div>
            )}
            {/* <CampaignList /> */}
          </div>

          {/* Recent Activity */}
          <div className=" border border-neutral-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Clock className="w-5 h-5 text-neutral-400" />
              Recent Activity
            </h2>

            <div className="space-y-4">
              {recentActivity.map((activity, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div
                    className={`w-2 h-2 rounded-full mt-2 ${
                      activity.type === "response"
                        ? "bg-orange-500"
                        : activity.type === "added"
                        ? "bg-neutral-400"
                        : "bg-orange-500"
                    }`}
                  ></div>
                  <div className="flex-1">
                    <p className="text-sm text-neutral-300">
                      {activity.message}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <button className="w-full mt-6 text-sm text-neutral-400 hover:text-neutral-300 transition-colors text-center py-2 border border-neutral-600 rounded-lg hover:border-neutral-500">
              View All Activity
            </button>
          </div>
        </div>

        {/* Quick Tips */}
        <div className=" border border-neutral-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-orange-500" />
            Pro Tips
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-neutral-300">
                Say send now in your voice search like "... send now" for auto
                send
              </span>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
              <span className="text-neutral-300">
                Add candidates to campaigns directly from search results for
                faster workflow
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
