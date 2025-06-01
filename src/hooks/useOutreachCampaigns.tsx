"use client";

import { useState, useEffect } from "react";

export interface OutreachCampaign {
  id: string;
  campaign_name: string;
  role: string;
  description: string;
  questions: string[];
}

export const useOutreachCampaigns = () => {
  const [campaigns, setCampaigns] = useState<OutreachCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await fetch("/api/outreach-campaigns");
        const data = await response.json();
        setCampaigns(data.campaigns || []);
      } catch (error) {
        console.error("Failed to fetch campaigns:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  return { campaigns, loading };
};
