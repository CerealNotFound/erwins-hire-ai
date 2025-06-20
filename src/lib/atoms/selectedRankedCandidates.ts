import { atom } from "jotai";

// Define the RankedCandidate type based on your ranking structure
export interface RankedCandidate {
  id: string;
  candidate_id: string;
  rank_position: number;
  final_score: number;
  technical_score: number;
  communication_score: number;
  icp_alignment: number;
  tier: "exceptional" | "excellent" | "good" | "fair" | "needs_improvement";
  strengths: string[];
  concerns: string[];
  insights: string[];
  updated_at: string;
  is_selected: boolean;
  // Embedded candidate data or null if needs lookup
  candidate?: {
    id: string;
    full_name: string;
    title: string;
    current_company: string;
    email?: string;
    linkedin_url?: string;
    github_url?: string;
    portfolio_url?: string;
  } | null;
}

// Atom to store selected ranked candidate IDs for final outreach
export const selectedRankedCandidateIdsAtom = atom<Set<string>>(
  new Set<string>()
);

// Atom to store full ranked candidate objects for selected candidates
export const selectedRankedCandidatesAtom = atom<RankedCandidate[]>([]);

// Derived atom to get count of selected ranked candidates
export const selectedRankedCandidatesCountAtom = atom(
  (get) => get(selectedRankedCandidateIdsAtom).size
);

// Action atom for managing final outreach selections
export const toggleRankedCandidateSelectionAtom = atom(
  null,
  (get, set, rankedCandidate: RankedCandidate) => {
    const currentIds = get(selectedRankedCandidateIdsAtom);
    const currentCandidates = get(selectedRankedCandidatesAtom);

    const newIds = new Set(currentIds);
    let newCandidates = [...currentCandidates];

    if (currentIds.has(rankedCandidate.id)) {
      // Remove ranked candidate
      newIds.delete(rankedCandidate.id);
      newCandidates = newCandidates.filter((c) => c.id !== rankedCandidate.id);
    } else {
      // Add ranked candidate
      newIds.add(rankedCandidate.id);
      newCandidates.push(rankedCandidate);
    }

    set(selectedRankedCandidateIdsAtom, newIds);
    set(selectedRankedCandidatesAtom, newCandidates);
  }
);

// Action atom to clear all final outreach selections
export const clearAllRankedSelectionsAtom = atom(null, (get, set) => {
  set(selectedRankedCandidateIdsAtom, new Set());
  set(selectedRankedCandidatesAtom, []);
});

// Action atom to select all ranked candidates
export const selectAllRankedCandidatesAtom = atom(
  null,
  (get, set, rankedCandidates: RankedCandidate[]) => {
    const allIds = new Set(rankedCandidates.map((c) => c.id));
    set(selectedRankedCandidateIdsAtom, allIds);
    set(selectedRankedCandidatesAtom, [...rankedCandidates]);
  }
);

// Action atom to select candidates by tier (for bulk selection by quality)
export const selectCandidatesByTierAtom = atom(
  null,
  (get, set, rankedCandidates: RankedCandidate[], tiers: string[]) => {
    const filteredCandidates = rankedCandidates.filter((c) =>
      tiers.includes(c.tier)
    );
    const currentIds = get(selectedRankedCandidateIdsAtom);
    const currentCandidates = get(selectedRankedCandidatesAtom);

    const newIds = new Set(currentIds);
    let newCandidates = [...currentCandidates];

    filteredCandidates.forEach((candidate) => {
      if (!currentIds.has(candidate.id)) {
        newIds.add(candidate.id);
        newCandidates.push(candidate);
      }
    });

    set(selectedRankedCandidateIdsAtom, newIds);
    set(selectedRankedCandidatesAtom, newCandidates);
  }
);
