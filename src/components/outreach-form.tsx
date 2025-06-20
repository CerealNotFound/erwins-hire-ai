"use client";

import { useState } from "react";
import {
  Plus,
  X,
  Send,
  Briefcase,
  MessageSquare,
  FileText,
  Settings,
  Hash,
  Trash,
  Target,
  Users,
  Brain,
  TrendingUp,
  CheckCircle2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";

// Define types
type TechnicalConfigKey = "level_1" | "level_2" | "level_3" | "level_4" | "level_5";
type TechnicalConfig = Record<TechnicalConfigKey, number>;

type ICPConfig = {
  technicalExpectations: {
    minimumLevel: string;
    preferredDepth: string[];
    mustHave: string[];
  };
  communicationStyle: {
    preferred: string;
    clientFacing: boolean;
    teachingAbility: string;
  };
  problemSolvingApproach: {
    preferred: string;
    edgeCaseImportance: string;
    innovationBalance: number;
  };
  growthProfile: {
    currentLevel: string;
    learningAgility: string;
    leadershipPotential: string;
  };
};

const OutreachForm = () => {
  const [activeTab, setActiveTab] = useState("campaign");
  const [formData, setFormData] = useState({
    campaign_name: "",
    role: "",
    description: "",
    culture_questions: [""],
    technical_config: {
      level_1: 0,
      level_2: 0,
      level_3: 0,
      level_4: 0,
      level_5: 0,
    } as TechnicalConfig,
    icp_config: {
      technicalExpectations: {
        minimumLevel: "level_2",
        preferredDepth: [],
        mustHave: [],
      },
      communicationStyle: {
        preferred: "detailed_thorough",
        clientFacing: false,
        teachingAbility: "medium",
      },
      problemSolvingApproach: {
        preferred: "systematic_methodical",
        edgeCaseImportance: "medium",
        innovationBalance: 0.5,
      },
      growthProfile: {
        currentLevel: "mid_level",
        learningAgility: "high",
        leadershipPotential: "optional",
      },
    } as ICPConfig,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState<{
    type: "error" | "success";
    message: string;
  } | null>(null);

  // Notification management
  const showNotification = (type: "error" | "success", message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Culture questions handlers
  const addCultureQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      culture_questions: [...prev.culture_questions, ""],
    }));
  };

  const removeCultureQuestion = (index: number) => {
    if (formData.culture_questions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        culture_questions: prev.culture_questions.filter((_, i) => i !== index),
      }));
    }
  };

  const updateCultureQuestion = (index: number, value: string) => {
    setFormData((prev) => ({
      ...prev,
      culture_questions: prev.culture_questions.map((q, i) =>
        i === index ? value : q
      ),
    }));
  };

  // Technical config handlers
  const updateTechnicalLevel = (level: TechnicalConfigKey, count: string) => {
    setFormData((prev) => ({
      ...prev,
      technical_config: {
        ...prev.technical_config,
        [level]: parseInt(count) || 0,
      },
    }));
  };

  // ICP config handlers
  const updateICPField = (section: keyof ICPConfig, field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      icp_config: {
        ...prev.icp_config,
        [section]: {
          ...prev.icp_config[section],
          [field]: value,
        },
      },
    }));
  };

  const toggleArrayValue = (section: keyof ICPConfig, field: string, value: string) => {
    setFormData((prev: any) => {
      const currentArray = prev.icp_config[section][field] as string[];
      const newArray = currentArray.includes(value)
        ? currentArray.filter(item => item !== value)
        : [...currentArray, value];
      
      return {
        ...prev,
        icp_config: {
          ...prev.icp_config,
          [section]: {
            ...prev.icp_config[section],
            [field]: newArray,
          },
        },
      };
    });
  };

  // Validation
  const getTotalTechnicalQuestions = () => {
    return Object.values(formData.technical_config).reduce(
      (sum, count) => sum + count,
      0
    );
  };

  const isFormValid =
    formData.campaign_name.trim() &&
    formData.role.trim() &&
    (formData.culture_questions.some((q) => q.trim()) ||
      getTotalTechnicalQuestions() > 0);

  // Submit handler
  const handleSubmit = async () => {
    if (!isFormValid) {
      showNotification("error", "Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/outreach-campaigns", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaign_name: formData.campaign_name,
          role: formData.role,
          description: formData.description,
          culture_questions: formData.culture_questions.filter(
            (q) => q.trim() !== ""
          ),
          technical_config: formData.technical_config,
          icp_config: formData.icp_config,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }

      showNotification("success", "Campaign created successfully!");

      // Reset form
      setFormData({
        campaign_name: "",
        role: "",
        description: "",
        culture_questions: [""],
        technical_config: {
          level_1: 0,
          level_2: 0,
          level_3: 0,
          level_4: 0,
          level_5: 0,
        },
        icp_config: {
          technicalExpectations: {
            minimumLevel: "level_2",
            preferredDepth: [],
            mustHave: [],
          },
          communicationStyle: {
            preferred: "detailed_thorough",
            clientFacing: false,
            teachingAbility: "medium",
          },
          problemSolvingApproach: {
            preferred: "systematic_methodical",
            edgeCaseImportance: "medium",
            innovationBalance: 0.5,
          },
          growthProfile: {
            currentLevel: "mid_level",
            learningAgility: "high",
            leadershipPotential: "optional",
          },
        },
      });
      setActiveTab("campaign");
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      showNotification("error", error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const technicalLevels = [
    {
      key: "level_1" as TechnicalConfigKey,
      label: "Level 1",
      description: "Basic understanding & explanation",
      color: "bg-green-100 text-green-800",
    },
    {
      key: "level_2" as TechnicalConfigKey,
      label: "Level 2",
      description: "Implementation details & decisions",
      color: "bg-blue-100 text-blue-800",
    },
    {
      key: "level_3" as TechnicalConfigKey,
      label: "Level 3",
      description: "Problem-solving & edge cases",
      color: "bg-yellow-100 text-yellow-800",
    },
    {
      key: "level_4" as TechnicalConfigKey,
      label: "Level 4",
      description: "System design & architecture",
      color: "bg-orange-100 text-orange-800",
    },
    {
      key: "level_5" as TechnicalConfigKey,
      label: "Level 5",
      description: "Leadership & innovation",
      color: "bg-red-100 text-red-800",
    },
  ];

  const preferredDepthOptions = [
    "system_design", "scalability", "performance_optimization", 
    "security", "testing", "architecture", "database_design",
    "api_design", "deployment", "monitoring"
  ];

  const mustHaveOptions = [
    "error_handling", "testing_mindset", "code_review", 
    "debugging", "performance_awareness", "security_mindset",
    "documentation", "version_control", "ci_cd", "monitoring"
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Notification */}
      {notification && (
        <div className={`p-4 rounded-lg border ${
          notification.type === "error" 
            ? "bg-destructive/15 border-destructive/20 text-destructive"
            : "bg-green-500/15 border-green-500/20 text-green-700"
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === "success" && <CheckCircle2 className="h-4 w-4" />}
            {notification.message}
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="campaign" className="flex items-center gap-2">
            <Briefcase className="h-4 w-4" />
            Campaign Setup
          </TabsTrigger>
          <TabsTrigger value="icp" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            ICP Profiling
          </TabsTrigger>
        </TabsList>

        <TabsContent value="campaign" className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Campaign Details
              </CardTitle>
              <CardDescription>
                Basic information about your hiring campaign
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="campaign_name">Campaign Name</Label>
                <Input
                  id="campaign_name"
                  value={formData.campaign_name}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      campaign_name: e.target.value,
                    }))
                  }
                  placeholder="e.g., Senior Frontend Developer Q1 2025"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, role: e.target.value }))
                  }
                  placeholder="e.g., Senior Frontend Developer"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  placeholder="Brief description of the role, tech stack, and requirements..."
                  className="min-h-[100px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Technical Assessment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Technical Assessment Configuration
              </CardTitle>
              <CardDescription>
                Technical questions will be generated based on each candidate's
                resume and projects
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {technicalLevels.map((level) => (
                  <div key={level.key} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className={level.color}>
                            {level.label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {level.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Hash className="h-4 w-4 text-muted-foreground" />
                        <Input
                          type="number"
                          min="0"
                          max="10"
                          value={formData.technical_config[level.key]}
                          onChange={(e) =>
                            updateTechnicalLevel(level.key, e.target.value)
                          }
                          className="w-20 text-center"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Total Technical Questions</span>
                  <Badge variant="outline" className="text-lg px-3 py-1">
                    {getTotalTechnicalQuestions()}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Culture Questions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Culture & Behavioral Questions
              </CardTitle>
              <CardDescription>
                Add questions to assess cultural fit and behavioral patterns
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.culture_questions.map((question, index) => (
                <div key={index} className="flex gap-3 items-center">
                  <div className="flex-1">
                    <Textarea
                      value={question}
                      onChange={(e) => updateCultureQuestion(index, e.target.value)}
                      placeholder={`Culture question ${
                        index + 1
                      }: e.g., Tell us about a time when you had to adapt to significant changes...`}
                      className="min-h-[80px]"
                    />
                  </div>
                  {formData.culture_questions.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCultureQuestion(index)}
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              <Button
                type="button"
                variant="outline"
                onClick={addCultureQuestion}
                className="w-full"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Culture Question
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="icp" className="space-y-6">
          {/* Technical Expectations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Technical Expectations
              </CardTitle>
              <CardDescription>
                Define the technical profile that aligns with your needs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Minimum Technical Level</Label>
                <Select
                  value={formData.icp_config.technicalExpectations.minimumLevel}
                  onValueChange={(value) => 
                    updateICPField("technicalExpectations", "minimumLevel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="level_1">Level 1 - Basic Understanding</SelectItem>
                    <SelectItem value="level_2">Level 2 - Implementation Skills</SelectItem>
                    <SelectItem value="level_3">Level 3 - Problem Solving</SelectItem>
                    <SelectItem value="level_4">Level 4 - System Design</SelectItem>
                    <SelectItem value="level_5">Level 5 - Leadership & Innovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Preferred Technical Depth (Select all that apply)</Label>
                <div className="grid grid-cols-2 gap-3">
                  {preferredDepthOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`depth-${option}`}
                        checked={formData.icp_config.technicalExpectations.preferredDepth.includes(option)}
                        onCheckedChange={() => 
                          toggleArrayValue("technicalExpectations", "preferredDepth", option)
                        }
                      />
                      <Label htmlFor={`depth-${option}`} className="text-sm font-normal">
                        {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <Label>Must-Have Skills</Label>
                <div className="grid grid-cols-2 gap-3">
                  {mustHaveOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={`must-${option}`}
                        checked={formData.icp_config.technicalExpectations.mustHave.includes(option)}
                        onCheckedChange={() => 
                          toggleArrayValue("technicalExpectations", "mustHave", option)
                        }
                      />
                      <Label htmlFor={`must-${option}`} className="text-sm font-normal">
                        {option.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Communication Style */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Communication & Collaboration
              </CardTitle>
              <CardDescription>
                How should they communicate and work with others?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Preferred Communication Style</Label>
                <Select
                  value={formData.icp_config.communicationStyle.preferred}
                  onValueChange={(value) => 
                    updateICPField("communicationStyle", "preferred", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="detailed_thorough">Detailed & Thorough</SelectItem>
                    <SelectItem value="concise_direct">Concise & Direct</SelectItem>
                    <SelectItem value="collaborative">Collaborative & Interactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="client-facing"
                  checked={formData.icp_config.communicationStyle.clientFacing}
                  onCheckedChange={(checked) => 
                    updateICPField("communicationStyle", "clientFacing", checked)
                  }
                />
                <Label htmlFor="client-facing">Will interact with clients/stakeholders</Label>
              </div>

              <div className="space-y-2">
                <Label>Teaching/Mentoring Ability</Label>
                <Select
                  value={formData.icp_config.communicationStyle.teachingAbility}
                  onValueChange={(value) => 
                    updateICPField("communicationStyle", "teachingAbility", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Not Required</SelectItem>
                    <SelectItem value="medium">Helpful</SelectItem>
                    <SelectItem value="high">Essential</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Problem Solving Approach */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Problem Solving & Work Style
              </CardTitle>
              <CardDescription>
                How do you want them to approach challenges?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Preferred Problem-Solving Style</Label>
                <Select
                  value={formData.icp_config.problemSolvingApproach.preferred}
                  onValueChange={(value) => 
                    updateICPField("problemSolvingApproach", "preferred", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="systematic_methodical">Systematic & Methodical</SelectItem>
                    <SelectItem value="creative_innovative">Creative & Innovative</SelectItem>
                    <SelectItem value="pragmatic_fast">Pragmatic & Fast</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Edge Case Awareness Importance</Label>
                <Select
                  value={formData.icp_config.problemSolvingApproach.edgeCaseImportance}
                  onValueChange={(value) => 
                    updateICPField("problemSolvingApproach", "edgeCaseImportance", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low Priority</SelectItem>
                    <SelectItem value="medium">Medium Priority</SelectItem>
                    <SelectItem value="high">High Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Innovation vs Stability Balance</Label>
                <div className="px-3">
                  <Slider
                    value={[formData.icp_config.problemSolvingApproach.innovationBalance * 100]}
                    onValueChange={(value: any) => 
                      updateICPField("problemSolvingApproach", "innovationBalance", value[0] / 100)
                    }
                    max={100}
                    step={10}
                    className="w-full"
                  />
                  <div className="flex justify-between text-sm text-muted-foreground mt-1">
                    <span>Stability Focused</span>
                    <span>Innovation Focused</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Growth Profile */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Growth & Leadership Profile
              </CardTitle>
              <CardDescription>
                What's their career stage and growth potential?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Current Level</Label>
                <Select
                  value={formData.icp_config.growthProfile.currentLevel}
                  onValueChange={(value) => 
                    updateICPField("growthProfile", "currentLevel", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="junior">Junior Level</SelectItem>
                    <SelectItem value="mid_level">Mid Level</SelectItem>
                    <SelectItem value="senior_level">Senior Level</SelectItem>
                    <SelectItem value="lead_level">Lead Level</SelectItem>
                    <SelectItem value="principal_level">Principal Level</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Learning Agility</Label>
                <Select
                  value={formData.icp_config.growthProfile.learningAgility}
                  onValueChange={(value) => 
                    updateICPField("growthProfile", "learningAgility", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low - Prefers familiar tech</SelectItem>
                    <SelectItem value="medium">Medium - Adapts when needed</SelectItem>
                    <SelectItem value="high">High - Thrives on new challenges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Leadership Potential</Label>
                <Select
                  value={formData.icp_config.growthProfile.leadershipPotential}
                  onValueChange={(value) => 
                    updateICPField("growthProfile", "leadershipPotential", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="not_required">Not Required</SelectItem>
                    <SelectItem value="optional">Nice to Have</SelectItem>
                    <SelectItem value="preferred">Preferred</SelectItem>
                    <SelectItem value="required">Required</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Summary & Submit */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Culture Questions:</span>
                <Badge variant="secondary">
                  {formData.culture_questions.filter((q) => q.trim()).length}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Technical Questions:</span>
                <Badge variant="secondary">
                  {getTotalTechnicalQuestions()}
                </Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Minimum Level:</span>
                <Badge variant="outline">
                  {formData.icp_config.technicalExpectations.minimumLevel.replace('level_', 'Level ')}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Level Target:</span>
                <Badge variant="outline">
                  {formData.icp_config.growthProfile.currentLevel.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </Badge>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isSubmitting}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Creating Campaign...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create Campaign
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OutreachForm;