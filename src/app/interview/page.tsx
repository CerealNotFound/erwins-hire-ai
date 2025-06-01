"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AvatarComponent from "@/components/modules/talking-avatar/ai-avatar";
import { useSimpleVoiceEngine } from "@/components/modules/talking-avatar/voice-engine";
import { useAudioRecorder } from "@/hooks/chat-input/useAudioRecorder";

interface OutreachCampaign {
  id: string;
  campaign_name: string;
  role: string;
  description: string;
  questions: string[];
}

interface ConversationRecord {
  question: string;
  answer: string;
  timestamp: Date;
}

type InterviewState = "loading" | "ready" | "active" | "completed" | "error";

export default function InterviewPage() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading interview..." />}>
      <InterviewPageContent />
    </Suspense>
  );
}

function InterviewPageContent() {
  const searchParams = useSearchParams();
  const campaignId = searchParams.get("campaignId");
  const candidateId = searchParams.get("candidateId");

  // Core state
  const [avatar, setAvatar] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [campaign, setCampaign] = useState<OutreachCampaign | null>(null);

  // Interview flow
  const [interviewState, setInterviewState] =
    useState<InterviewState>("loading");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [conversation, setConversation] = useState<ConversationRecord[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interviewStartTime, setInterviewStartTime] = useState<number | null>(
    null
  );

  // Voice engine - clean and simple
  const voiceEngine = useSimpleVoiceEngine({
    avatar,
    onSpeechStart: () => console.log("🔊 Avatar started speaking"),
    onSpeechEnd: () => {
      console.log("🔇 Avatar finished speaking");
      // If we just asked a question, start listening
      if (isWaitingForAnswer) {
        console.log("👂 Now listening for answer...");
      }
    },
  });

  // Audio recorder
  const { toggleRecording, isRecording, isTranscribing } = useAudioRecorder(
    (transcript) => {
      console.log("🎤 Transcript received from recorder:", transcript);
      setTranscript(transcript);
    },
    (finalAnswer) => {
      console.log("🎯 Final answer from recorder:", finalAnswer);
      handleAnswerReceived(finalAnswer);
    },
    true
  );
  // Fetch campaign data
  useEffect(() => {
    if (!campaignId) {
      setInterviewState("error");
      return;
    }

    const fetchCampaign = async () => {
      try {
        const response = await fetch(`/api/outreach-campaigns/${campaignId}`);
        if (!response.ok) throw new Error("Failed to fetch campaign");

        const data = await response.json();
        setCampaign(data.campaign);

        // Once we have campaign data, we're ready (but need user to start)
        if (avatar && data.campaign) {
          setInterviewState("ready");
        }
      } catch (error) {
        console.error("Failed to fetch campaign:", error);
        setInterviewState("error");
      }
    };

    fetchCampaign();
  }, [campaignId, avatar]);

  // Handle avatar ready
  const handleAvatarReady = (head: any) => {
    console.log("✅ Avatar is ready");
    setAvatar(head);

    // If we already have campaign data, we're ready
    if (campaign) {
      setInterviewState("ready");
    }
  };

  // START INTERVIEW - this is the only complex part, but now it's clean
  const startInterview = async () => {
    if (!avatar || !campaign || !voiceEngine.isAvatarReady) {
      console.error("❌ Not ready to start interview");
      return;
    }

    try {
      console.log("🚀 Starting interview...");
      setInterviewState("loading"); // Show loading during setup

      // Step 1: Initialize audio (MUST be from user click)
      const audioReady = await voiceEngine.initializeAudio();
      if (!audioReady) {
        console.error("❌ Audio initialization failed");
        setInterviewState("error");
        return;
      }

      // Step 2: Create conversation record (with retry)
      let retries = 3;
      while (retries > 0) {
        try {
          await createConversationRecord();
          break;
        } catch (error) {
          retries--;
          if (retries === 0) throw error;
          console.log(
            `Retrying conversation creation... ${retries} attempts left`
          );
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Step 3: Start with greeting
      setInterviewState("active");
      setInterviewStartTime(Date.now());

      const greeting = `Hello! Welcome to your interview for the ${campaign.role} position at ${campaign.campaign_name}. I'll be asking you ${campaign.questions.length} questions. Let's begin with the first question.`;

      await voiceEngine.speakMessage(greeting);

      // Step 4: Ask first question
      await askCurrentQuestion();
    } catch (error) {
      console.error("❌ Failed to start interview:", error);
      setInterviewState("error");
    }
  };

  const askQuestionByIndex = async (questionIndex: number) => {
    if (!campaign || questionIndex >= campaign.questions.length) {
      await completeInterview();
      return;
    }

    const question = campaign.questions[questionIndex];
    console.log(`🤔 Asking question ${questionIndex + 1}: ${question}`);

    await voiceEngine.speakMessage(question);
    setIsWaitingForAnswer(true);
  };

  // Ask the current question
  const askCurrentQuestion = async () => {
    await askQuestionByIndex(currentQuestionIndex);
  };

  // Handle received answer
  async function handleAnswerReceived(answerText: string) {
    console.log("📥 handleAnswerReceived called with:", answerText);
    console.log("📊 Current state:", {
      isWaitingForAnswer,
      currentQuestionIndex,
      interviewState,
    });

    if (!answerText.trim()) {
      console.log("❌ Empty answer text, skipping");
      return;
    }

    if (!isWaitingForAnswer) {
      console.log("❌ Not waiting for answer, skipping");
      return;
    }

    console.log("✅ Processing answer:", answerText);
    setIsWaitingForAnswer(false);

    // Record the answer
    const currentQuestion = campaign!.questions[currentQuestionIndex];
    const newRecord: ConversationRecord = {
      question: currentQuestion,
      answer: answerText,
      timestamp: new Date(),
    };

    console.log("💾 Saving conversation record:", newRecord);
    setConversation((prev) => [...prev, newRecord]);

    try {
      await saveConversationMessage(currentQuestion, answerText);
      console.log("✅ Conversation saved to backend");
    } catch (error) {
      console.error("❌ Failed to save to backend:", error);
    }

    // Acknowledge and move to next question
    console.log("🗣️ Speaking acknowledgment...");
    await voiceEngine.speakMessage("Thank you for your answer.");

    // Calculate next question index
    const nextQuestionIndex = currentQuestionIndex + 1;
    console.log(`➡️ Moving to question ${nextQuestionIndex + 1}...`);

    // Update state
    setCurrentQuestionIndex(nextQuestionIndex);

    // Small delay then ask next question with explicit index
    setTimeout(async () => {
      console.log(`🤔 About to ask question ${nextQuestionIndex + 1}...`);
      await askQuestionByIndex(nextQuestionIndex);
    }, 1000);

    setTranscript(""); // Clear transcript
  }

  // Complete interview
  const completeInterview = async () => {
    try {
      // Update conversation status
      if (conversationId) {
        await fetch("/api/interview-conversations", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId,
            status: "completed",
            completedAt: new Date().toISOString(),
            questionsAnswered: conversation.length,
            metadata: {
              completed_at: new Date().toISOString(),
              total_duration: Date.now() - (interviewStartTime || Date.now()),
            },
          }),
        });
      }

      await voiceEngine.speakMessage(
        "Thank you for completing the interview! Your responses have been recorded and the recruiter will review them shortly. Have a great day!"
      );

      setInterviewState("completed");
    } catch (error) {
      console.error("Failed to complete interview:", error);
      // Still set to completed - don't let backend errors break UX
      setInterviewState("completed");
    }
  };

  // Backend operations
  const createQuestionRecords = async (convId: string) => {
    if (!campaign) return;

    try {
      // Create all questions upfront
      const promises = campaign.questions.map((question, index) =>
        fetch("/api/interview-conversations/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            conversationId: convId,
            questionIndex: index,
            question,
            metadata: { created_at: new Date().toISOString() },
          }),
        })
      );

      await Promise.all(promises);
      console.log("✅ All question records created");
    } catch (error) {
      console.error("Failed to create question records:", error);
      throw error;
    }
  };

  const createConversationRecord = async () => {
    if (!campaignId || !candidateId || !campaign) return;

    try {
      const response = await fetch("/api/interview-conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          candidateId,
          totalQuestions: campaign.questions.length,
          metadata: {
            role: campaign.role,
            campaignName: campaign.campaign_name,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      setConversationId(data.conversationId);

      // Pre-create all question records
      await createQuestionRecords(data.conversationId);
    } catch (error) {
      console.error("Failed to create conversation record:", error);
      throw error; // Re-throw to handle in startInterview
    }
  };

  const saveConversationMessage = async (question: string, answer: string) => {
    if (!conversationId) return;

    try {
      const response = await fetch("/api/interview-conversations/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId,
          questionIndex: currentQuestionIndex,
          question,
          answer,
          metadata: {
            answered_at: new Date().toISOString(),
            transcript_confidence: 1.0, // You can add this from your speech recognition
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save message: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ Message saved:", data);
    } catch (error) {
      console.error("Failed to save conversation message:", error);
      // Don't throw - we don't want to stop the interview flow for this
    }
  };

  // Error states
  if (!campaignId || !candidateId) {
    return (
      <ErrorScreen message="Invalid interview link - missing required parameters." />
    );
  }

  if (interviewState === "error") {
    return (
      <ErrorScreen message="Failed to load interview. Please refresh and try again." />
    );
  }

  if (!campaign) {
    return <LoadingScreen message="Loading interview..." />;
  }

  return (
    <div className="min-h-screen pt-16 ">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Interview Portal</h1>
          <p className="text-gray-300">
            {campaign.role} - {campaign.campaign_name}
          </p>

          {interviewState === "loading" && (
            <p className="text-sm text-blue-400 mt-2">
              Loading Avatar: {loadingProgress}%
            </p>
          )}
        </div>

        {/* Main Interview Area */}
        <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center">
            <div className="w-full max-w-md h-96 border border-gray-700 rounded-lg overflow-hidden bg-gray-800 shadow-2xl">
              <AvatarComponent
                onAvatarReady={handleAvatarReady}
                onLoadingProgress={setLoadingProgress}
                ttsProvider="lemonfox"
              />
            </div>

            {/* Controls */}
            <div className="mt-6 text-center space-y-4">
              {/* Start Button */}
              {interviewState === "ready" && (
                <button
                  onClick={startInterview}
                  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-lg text-lg transition-all"
                >
                  🚀 Start Interview
                </button>
              )}

              {/* Currently Speaking */}
              {voiceEngine.isSpeaking && (
                <div className="px-4 py-2 bg-blue-600 rounded-full text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    AI is speaking...
                  </div>
                </div>
              )}

              {/* Waiting for Answer */}
              {isWaitingForAnswer && !voiceEngine.isSpeaking && (
                <div className="space-y-3">
                  <div className="px-4 py-2 bg-green-600 rounded-full text-sm">
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                      Your turn to speak...
                    </div>
                  </div>

                  <button
                    onClick={toggleRecording}
                    className={`px-6 py-3 rounded-full font-semibold transition-all ${
                      isRecording
                        ? "bg-red-500 hover:bg-red-600 text-white"
                        : "bg-blue-500 hover:bg-blue-600 text-white"
                    }`}
                  >
                    {isRecording ? "🛑 Stop Recording" : "🎤 Start Recording"}
                  </button>
                </div>
              )}

              {/* Processing */}
              {isTranscribing && (
                <p className="text-sm text-gray-400 animate-pulse">
                  💭 Processing your response...
                </p>
              )}

              {/* Current Transcript */}
              {transcript && (
                <div className="mt-4 p-3 bg-gray-800 rounded-lg border border-gray-700">
                  <p className="text-sm text-gray-300">You said:</p>
                  <p className="text-white">{transcript}</p>
                </div>
              )}
            </div>
          </div>

          {/* Progress Section */}
          <div className="space-y-6">
            {/* Interview Status */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Interview Status</h3>

              {interviewState === "loading" && (
                <p className="text-gray-400">Preparing interview...</p>
              )}

              {interviewState === "ready" && (
                <p className="text-blue-400">
                  Ready to start! Click the button below.
                </p>
              )}

              {interviewState === "active" && (
                <div>
                  <p className="text-green-400 mb-2">
                    Question {currentQuestionIndex} of{" "}
                    {campaign.questions.length}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{
                        width: `${
                          (currentQuestionIndex / campaign.questions.length) *
                          100
                        }%`,
                      }}
                    ></div>
                  </div>
                </div>
              )}

              {interviewState === "completed" && (
                <div className="text-center">
                  <div className="text-green-400 text-4xl mb-2">✅</div>
                  <p className="text-green-400 font-semibold">
                    Interview Completed!
                  </p>
                  <p className="text-sm text-gray-300 mt-2">
                    Thank you for your time. Your responses have been recorded.
                  </p>
                </div>
              )}
            </div>

            {/* Current Question */}
            {interviewState === "active" &&
              campaign.questions[currentQuestionIndex] && (
                <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-700">
                  <h4 className="text-sm text-blue-400 mb-2">
                    Current Question:
                  </h4>
                  <p className="text-white font-medium">
                    {campaign.questions[currentQuestionIndex]}
                  </p>
                </div>
              )}

            {/* Conversation History */}
            {conversation.length > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-h-64 overflow-y-auto">
                <h4 className="text-sm text-gray-400 mb-3">
                  Completed Questions:
                </h4>
                <div className="space-y-3">
                  {conversation.map((record, index) => (
                    <div
                      key={index}
                      className="border-l-2 border-green-500 pl-3"
                    >
                      <p className="text-xs text-green-400 mb-1">
                        Q{index + 1}:
                      </p>
                      <p className="text-sm text-gray-300 mb-2">
                        {record.question}
                      </p>
                      <p className="text-xs text-gray-400">✓ Answered</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        {interviewState === "ready" && (
          <div className="max-w-2xl mx-auto mt-12 text-center">
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold mb-3">How This Works</h3>
              <div className="text-sm text-gray-300 space-y-2">
                <p>• The AI will ask you questions one by one</p>
                <p>• Listen carefully to each question</p>
                <p>• Click "Start Recording" to give your answer</p>
                <p>• Speak clearly and click "Stop Recording" when done</p>
                <p>• The AI will automatically move to the next question</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper components
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto mb-4"></div>
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  );
}

function ErrorScreen({ message }: { message: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-red-400 mb-4">Error</h1>
        <p className="text-gray-300">{message}</p>
      </div>
    </div>
  );
}
