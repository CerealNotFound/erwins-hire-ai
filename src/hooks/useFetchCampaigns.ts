// lib/hooks/useFetchCampaigns.ts
"use client";

import { useEffect } from "react";
import { useSetAtom } from "jotai";
import { campaignsAtom, loadingCampaignsAtom } from "@/lib/atoms/campaigns";

export const useFetchCampaigns = () => {
  const setCampaigns = useSetAtom(campaignsAtom);
  const setLoading = useSetAtom(loadingCampaignsAtom);

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/campaigns");
        if (res.ok) {
          const data = await res.json();
          setCampaigns(data.campaigns);
        }
      } catch (err) {
        console.error("Failed to fetch campaigns:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [setCampaigns, setLoading]);
};
