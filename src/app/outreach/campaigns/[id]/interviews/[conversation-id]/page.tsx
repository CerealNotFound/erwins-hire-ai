"use client";

import React, { useState, useEffect, useRef, use } from "react";
import {
  ArrowLeft,
  Clock,
  MessageSquare,
  User,
  CheckCircle2,
  XCircle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface InterviewMessage {
  id: string;
  conversation_id: string;
  question_index: number;
  question: string;
  answer: string | null;
  answer_timestamp: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

interface InterviewViewerProps {
  campaignId: string;
  conversationId: string;
}

export default function InterviewViewer({
  params,
}: {
  params: Promise<{ id: string; "conversation-id": string }>;
}) {
  const [messages, setMessages] = useState<InterviewMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id: campaignId, "conversation-id": conversationId } = use(params);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Now fetch with actual values
        const response = await fetch(
          `/api/interview-conversations/messages?conversationId=${conversationId}`
        );

        if (response.ok) {
          const data = await response.json();
          setMessages(data.messages);
        } else {
          setError("Failed to fetch messages");
        }
      } catch (error) {
        setError("Failed to fetch messages");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const formatTimestamp = (timestamp: string | null) => {
    if (!timestamp) return null;
    return new Date(timestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCompletionStats = () => {
    const answered = messages.filter((m) => m.answer && m.answer.trim()).length;
    const total = messages.length;
    return {
      answered,
      total,
      percentage: total > 0 ? Math.round((answered / total) * 100) : 0,
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="flex items-center gap-3 text-neutral-400">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Loading interview...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center space-y-4">
          <XCircle className="w-12 h-12 text-red-500 mx-auto" />
          <div className="text-neutral-200">Failed to load interview</div>
          <div className="text-neutral-500 text-sm">{error}</div>
          <Button variant="outline">
            <a href={`/outreach/campaigns/${campaignId}`}>Go Back</a>
          </Button>
        </div>
      </div>
    );
  }

  const stats = getCompletionStats();

  return (
    <div className="min-h-screen pt-16 bg-black text-neutral-100">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              className="text-neutral-400 hover:text-neutral-100"
            >
              <a href={`/outreach/campaigns/${campaignId}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Campaign
              </a>
            </Button>
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-neutral-500" />
              <span className="text-lg font-medium">Interview Session</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge
              variant="secondary"
              className="bg-neutral-800 text-neutral-300"
            >
              {stats.answered}/{stats.total} answered
            </Badge>
            <Badge
              variant={stats.percentage === 100 ? "default" : "secondary"}
              className={
                stats.percentage === 100
                  ? "bg-green-900 text-green-100"
                  : "bg-neutral-800 text-neutral-300"
              }
            >
              {stats.percentage}% complete
            </Badge>
          </div>
        </div>

        {/* Messages */}
        <div className="space-y-6">
          {messages.map((message, index) => (
            <Card
              key={message.id}
              className="bg-neutral-950 border-neutral-800"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge
                      variant="outline"
                      className="text-xs text-neutral-400 border-neutral-700"
                    >
                      Q{message.question_index + 1}
                    </Badge>
                    <span className="text-sm text-neutral-500">Question</span>
                  </div>
                  {message.answer_timestamp && (
                    <div className="flex items-center gap-2 text-xs text-neutral-500">
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(message.answer_timestamp)}
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Question */}
                <div className="p-4 bg-neutral-900 rounded-lg border border-neutral-800">
                  <p className="text-neutral-100 leading-relaxed">
                    {message.question}
                  </p>
                </div>

                {/* Answer */}
                <div className="flex items-start gap-3">
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-neutral-500" />
                    <span className="text-xs text-neutral-500 font-medium">
                      Answer
                    </span>
                  </div>
                  <div className="flex-1">
                    {message.answer && message.answer.trim() ? (
                      <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800/50">
                        <p className="text-neutral-200 leading-relaxed whitespace-pre-wrap">
                          {message.answer}
                        </p>
                      </div>
                    ) : (
                      <div className="p-4 bg-neutral-900/50 rounded-lg border border-neutral-800/50 border-dashed">
                        <p className="text-neutral-500 italic">
                          No response provided
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
              <div className="text-neutral-400">
                No interview questions found
              </div>
              <div className="text-neutral-600 text-sm mt-2">
                This conversation may not have started yet
              </div>
            </div>
          )}
        </div>

        {/* Summary Footer */}
        {messages.length > 0 && (
          <div className="mt-12 p-6 bg-neutral-950 rounded-lg border border-neutral-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  {stats.percentage === 100 ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-neutral-500" />
                  )}
                  <span className="text-sm font-medium">
                    {stats.percentage === 100
                      ? "Interview Complete"
                      : "Interview In Progress"}
                  </span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <span className="text-sm text-neutral-400">
                  {stats.answered} of {stats.total} questions answered
                </span>
              </div>

              <Button variant="outline">
                <a href={`/outreach/campaigns/${campaignId}`}>
                  Back to Campaign
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
