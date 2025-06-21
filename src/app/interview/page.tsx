"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import AvatarComponent from "@/components/modules/talking-avatar/ai-avatar";
import { useSimpleVoiceEngine } from "@/components/modules/talking-avatar/voice-engine";
import { useAudioRecorder } from "@/hooks/chat-input/useAudioRecorder";

interface InterviewMessage {
  id: string;
  question_index: number;
  question: string;
  answer: string | null;
  answer_timestamp: string | null;
}

interface ConversationData {
  id: string;
  campaign_id: string;
  candidate_id: string;
  total_questions: number;
  questions_answered: number;
  status: string;
  metadata: {
    role?: string;
    campaignName?: string;
  };
  messages: InterviewMessage[];
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
  const conversationId = searchParams.get("conversationId");

  // Core state
  const [avatar, setAvatar] = useState<any>(null);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [conversationData, setConversationData] =
    useState<ConversationData | null>(null);

  // Interview flow
  const [interviewState, setInterviewState] =
    useState<InterviewState>("loading");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isWaitingForAnswer, setIsWaitingForAnswer] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interviewStartTime, setInterviewStartTime] = useState<number | null>(
    null
  );

  // Voice engine
  const voiceEngine = useSimpleVoiceEngine({
    avatar,
    onSpeechStart: () => console.log("🔊 Avatar started speaking"),
    onSpeechEnd: () => {
      console.log("🔇 Avatar finished speaking");
      if (isWaitingForAnswer) {
        console.log("👂 Now listening for answer...");
      }
    },
  });

  // Audio recorder
  const { toggleRecording, isRecording, isTranscribing } = useAudioRecorder(
    (transcript) => {
      console.log("🎤 Transcript received:", transcript);
      setTranscript(transcript);
    },
    (finalAnswer) => {
      console.log("🎯 Final answer received:", finalAnswer);
      handleAnswerReceived(finalAnswer);
    },
    true
  );

  // Load conversation data - FIXED: Single API call
  useEffect(() => {
    if (!conversationId) {
      setInterviewState("error");
      return;
    }

    const loadConversationData = async () => {
      try {
        // Single API call that gets everything we need
        const response = await fetch(
          `/api/interview-conversations?conversationId=${conversationId}`
        );
        if (!response.ok) throw new Error("Failed to fetch conversation");

        const data = await response.json();
        console.log("📥 Conversation data loaded:", data);

        // Extract the conversation from the response
        const conversation = data.conversations?.[0];
        if (!conversation) {
          throw new Error("Conversation not found");
        }

        // Transform the data to match our interface
        const fullData: ConversationData = {
          id: conversation.id,
          campaign_id: conversation.campaign_id,
          candidate_id: conversation.candidate_id,
          total_questions: conversation.total_questions,
          questions_answered: conversation.questions_answered,
          status: conversation.status,
          metadata: {
            role: conversation.metadata?.role,
            campaignName: conversation.metadata?.campaignName,
          },
          // Map interview_messages to our messages format
          messages:
            conversation.interview_messages?.map((msg: any) => ({
              id: msg.id,
              question_index: msg.question_index,
              question: msg.question,
              answer: msg.answer,
              answer_timestamp: msg.answer_timestamp,
            })) || [],
        };

        setConversationData(fullData);

        // Find the first unanswered question
        const unansweredIndex = fullData.messages.findIndex(
          (msg) => !msg.answer
        );

        if (unansweredIndex === -1) {
          // All questions answered - interview is completed
          setInterviewState("completed");
        } else {
          setCurrentQuestionIndex(unansweredIndex);
          // If we have avatar, we're ready to start
          if (avatar) {
            setInterviewState("ready");
          }
        }
      } catch (error) {
        console.error("❌ Failed to load conversation:", error);
        setInterviewState("error");
      }
    };

    loadConversationData();
  }, [conversationId, avatar]);

  // Handle avatar ready
  const handleAvatarReady = (head: any) => {
    console.log("✅ Avatar is ready");
    setAvatar(head);

    // If we already have conversation data and it's not completed, we're ready
    if (conversationData && conversationData.status !== "completed") {
      setInterviewState("ready");
    }
  };

  // Start interview
  const startInterview = async () => {
    if (!avatar || !conversationData || !voiceEngine.isAvatarReady) {
      console.error("❌ Not ready to start interview");
      return;
    }

    try {
      console.log("🚀 Starting interview...");
      setInterviewState("loading");

      // Initialize audio
      const audioReady = await voiceEngine.initializeAudio();
      if (!audioReady) {
        console.error("❌ Audio initialization failed");
        setInterviewState("error");
        return;
      }

      setInterviewState("active");
      setInterviewStartTime(Date.now());

      await fetch(`/api/interview-conversations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId,
          status: "in_progress",
          started_at: new Date().toISOString(),
        }),
      });

      // Greeting
      const role = conversationData.metadata?.role || "this position";
      const campaignName =
        conversationData.metadata?.campaignName || "the company";
      const totalQuestions = conversationData.total_questions;
      const questionsRemaining = conversationData.messages.filter(
        (msg) => !msg.answer
      ).length;

      const greeting = `Hello! Welcome to your interview for the ${role} position at ${campaignName}. I'll be asking you ${questionsRemaining} questions. Let's begin with the first question.`;

      await voiceEngine.speakMessage(greeting);
      await askCurrentQuestion();
    } catch (error) {
      console.error("❌ Failed to start interview:", error);
      setInterviewState("error");
    }
  };

  // Add this helper function (copy from your second file)
  const askQuestionByIndex = async (questionIndex: number) => {
    if (
      !conversationData ||
      questionIndex >= conversationData.messages.length
    ) {
      await completeInterview();
      return;
    }

    const currentMessage = conversationData.messages[questionIndex];
    if (currentMessage.answer) {
      // This question is already answered, find the next unanswered one
      const nextIndex = conversationData.messages.findIndex(
        (msg, index) => index > questionIndex && !msg.answer
      );
      if (nextIndex === -1) {
        await completeInterview();
        return;
      }
      // Recursively call with the next unanswered question
      return askQuestionByIndex(nextIndex);
    }

    console.log(
      `🤔 Asking question ${questionIndex + 1}: ${currentMessage.question}`
    );
    await voiceEngine.speakMessage(currentMessage.question);
    setIsWaitingForAnswer(true);
  };

  // Ask current question
  const askCurrentQuestion = async () => {
    if (
      !conversationData ||
      currentQuestionIndex >= conversationData.messages.length
    ) {
      await completeInterview();
      return;
    }

    const currentMessage = conversationData.messages[currentQuestionIndex];
    if (currentMessage.answer) {
      // This question is already answered, skip to next
      const nextIndex = conversationData.messages.findIndex(
        (msg) => !msg.answer
      );
      if (nextIndex === -1) {
        await completeInterview();
        return;
      }
      setTimeout(() => {
        setCurrentQuestionIndex(nextIndex);
      }, 0);
      return askCurrentQuestion();
    }

    console.log(
      `🤔 Asking question ${currentQuestionIndex + 1}: ${
        currentMessage.question
      }`
    );
    await voiceEngine.speakMessage(currentMessage.question);
    setIsWaitingForAnswer(true);
  };

  // 🔧 FIXED VERSION of handleAnswerReceived function
  const handleAnswerReceived = async (answerText: string) => {
    console.log("📥 Processing answer:", answerText);

    if (!answerText.trim() || !isWaitingForAnswer || !conversationData) {
      return;
    }

    // 🚨 CRITICAL: Set this to false FIRST to prevent race conditions
    setIsWaitingForAnswer(false);

    const currentMessage = conversationData.messages[currentQuestionIndex];

    try {
      // Save answer to backend
      await fetch("/api/interview-conversations/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId,
          questionIndex: currentMessage.question_index,
          question: currentMessage.question,
          answer: answerText,
          metadata: {
            answered_at: new Date().toISOString(),
          },
        }),
      });

      // Update local state
      const updatedMessages = [...conversationData.messages];
      updatedMessages[currentQuestionIndex] = {
        ...currentMessage,
        answer: answerText,
        answer_timestamp: new Date().toISOString(),
      };

      const updatedConversationData = {
        ...conversationData,
        messages: updatedMessages,
        questions_answered: conversationData.questions_answered + 1,
      };

      setConversationData(updatedConversationData);
      console.log("✅ Answer saved");

      // Acknowledge the answer
      await voiceEngine.speakMessage("Thank you for your answer.");

      // 🎯 FIXED: Calculate next question index and handle completion
      const nextQuestionIndex = currentQuestionIndex + 1;

      if (nextQuestionIndex >= conversationData.messages.length) {
        // No more questions - complete the interview
        console.log("🏁 All questions completed, finishing interview...");
        await completeInterview();
        return;
      }

      // Update to next question
      setCurrentQuestionIndex(nextQuestionIndex);

      // 🔥 KEY FIX: Add a small delay and then ask next question
      // This ensures the acknowledgment finishes before starting next question
      setTimeout(async () => {
        console.log(`🚀 Moving to question ${nextQuestionIndex + 1}`);

        const nextMessage = conversationData.messages[nextQuestionIndex];
        if (nextMessage && !nextMessage.answer) {
          console.log(
            `🤔 Asking question ${nextQuestionIndex + 1}: ${
              nextMessage.question
            }`
          );
          await voiceEngine.speakMessage(nextMessage.question);
          setIsWaitingForAnswer(true); // Now we're ready for the next answer
        } else {
          // This shouldn't happen, but if it does, complete the interview
          console.log(
            "❓ Next question already answered or missing, completing interview"
          );
          await completeInterview();
        }
      }, 1500); // Give 1.5 seconds for "Thank you" to finish
    } catch (error) {
      console.error("❌ Failed to save answer:", error);
      // Even if save fails, try to continue
      setIsWaitingForAnswer(true);
    }

    setTranscript(""); // Clear transcript
  };
  
  // Complete interview
  const completeInterview = async () => {
    try {
      await fetch(`/api/interview-conversations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: conversationId,
          status: "completed",
          started_at: new Date().toISOString(),
        }),
      });

      await voiceEngine.speakMessage(
        "Thank you for completing the interview! Your responses have been recorded and the recruiter will review them shortly. Have a great day!"
      );

      setInterviewState("completed");
    } catch (error) {
      console.error("Failed to complete interview:", error);
      setInterviewState("completed"); // Still mark as completed
    }
  };

  // Error handling
  if (!conversationId) {
    return (
      <ErrorScreen message="Invalid interview link - missing conversation ID." />
    );
  }

  if (interviewState === "error") {
    return (
      <ErrorScreen message="Failed to load interview. Please refresh and try again." />
    );
  }

  if (!conversationData) {
    return <LoadingScreen message="Loading interview..." />;
  }

  // Calculate progress
  const answeredQuestions = conversationData.messages.filter(
    (msg) => msg.answer
  ).length;
  const totalQuestions = conversationData.total_questions;
  const progressPercentage = (answeredQuestions / totalQuestions) * 100;

  return (
    <div className="min-h-screen pt-16">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">AI Interview Portal</h1>
          <p className="text-gray-300">
            {conversationData.metadata?.role || "Interview"} -{" "}
            {conversationData.metadata?.campaignName || "Position"}
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

              {/* Speaking Indicator */}
              {voiceEngine.isSpeaking && (
                <div className="px-4 py-2 bg-blue-600 rounded-full text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                    AI is speaking...
                  </div>
                </div>
              )}

              {/* Recording Controls */}
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
                    Question {answeredQuestions} of {totalQuestions}
                  </p>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
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
              conversationData.messages[currentQuestionIndex] && (
                <div className="bg-blue-900/30 rounded-lg p-6 border border-blue-700">
                  <h4 className="text-sm text-blue-400 mb-2">
                    Current Question:
                  </h4>
                  <p className="text-white font-medium">
                    {conversationData.messages[currentQuestionIndex].question}
                  </p>
                </div>
              )}

            {/* Answered Questions */}
            {answeredQuestions > 0 && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-h-64 overflow-y-auto">
                <h4 className="text-sm text-gray-400 mb-3">
                  Completed Questions:
                </h4>
                <div className="space-y-3">
                  {conversationData.messages
                    .filter((msg) => msg.answer)
                    .map((message, index) => (
                      <div
                        key={message.id}
                        className="border-l-2 border-green-500 pl-3"
                      >
                        <p className="text-xs text-green-400 mb-1">
                          Q{message.question_index + 1}:
                        </p>
                        <p className="text-sm text-gray-300 mb-2">
                          {message.question}
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
