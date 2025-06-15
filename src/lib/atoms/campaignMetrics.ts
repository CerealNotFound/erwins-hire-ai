// lib/atoms/campaignMetrics.ts
import { atom } from "jotai";

export interface CampaignMetrics {
  totalCampaigns: number;
  activeCampaigns: number;
  totalCandidatesReached: number;
  totalInterviews: number;
  completedInterviews: number;
  averageResponseRate: number;
}

export const campaignMetricsAtom = atom<CampaignMetrics | null>(null);
export const loadingMetricsAtom = atom<boolean>(true);