"use client";

import React, { useState } from "react";
import {
  Plus,
  X,
  Send,
  Briefcase,
  MessageSquare,
  FileText,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const OutreachForm = () => {
  const [formData, setFormData] = useState({
    campaign_name: "",
    role: "",
    description: "",
    questions: [""],
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Check authentication on component mount
  const addQuestion = () => {
    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, ""],
    }));
  };

  const removeQuestion = (index: any) => {
    if (formData.questions.length > 1) {
      setFormData((prev) => ({
        ...prev,
        questions: prev.questions.filter((_, i) => i !== index),
      }));
    }
  };

  const updateQuestion = (index: any, value: any) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q, i) => (i === index ? value : q)),
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    setIsSubmitting(true);
    setError("");
    setSuccess("");

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
          questions: formData.questions.filter((q) => q.trim() !== ""),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create campaign");
      }

      const data = await response.json();
      setSuccess("Campaign created successfully!");

      // Reset form
      setFormData({
        campaign_name: "",
        role: "",
        description: "",
        questions: [""],
      });

      console.log("Campaign created:", data);
    } catch (error: any) {
      console.error("Error creating campaign:", error);
      setError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.campaign_name.trim() &&
    formData.role.trim() &&
    formData.questions.some((q) => q.trim());

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-card border rounded-lg shadow-sm p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Create Outreach Campaign
            </h1>
            <p className="text-muted-foreground">
              Design your hiring outreach with AI-powered candidate assessment
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/15 border border-destructive/20 text-destructive">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-lg bg-green-500/15 border border-green-500/20 text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Campaign Name */}
            <div className="space-y-2">
              <Label className="flex items-center font-medium mb-3">
                <Send className="w-5 h-5 mr-2 text-muted-foreground" />
                Campaign Name
              </Label>
              <Input
                type="text"
                value={formData.campaign_name}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    campaign_name: e.target.value,
                  }))
                }
                placeholder="e.g., Senior Frontend Developer Q1 2025"
                required
              />
            </div>

            {/* Role */}
            <div className="space-y-2">
              <Label className="flex items-center font-medium mb-3">
                <Briefcase className="w-5 h-5 mr-2 text-muted-foreground" />
                Role
              </Label>
              <Input
                type="text"
                value={formData.role}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, role: e.target.value }))
                }
                placeholder="e.g., Senior Frontend Developer"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label className="flex items-center font-medium mb-3">
                <FileText className="w-5 h-5 mr-2 text-muted-foreground" />
                Description
              </Label>
              <Textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Brief description of the role and what you're looking for..."
                rows={4}
                className="resize-none"
              />
            </div>

            {/* Questions */}
            <div className="space-y-4">
              <Label className="flex items-center font-medium">
                <MessageSquare className="w-5 h-5 mr-2 text-muted-foreground" />
                Assessment Questions
              </Label>

              <div className="space-y-3">
                {formData.questions.map((question, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <div className="flex-1">
                      <Textarea
                        value={question}
                        onChange={(e) => updateQuestion(index, e.target.value)}
                        placeholder={`Question ${
                          index + 1
                        }: e.g., Tell us about your experience with React...`}
                        rows={2}
                        className="resize-none"
                        required={index === 0}
                      />
                    </div>
                    {formData.questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(index)}
                        className="mt-2 p-2 rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={addQuestion}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Question
              </button>
            </div>

            {/* Submit Button */}
            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="w-full py-4 px-6 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin"></div>
                    Creating Campaign...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Send className="w-5 h-5" />
                    Create Outreach Campaign
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default OutreachForm;
