// lib/atoms/campaigns.ts
import { atom } from "jotai";

export interface Campaign {
  id: string;
  campaign_name: string;
  role: string;
  description: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  questions: string[];
  total_candidates: number;
  interviews_started: number;
  interviews_completed: number;
  response_rate: number;
}

export const campaignsAtom = atom<Campaign[]>([]);
export const loadingCampaignsAtom = atom<boolean>(true);
