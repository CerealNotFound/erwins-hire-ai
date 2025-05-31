"use client";

import React, { useState } from "react";
import {
  Flower,
  Sidebar,
  ExternalLink,
  Star,
  Award,
  Briefcase,
  User,
  X,
  MapPin,
  Github,
  Globe,
  Mail,
  BookOpen,
  GraduationCap,
  Code,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { SearchInput } from "@/components/search/SearchInput";
import { useSearch } from "@/hooks/useSearch/useSearch";

export interface ProcessedCandidate {
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
  experience_years: number;
  blog_url: string;
  similarity: number;
  skill_match_score: number;
  semantic_match_score: number;
  skill_match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  overall_score: number;
  experience_match: string;
}

const CandidateRow = ({
  candidate,
  onClick,
  isSelected,
}: {
  candidate: ProcessedCandidate;
  onClick: () => void;
  isSelected: boolean;
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-200 hover:bg-neutral-800/50 border-neutral-700 bg-neutral-900/50 backdrop-blur-sm ${
        isSelected ? "ring-2 ring-blue-500 bg-neutral-800/70" : ""
      }`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Left Section - Profile */}
          <div className="flex-1 min-w-0">
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
                    <span
                      className={`font-medium ${getScoreColor(
                        candidate.overall_score
                      )}`}
                    >
                      {candidate.overall_score}%
                    </span>
                  </div>
                </div>

                <p className="text-neutral-300 font-medium mb-2">
                  {candidate.title}
                </p>

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

                {/* About Section */}
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
                    <Badge
                      variant="outline"
                      className="text-neutral-400 text-xs"
                    >
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
                <div
                  className={`text-lg font-bold ${getScoreColor(
                    candidate.semantic_match_score
                  )}`}
                >
                  {candidate.semantic_match_score}%
                </div>
                <div className="text-xs text-neutral-500">Semantic</div>
              </div>
              <div>
                <div
                  className={`text-lg font-bold ${getScoreColor(
                    candidate.skill_match_percentage
                  )}`}
                >
                  {candidate.skill_match_percentage}%
                </div>
                <div className="text-xs text-neutral-500">Skills</div>
              </div>
            </div>

            {/* Quick Links */}
            <div className="flex gap-2">
              {candidate.linkedin_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 w-8"
                  asChild
                >
                  <a
                    href={candidate.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {candidate.github_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 w-8"
                  asChild
                >
                  <a
                    href={candidate.github_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                </Button>
              )}
              {candidate.portfolio_url && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 h-8 w-8"
                  asChild
                >
                  <a
                    href={candidate.portfolio_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
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

const CandidateDetailSidebar = ({
  candidate,
  onClose,
}: {
  candidate: ProcessedCandidate | null;
  onClose: () => void;
}) => {
  if (!candidate) return null;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="fixed right-0 top-0 h-full w-[420px] bg-neutral-900 border-l border-neutral-700 shadow-2xl z-50">
      <div className="flex items-center justify-between p-6 border-b border-neutral-700">
        <h2 className="text-lg font-semibold text-white">Candidate Profile</h2>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      <ScrollArea className="h-full pb-20">
        <div className="p-6 space-y-8">
          {/* Profile Header */}
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <User className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-1">
              {candidate.full_name}
            </h3>
            <p className="text-neutral-400 mb-2">{candidate.title}</p>
            {candidate.location && (
              <div className="flex items-center justify-center gap-1 text-neutral-500 text-sm mb-4">
                <MapPin className="w-4 h-4" />
                <span>{candidate.location}</span>
              </div>
            )}
          </div>

          {/* Contact & Links */}
          <div className="grid grid-cols-2 gap-3">
            {candidate.linkedin_url && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={candidate.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  LinkedIn
                </a>
              </Button>
            )}
            {candidate.github_url && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={candidate.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </a>
              </Button>
            )}
            {candidate.portfolio_url && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={candidate.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Globe className="w-4 h-4 mr-2" />
                  Portfolio
                </a>
              </Button>
            )}
            {candidate.blog_url && (
              <Button variant="outline" size="sm" asChild>
                <a
                  href={candidate.blog_url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Blog
                </a>
              </Button>
            )}
            {candidate.email && (
              <Button variant="outline" size="sm" asChild>
                <a href={`mailto:${candidate.email}`}>
                  <Mail className="w-4 h-4 mr-2" />
                  Email
                </a>
              </Button>
            )}
          </div>

          <Separator className="bg-neutral-700" />

          {/* Match Scores */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white flex items-center gap-2">
              <Award className="w-5 h-5" />
              Match Analysis
            </h4>
            <div className="grid grid-cols-3 gap-3">
              <Card className="bg-neutral-800 border-neutral-600">
                <CardContent className="p-3 text-center">
                  <div
                    className={`text-xl font-bold ${getScoreColor(
                      candidate.overall_score
                    )}`}
                  >
                    {candidate.overall_score}%
                  </div>
                  <div className="text-xs text-neutral-400">Overall</div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-600">
                <CardContent className="p-3 text-center">
                  <div
                    className={`text-xl font-bold ${getScoreColor(
                      candidate.semantic_match_score
                    )}`}
                  >
                    {candidate.semantic_match_score}%
                  </div>
                  <div className="text-xs text-neutral-400">Semantic</div>
                </CardContent>
              </Card>
              <Card className="bg-neutral-800 border-neutral-600">
                <CardContent className="p-3 text-center">
                  <div
                    className={`text-xl font-bold ${getScoreColor(
                      candidate.skill_match_percentage
                    )}`}
                  >
                    {candidate.skill_match_percentage}%
                  </div>
                  <div className="text-xs text-neutral-400">Skills</div>
                </CardContent>
              </Card>
            </div>
          </div>

          <Separator className="bg-neutral-700" />

          {/* About */}
          {candidate.about && (
            <>
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white">About</h4>
                <div className="bg-neutral-800 rounded-lg p-4">
                  <p className="text-neutral-300 leading-relaxed text-sm">
                    {candidate.about}
                  </p>
                </div>
              </div>
              <Separator className="bg-neutral-700" />
            </>
          )}

          {/* Experience */}
          {candidate.experience && (
            <>
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Briefcase className="w-5 h-5" />
                  Experience ({candidate.experience_years} years)
                </h4>
                <div className="space-y-3">
                  {candidate.experience &&
                  Array.isArray(candidate.experience) &&
                  candidate.experience.length > 0 ? (
                    candidate.experience.map((exp: any, index: number) => (
                      <div
                        key={index}
                        className="bg-neutral-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-white">
                            {exp.role || "N/A"}
                          </h5>
                          <span className="text-xs text-neutral-400">
                            {exp.start_date || "N/A"} - {exp.end_date || "N/A"}
                          </span>
                        </div>
                        <p className="text-blue-300 text-sm mb-2">
                          {exp.company || "N/A"}
                        </p>
                        {exp.description && (
                          <p className="text-neutral-300 text-sm leading-relaxed">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-neutral-800 rounded-lg p-4 text-center text-neutral-400">
                      No experience data available
                    </div>
                  )}
                </div>
              </div>
              <Separator className="bg-neutral-700" />
            </>
          )}

          {/* Education */}
          {candidate.education && (
            <>
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <GraduationCap className="w-5 h-5" />
                  Education
                </h4>
                <div className="space-y-3">
                  {candidate.education &&
                  Array.isArray(candidate.education) &&
                  candidate.education.length > 0 ? (
                    candidate.education.map((edu: any, index: number) => (
                      <div
                        key={index}
                        className="bg-neutral-800 rounded-lg p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h5 className="font-medium text-white">
                            {edu.degree || "N/A"}
                          </h5>
                          <span className="text-xs text-neutral-400">
                            {edu.start_date || "N/A"} - {edu.end_date || "N/A"}
                          </span>
                        </div>
                        <p className="text-purple-300 text-sm mb-1">
                          {edu.college_name || "N/A"}
                        </p>
                        {edu.location && (
                          <p className="text-neutral-400 text-sm mb-1">
                            {edu.location}
                          </p>
                        )}
                        {edu.cgpa && (
                          <p className="text-neutral-300 text-sm">
                            CGPA: {edu.cgpa}
                          </p>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="bg-neutral-800 rounded-lg p-4 text-center text-neutral-400">
                      No education data available
                    </div>
                  )}
                </div>
              </div>
              <Separator className="bg-neutral-700" />
            </>
          )}

          {/* Projects */}
          {candidate.project_urls && candidate.project_urls.length > 0 && (
            <>
              <div className="space-y-3">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Projects
                </h4>
                <div className="space-y-2">
                  {candidate.project_urls.map((url, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href={url} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Project {index + 1}
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
              <Separator className="bg-neutral-700" />
            </>
          )}

          {/* Skills Analysis */}
          <div className="space-y-4">
            <h4 className="text-lg font-semibold text-white">Skills</h4>

            {candidate.matching_skills.length > 0 && (
              <div>
                <div className="text-sm font-medium text-emerald-400 mb-2">
                  Matching Skills ({candidate.matching_skills.length})
                </div>
                <div className="flex flex-wrap gap-2">
                  {candidate.matching_skills.map((skill, index) => (
                    <Badge
                      key={index}
                      className="bg-emerald-500/20 text-emerald-300 text-xs"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {candidate.missing_skills &&
              candidate.missing_skills.length > 0 && (
                <div>
                  <div className="text-sm font-medium text-red-400 mb-2">
                    Missing Skills ({candidate.missing_skills.length})
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.missing_skills.map((skill, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="border-red-500/30 text-red-300 text-xs"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            <div>
              <div className="text-sm font-medium text-neutral-300 mb-2">
                All Skills ({candidate.skills.length})
              </div>
              <div className="flex flex-wrap gap-2">
                {candidate.skills.map((skill, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-neutral-700 text-neutral-200 text-xs"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ScrollArea>
    </div>
  );
};

export default function Chat() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeConversationId, setActiveConversation] = useState(1);
  const [selectedCandidate, setSelectedCandidate] =
    useState<ProcessedCandidate | null>(null);

  const { searchCandidates, loading, searchResults } = useSearch();

  const toggleSidebar = () => setIsOpen(!isOpen);
  const conversations = [{ id: 1, title: "Search 1" }];

  return (
    <div className="flex min-h-screen bg-neutral-950">
      {/* Left Sidebar */}
      <div
        className={`${isOpen ? "w-1/6 transition-all" : "transition-all w-0"}`}
      >
        <div
          className={`fixed ${
            isOpen ? "w-1/6" : "w-0 hidden"
          } h-screen bg-neutral-900 border-r border-neutral-700 transition-all`}
        >
          <div className="m-4">
            <div className="text-xs font-medium text-neutral-400 mb-3">
              Recent Searches
            </div>
            <div className="flex flex-col text-sm space-y-2">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`hover:bg-neutral-800 flex gap-2 items-center p-3 rounded-lg cursor-pointer transition-colors ${
                    conversation.id === activeConversationId
                      ? "bg-neutral-800"
                      : ""
                  }`}
                  onClick={() => setActiveConversation(conversation.id)}
                >
                  <div className="text-neutral-300">{conversation.title}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div
        className={`flex h-screen ${
          isOpen ? "w-5/6" : "w-full"
        } flex-col bg-neutral-950 transition-all`}
      >
        {/* Header */}
        <div className="flex fixed w-full h-14 items-center border-b border-neutral-700 bg-neutral-900/95 backdrop-blur-sm px-6 z-40">
          <div className="mr-4">
            <Button
              onClick={toggleSidebar}
              variant="ghost"
              className="text-neutral-300 hover:bg-neutral-800"
            >
              <Sidebar className="w-4 h-4" />
            </Button>
          </div>
          <div className="font-semibold text-white">Candidate Search</div>
        </div>

        {/* Content Area */}
        <div className="flex h-screen pt-14 w-full flex-col bg-neutral-950">
          {searchResults.length === 0 ? (
            /* Empty State */
            <div className="flex-1 flex flex-col items-center justify-center px-6">
              <div className="text-center max-w-md">
                <Flower
                  width={48}
                  height={48}
                  className="text-blue-500 animate-pulse mx-auto mb-6"
                />
                <h2 className="text-3xl font-bold text-white mb-3">
                  Find Perfect Candidates
                </h2>
                <p className="text-neutral-400 text-lg">
                  Search through our database of talented professionals
                </p>
              </div>
            </div>
          ) : (
            /* Results Area */
            <div className="flex-1 overflow-y-auto px-6 py-6">
              <div className="max-w-5xl mx-auto">
                <div className="mb-8">
                  <h3 className="text-2xl font-semibold text-white mb-2">
                    Search Results ({searchResults.length})
                  </h3>
                  <p className="text-neutral-400 text-lg">
                    Found {searchResults.length} matching candidates
                  </p>
                </div>

                <div className="space-y-6">
                  {searchResults.map((candidate: any) => (
                    <CandidateRow
                      key={candidate.id}
                      candidate={candidate}
                      onClick={() => setSelectedCandidate(candidate)}
                      isSelected={selectedCandidate?.id === candidate.id}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Search Input */}
          <div className="w-full flex flex-col items-center bg-neutral-950 border-t border-neutral-800">
            <div className="w-full max-w-4xl px-6 py-4">
              <SearchInput
                searchHandler={searchCandidates}
                isLoading={loading}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Candidate Detail Sidebar */}
      {selectedCandidate && (
        <CandidateDetailSidebar
          candidate={selectedCandidate}
          onClose={() => setSelectedCandidate(null)}
        />
      )}
    </div>
  );
}
