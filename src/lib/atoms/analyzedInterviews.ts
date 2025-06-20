// lib/atoms/rankings.ts
import { atom } from "jotai";

export interface CandidateRanking {
  id: string;
  campaign_id: string;
  candidate_id: string;
  technical_score: number;
  communication_score: number;
  icp_alignment: number;
  final_score: number;
  rank_position: number;
  tier: "exceptional" | "excellent" | "good" | "fair" | "needs_improvement";
  insights: string[];
  strengths: string[];
  concerns: string[];
  created_at: string;
  updated_at: string;
  is_selected: boolean;
  // Optional candidate data for UI display
  candidate?: {
    id: string;
    full_name: string;
    title: string;
    current_company: string;
  };
}

export const candidateRankingsAtom = atom<CandidateRanking[]>([]);
export const loadingRankingsAtom = atom<boolean>(false);
export const rankingsErrorAtom = atom<string | null>(null);
