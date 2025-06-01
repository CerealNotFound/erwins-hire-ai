"use client";

import React, { useEffect, useState } from "react";
import { useApiToast } from "@/components/promise-sonner/promise-sonner";
import { CandidateDetailSidebar } from "@/components/search/CandidateDetailSidebar";
import {
  Users,
  Star,
  Calendar,
  Search,
  Mail,
  ExternalLink,
} from "lucide-react";
import { OutreachDialog } from "@/components/OutreachDialog";

export interface ShortlistedCandidate {
  id: string;
  full_name: string;
  linkedin_url: string;
  title: string;
  location: string;
  skills: string[];
  about: string;
  experience: any;
  github_url: string;
  education: any;
  email: string;
  portfolio_url: string;
  project_urls: string[];
  missing_skills: string[];
  experience_years: number;
  blog_url: string;
  result_id: string;
  rank: number;
  skill_match_percentage: number;
  semantic_match_score: number;
  matching_skills: string[];
  overall_score: number;
  shortlisted: boolean;
  shortlisted_at: string;
  search_query: string;
  search_id: string;
  search_date: string;
}

export default function ShortlistedCandidates() {
  const [candidates, setCandidates] = useState<ShortlistedCandidate[]>([]);
  const [selectedCandidate, setSelectedCandidate] =
    useState<ShortlistedCandidate | null>(null);
  const [loading, setLoading] = useState(true);
  const { callApi } = useApiToast();

  const fetchShortlistedCandidates = async () => {
    setLoading(true);
    await callApi({
      url: "/api/shortlisted",
      method: "GET",
      loadingMessage: "Loading shortlisted candidates...",
      successMessage: () => "Candidates loaded successfully!",
      errorMessage: (err) => `Loading failed: ${err.message}`,
      onSuccess: (response) => {
        setCandidates(response);
      },
      onError: () => {
        setCandidates([]);
      },
    });
    setLoading(false);
  };

  const [outreachDialog, setOutreachDialog] = useState<{
    open: boolean;
    candidate: ShortlistedCandidate | null;
  }>({ open: false, candidate: null });

  const handleOutreach = (candidate: ShortlistedCandidate) => {
    setOutreachDialog({ open: true, candidate });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  useEffect(() => {
    fetchShortlistedCandidates();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950">
        <div className="flex items-center space-x-2 text-neutral-400">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
          <span>Loading shortlisted candidates...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 mt-14">
      {/* Header */}
      <div className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
        <div className="mx-auto max-w-7xl px-6 py-6">
          <div className="flex items-center space-x-3">
            <Star className="h-6 w-6 text-yellow-500" />
            <h1 className="text-2xl font-bold text-white">
              Shortlisted Candidates
            </h1>
            <span className="rounded-full bg-blue-500/20 px-3 py-1 text-sm text-blue-400">
              {candidates.length} candidates
            </span>
          </div>
          <p className="mt-2 text-neutral-400">
            Your curated list of top candidates ready for outreach
          </p>
        </div>
      </div>

      {candidates.length === 0 ? (
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="text-center">
            <Users className="mx-auto h-16 w-16 text-neutral-600" />
            <h3 className="mt-4 text-xl font-semibold text-white">
              No shortlisted candidates yet
            </h3>
            <p className="mt-2 text-neutral-400">
              Start searching and shortlist candidates to see them here
            </p>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-7xl px-6 py-8">
          <div className="grid gap-6">
            {candidates.map((candidate) => (
              <div
                key={candidate.result_id}
                className="group cursor-pointer rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 transition-all hover:border-neutral-700 hover:bg-neutral-900/80"
                onClick={() => setSelectedCandidate(candidate)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors">
                        {candidate.full_name}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="rounded-full bg-green-500/20 px-2 py-1 text-xs text-green-400">
                          {candidate.overall_score}% match
                        </span>
                        <span className="rounded-full bg-blue-500/20 px-2 py-1 text-xs text-blue-400">
                          Rank #{candidate.rank}
                        </span>
                      </div>
                    </div>

                    <p className="text-neutral-300 font-medium mb-2">
                      {candidate.title}
                    </p>
                    <p className="text-neutral-400 text-sm mb-3">
                      {candidate.location}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {candidate.matching_skills
                        ?.slice(0, 5)
                        .map((skill, index) => (
                          <span
                            key={index}
                            className="rounded-md bg-blue-500/20 px-2 py-1 text-xs text-blue-400"
                          >
                            {skill}
                          </span>
                        ))}
                      {candidate.matching_skills?.length > 5 && (
                        <span className="rounded-md bg-neutral-700 px-2 py-1 text-xs text-neutral-400">
                          +{candidate.matching_skills.length - 5} more
                        </span>
                      )}
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-neutral-500">
                      <div className="flex items-center space-x-1">
                        <Search className="h-3 w-3" />
                        <span>"{candidate.search_query}"</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>
                          Shortlisted {formatDate(candidate.shortlisted_at)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOutreach(candidate);
                      }}
                      className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25"
                    >
                      <Mail className="h-4 w-4" />
                      <span>Outreach</span>
                    </button>

                    <OutreachDialog
                      candidate={
                        outreachDialog.candidate as ShortlistedCandidate
                      }
                      isOpen={outreachDialog.open}
                      onClose={() =>
                        setOutreachDialog({ open: false, candidate: null })
                      }
                    />

                    {candidate.linkedin_url && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(candidate.linkedin_url, "_blank");
                        }}
                        className="flex items-center space-x-2 rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-sm text-neutral-300 transition-colors hover:border-neutral-600 hover:bg-neutral-700"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Candidate Detail Sidebar */}
      {selectedCandidate && (
        <CandidateDetailSidebar
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
          showOutreachButton={true}
          onOutreach={() => handleOutreach(selectedCandidate)}
        />
      )}
    </div>
  );
}
