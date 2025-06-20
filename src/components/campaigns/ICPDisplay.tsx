import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  MessageSquare,
  Code,
  Target,
  Lightbulb,
  Shield,
  Users,
  BookOpen,
  CheckCircle,
} from "lucide-react";

export interface ICPConfig {
  growthProfile: {
    currentLevel: string;
    learningAgility: string;
    leadershipPotential: string;
  };
  communicationStyle: {
    preferred: string;
    clientFacing: boolean;
    teachingAbility: string;
  };
  technicalExpectations: {
    mustHave: string[];
    minimumLevel: string;
    preferredDepth: string[];
  };
  problemSolvingApproach: {
    preferred: string;
    innovationBalance: number;
    edgeCaseImportance: string;
  };
}

// Sample data
const sampleICPConfig: ICPConfig = {
  growthProfile: {
    currentLevel: "mid_level",
    learningAgility: "high",
    leadershipPotential: "optional",
  },
  communicationStyle: {
    preferred: "detailed_thorough",
    clientFacing: true,
    teachingAbility: "medium",
  },
  technicalExpectations: {
    mustHave: [
      "error_handling",
      "code_review",
      "performance_awareness",
      "documentation",
      "debugging",
      "testing_mindset",
      "security_mindset",
      "version_control",
    ],
    minimumLevel: "level_2",
    preferredDepth: [
      "system_design",
      "performance_optimization",
      "testing",
      "database_design",
      "security",
      "architecture",
      "api_design",
    ],
  },
  problemSolvingApproach: {
    preferred: "systematic_methodical",
    innovationBalance: 0.7,
    edgeCaseImportance: "medium",
  },
};

interface ICPDisplayProps {
  icpConfig?: ICPConfig;
}

export default function ICPDisplay({
  icpConfig = sampleICPConfig,
}: ICPDisplayProps) {
  const formatLabel = (str: string) => {
    return str.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case "high":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "medium":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "low":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "mid_level":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "level_2":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "optional":
        return "bg-gray-100 text-gray-600 hover:bg-gray-100";
      default:
        return "bg-neutral-100 text-neutral-600 hover:bg-neutral-100";
    }
  };

  const innovationPercentage =
    icpConfig.problemSolvingApproach.innovationBalance * 100;

  // Group skills logically
  const skillCategories = {
    // Core Development Skills - The foundation every dev needs
    Development: [
      "error_handling",
      "code_review",
      "debugging",
      "version_control",
      "performance_optimization",
      "testing",
      "documentation",
      "system_design",
      "scalability",
      "architecture",
      "database_design",
      "api_design",
      "deployment",
    ],
    Quality: [
      "testing_mindset",
      "performance_awareness",
      "monitoring",
      "ci_cd",
    ],
    Security: ["security", "security_mindset"],
  };

  const categorizeSkills = (skills: string[]) => {
    const categorized: { [key: string]: string[] } = {};
    const uncategorized: string[] = [];

    skills.forEach((skill) => {
      let found = false;
      Object.entries(skillCategories).forEach(([category, categorySkills]) => {
        if (categorySkills.includes(skill)) {
          if (!categorized[category]) categorized[category] = [];
          categorized[category].push(skill);
          found = true;
        }
      });
      if (!found) uncategorized.push(skill);
    });

    return { categorized, uncategorized };
  };

  const { categorized, uncategorized } = categorizeSkills(
    icpConfig.technicalExpectations.mustHave
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-orange-500" />
        <h2 className="text-xl font-bold text-white">
          Ideal Candidate Profile
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Growth Profile */}
        <Card className="border-none bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-4 w-4 text-blue-500" />
              Growth Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Current Level</span>
              <Badge
                className={getLevelColor(icpConfig.growthProfile.currentLevel)}
              >
                {formatLabel(icpConfig.growthProfile.currentLevel)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Learning Agility</span>
              <Badge
                className={getLevelColor(
                  icpConfig.growthProfile.learningAgility
                )}
              >
                {formatLabel(icpConfig.growthProfile.learningAgility)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">
                Leadership Potential
              </span>
              <Badge
                className={getLevelColor(
                  icpConfig.growthProfile.leadershipPotential
                )}
              >
                {formatLabel(icpConfig.growthProfile.leadershipPotential)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Communication Style */}
        <Card className="border-none bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <MessageSquare className="h-4 w-4 text-green-500" />
              Communication Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Preferred Style</span>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                {formatLabel(icpConfig.communicationStyle.preferred)}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Client Facing</span>
              <Badge
                className={
                  icpConfig.communicationStyle.clientFacing
                    ? "bg-green-100 text-green-800 hover:bg-green-100"
                    : "bg-red-100 text-red-800 hover:bg-red-100"
                }
              >
                {icpConfig.communicationStyle.clientFacing
                  ? "Required"
                  : "Not Required"}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Teaching Ability</span>
              <Badge
                className={getLevelColor(
                  icpConfig.communicationStyle.teachingAbility
                )}
              >
                {formatLabel(icpConfig.communicationStyle.teachingAbility)}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Problem Solving Approach */}
        <Card className="border-none bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Lightbulb className="h-4 w-4 text-yellow-500" />
              Problem Solving
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Approach</span>
              <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                {formatLabel(icpConfig.problemSolvingApproach.preferred)}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-400">Innovation Balance</span>
                <span className="text-white font-medium">
                  {innovationPercentage.toFixed(0)}%
                </span>
              </div>
              <Progress value={innovationPercentage} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">
                Edge Case Importance
              </span>
              <Badge
                className={getLevelColor(
                  icpConfig.problemSolvingApproach.edgeCaseImportance
                )}
              >
                {formatLabel(
                  icpConfig.problemSolvingApproach.edgeCaseImportance
                )}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Technical Requirements - IMPROVED */}
        <Card className="border-none bg-neutral-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Code className="h-4 w-4 text-orange-500" />
              Technical Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-neutral-400">Minimum Level</span>
              <Badge
                className={getLevelColor(
                  icpConfig.technicalExpectations.minimumLevel
                )}
              >
                {formatLabel(icpConfig.technicalExpectations.minimumLevel)}
              </Badge>
            </div>

            {/* Categorized Skills */}
            {Object.entries(categorized).map(([category, skills]) => (
              <div key={category} className="space-y-2">
                <span className="text-xs text-neutral-500 font-medium">
                  {category}
                </span>
                <div className="flex flex-wrap gap-1">
                  {skills.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-neutral-700 px-2 py-1 rounded text-xs"
                    >
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-neutral-200">
                        {formatLabel(skill)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {uncategorized.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs text-neutral-500 font-medium">
                  Other
                </span>
                <div className="flex flex-wrap gap-1">
                  {uncategorized.map((skill, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-1 bg-neutral-700 px-2 py-1 rounded text-xs"
                    >
                      <CheckCircle className="h-3 w-3 text-green-400" />
                      <span className="text-neutral-200">
                        {formatLabel(skill)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Preferred Technical Depth - IMPROVED */}
      <Card className="border-none bg-neutral-900/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BookOpen className="h-4 w-4 text-indigo-500" />
            Preferred Technical Depth
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex w-10/11 flex-wrap gap-2">
            {icpConfig.technicalExpectations.preferredDepth.map((area, idx) => (
              <div key={idx} className="flex items-center rounded-lg px-3 py-2">
                {/* <div className="w-2 h-2 bg-green-500 rounded-full"></div> */}
                <Badge className=" hover:bg-indigo-100 border-0 text-xs p-2">
                  {formatLabel(area)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
