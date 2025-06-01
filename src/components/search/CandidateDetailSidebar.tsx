"use client";

import React from "react";
import {
  ExternalLink,
  X,
  MapPin,
  Github,
  Globe,
  Mail,
  BookOpen,
  GraduationCap,
  Code,
  Award,
  Briefcase,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ProcessedCandidate } from "@/app/search/page";
import { ShortlistedCandidate } from "@/app/shortlisted/page";

interface CandidateDetailSidebarProps {
  candidate: ProcessedCandidate | ShortlistedCandidate;
  onClose: () => void;
  showOutreachButton?: boolean;
  onOutreach?: () => void;
}

const getScoreColor = (score: number) => {
  if (score >= 80) return "text-emerald-400";
  if (score >= 60) return "text-yellow-400";
  return "text-red-400";
};

export const CandidateDetailSidebar = ({
  candidate,
  onClose,
  showOutreachButton,
  onOutreach
}: CandidateDetailSidebarProps) => {
  if (!candidate) return null;

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
        {showOutreachButton && onOutreach && (
          <div className="border-t border-neutral-800 p-6">
            <button
              onClick={onOutreach}
              className="w-full flex items-center justify-center space-x-2 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-sm font-medium text-white transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-lg hover:shadow-blue-500/25"
            >
              <Mail className="h-4 w-4" />
              <span>Start Outreach</span>
            </button>
            <p className="mt-2 text-xs text-neutral-500 text-center">
              Opens email client or LinkedIn profile
            </p>
          </div>
        )}
      </ScrollArea>
    </div>
  );
};
