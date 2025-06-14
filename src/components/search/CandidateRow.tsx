"use client";

import React from "react";
import { useAtom } from "jotai";
import {
  ExternalLink,
  Star,
  Briefcase,
  User,
  MapPin,
  Github,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { ProcessedCandidate } from "@/app/search/page";
import { 
  selectedCandidateIdsAtom, 
  toggleCandidateSelectionAtom 
} from "@/lib/atoms/selectedCandidates";

interface CandidateRowProps {
  candidate: ProcessedCandidate;
  onClick: () => void;
  isSelected: boolean;
  searchId: string;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
};

export const CandidateRow = ({ candidate, onClick, isSelected, searchId }: CandidateRowProps) => {
  const [selectedIds] = useAtom(selectedCandidateIdsAtom);
  const [, toggleSelection] = useAtom(toggleCandidateSelectionAtom);
  
  const isCandidateSelected = selectedIds.has(candidate.id);

  const handleCheckboxChange = (checked: boolean) => {
    toggleSelection(candidate);
  };

  return (
    <Card
      className={`transition-all duration-200 hover:bg-neutral-800/50 border-neutral-700 bg-neutral-900/50 backdrop-blur-sm ${
        isSelected ? "ring-2 ring-blue-500 bg-neutral-800/70" : ""
      } ${isCandidateSelected ? "ring-1 ring-emerald-500/50 bg-emerald-900/10" : ""}`}
    >
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Checkbox - Left most */}
          <div className="flex items-start pt-2">
            <Checkbox
              checked={isCandidateSelected}
              onCheckedChange={handleCheckboxChange}
              className="data-[state=checked]:bg-emerald-500 data-[state=checked]:border-emerald-500"
            />
          </div>

          {/* Left Section - Profile */}
          <div className="flex-1 min-w-0 cursor-pointer" onClick={onClick}>
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <User className="w-6 h-6 text-white" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-xl font-semibold text-white truncate">
                    {candidate.full_name}
                  </h3>
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-400" />
                    <span className={`font-medium ${getScoreColor(candidate.overall_score)}`}>
                      {candidate.overall_score}%
                    </span>
                  </div>
                </div>

                <p className="text-neutral-300 font-medium mb-2">{candidate.title}</p>

                <div className="flex items-center gap-4 text-sm text-neutral-400 mb-3">
                  {candidate.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{candidate.location}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    <span>{candidate.experience_years} years exp</span>
                  </div>
                </div>

                {candidate.about && (
                  <p className="text-neutral-300 text-sm leading-relaxed mb-4 line-clamp-3">
                    {candidate.about}
                  </p>
                )}

                {/* Skills */}
                <div className="flex flex-wrap gap-2">
                  {candidate.matching_skills.slice(0, 4).map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-emerald-500/20 text-emerald-300 text-xs px-2 py-1"
                    >
                      {skill}
                    </Badge>
                  ))}
                  {candidate.matching_skills.length > 4 && (
                    <Badge variant="outline" className="text-neutral-400 text-xs">
                      +{candidate.matching_skills.length - 4} more
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Scores & Links */}
          <div className="flex flex-col items-end gap-3 min-w-[120px]">
            <div className="grid grid-cols-2 gap-3 text-center">
              <div>
                <div className={`text-lg font-bold ${getScoreColor(candidate.semantic_match_score)}`}>
                  {candidate.semantic_match_score}%
                </div>
                <div className="text-xs text-neutral-500">Match</div>
              </div>
              <div>
                <div className={`text-lg font-bold ${getScoreColor(candidate.skill_match_percentage)}`}>
                  {candidate.skill_match_percentage}%
                </div>
                <div className="text-xs text-neutral-500">Skills</div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-2">
              {candidate.linkedin_url && (
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8" asChild>
                  <a href={candidate.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {candidate.github_url && (
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8" asChild>
                  <a href={candidate.github_url} target="_blank" rel="noopener noreferrer">
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {candidate.portfolio_url && (
                <Button variant="ghost" size="sm" className="p-1 h-8 w-8" asChild>
                  <a href={candidate.portfolio_url} target="_blank" rel="noopener noreferrer">
                    <Globe className="w-4 h-4" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};