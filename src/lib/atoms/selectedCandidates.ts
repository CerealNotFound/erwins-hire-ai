// store/selectedCandidates.ts
import { atom } from 'jotai';
import { ProcessedCandidate } from '@/app/search/page';

// Atom to store selected candidate IDs
export const selectedCandidateIdsAtom = atom<Set<string>>(new Set<string>());

// Atom to store full candidate objects for selected candidates
export const selectedCandidatesAtom = atom<ProcessedCandidate[]>([]);

// Derived atom to get count of selected candidates
export const selectedCandidatesCountAtom = atom(
  (get) => get(selectedCandidateIdsAtom).size
);

// Action atoms for managing selections
export const toggleCandidateSelectionAtom = atom(
  null,
  (get, set, candidate: ProcessedCandidate) => {
    const currentIds = get(selectedCandidateIdsAtom);
    const currentCandidates = get(selectedCandidatesAtom);
    
    const newIds = new Set(currentIds);
    let newCandidates = [...currentCandidates];
    
    if (currentIds.has(candidate.id)) {
      // Remove candidate
      newIds.delete(candidate.id);
      newCandidates = newCandidates.filter(c => c.id !== candidate.id);
    } else {
      // Add candidate
      newIds.add(candidate.id);
      newCandidates.push(candidate);
    }
    
    set(selectedCandidateIdsAtom, newIds);
    set(selectedCandidatesAtom, newCandidates);
  }
);

// Action atom to clear all selections
export const clearAllSelectionsAtom = atom(
  null,
  (get, set) => {
    set(selectedCandidateIdsAtom, new Set());
    set(selectedCandidatesAtom, []);
  }
);

// Action atom to select all candidates
export const selectAllCandidatesAtom = atom(
  null,
  (get, set, candidates: ProcessedCandidate[]) => {
    const allIds = new Set(candidates.map(c => c.id));
    set(selectedCandidateIdsAtom, allIds);
    set(selectedCandidatesAtom, [...candidates]);
  }
);