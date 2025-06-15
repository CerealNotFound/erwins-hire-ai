// lib/hooks/useFetchCampaignMetrics.ts
"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { campaignMetricsAtom, loadingMetricsAtom } from "@/lib/atoms/campaignMetrics";

export const useFetchCampaignMetrics = () => {
  const setMetrics = useSetAtom(campaignMetricsAtom);
  const setLoading = useSetAtom(loadingMetricsAtom);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/campaigns/metrics");
        if (response.ok) {
          const data = await response.json();
          setMetrics(data);
        }
      } catch (error) {
        console.error("Failed to fetch campaign metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [setMetrics, setLoading]);
};
