import { createClient } from "@/utils/supabase/server";
import {
  generateQuestionsForCandidate,
  apiManager,
} from "@/engine/generateQuestions/geminiGenerateQuestions";
import { sendOutreachEmail, EmailResult } from "@/lib/brevo/emailService";

interface ProcessingResult {
  success: boolean;
  candidateId: string;
  candidateName: string;
  conversationId?: string;
  questionCount?: number;
  emailSent?: boolean;
  emailResult?: EmailResult;
  error?: string;
  processingTime?: number;
}

interface Candidate {
  id: string;
  full_name: string;
  email: string; // Added for email sending
  about: string;
  projects?: Array<{
    project_name: string;
    description: string;
    technologies: string[];
  }>;
  skills: string[];
  matching_skills?: string[]; // Skills that match the campaign
  experience_years: number;
}

interface Campaign {
  id: string;
  role: string;
  campaign_name: string; // Added for email
  description: string; // Added for email
  technical_config: {
    level_1: number;
    level_2: number;
    level_3: number;
    level_4: number;
    level_5: number;
  };
  questions: string[]; // Culture questions
  email_config?: {
    sender_email?: string;
    sender_name?: string;
    send_emails: boolean; // Flag to control email sending
  };
}

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const {
      campaignId,
      candidates,
      sendEmails = false, // Optional flag to control email sending
    }: {
      campaignId: string;
      candidates: Candidate[];
      sendEmails?: boolean;
    } = body;

    if (!campaignId || !candidates || !Array.isArray(candidates)) {
      return Response.json(
        { error: "Missing required fields: campaignId, candidates (array)" },
        { status: 400 }
      );
    }

    // 🔥 Get authenticated user details for email sending
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json(
        { error: "Authentication required", details: userError?.message },
        { status: 401 }
      );
    }

    console.log(
      `🔐 Authenticated user: ${user.email} (${
        user.user_metadata?.name || "Unknown"
      })`
    );

    console.log(
      `🚀 Processing ${candidates.length} candidates for campaign ${campaignId}`
    );
    console.log(`📧 Email sending: ${sendEmails ? "ENABLED" : "DISABLED"}`);
    console.log("📊 Initial API Usage:", apiManager.getUsageStats());

    // Get campaign details once
    const { data: campaign, error: campaignError } = await supabase
      .from("outreach_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return Response.json(
        { error: "Campaign not found", details: campaignError?.message },
        { status: 404 }
      );
    }

    const senderDetails = {
      email: user.email!,
      name: user.user_metadata?.name,
    };

    console.log(
      `📧 Email sending: ENABLED (Sender: ${senderDetails.name} <${senderDetails.email}>)`
    );
    const candidatesWithEmail = candidates.filter((c) => c.email).length;
    console.log(
      `📧 Candidates with emails: ${candidatesWithEmail}/${candidates.length}`
    );

    // Validate email requirements if sending emails
    if (sendEmails) {
      const missingEmailCandidates = candidates.filter((c) => !c.email);
      if (missingEmailCandidates.length > 0) {
        console.warn(
          `⚠️ ${missingEmailCandidates.length} candidates missing email addresses`
        );
      }
    }

    const startTime = Date.now();

    // Process with optimized batching
    const results = await processWithParallelKeys(
      candidates,
      (candidate) =>
        processCompleteCandidate(
          candidate,
          campaign as Campaign,
          supabase,
          senderDetails
        ),
      60
    );

    const processingTime = Date.now() - startTime;
    const successes = results.filter((r) => r.success).length;
    const failures = results.filter((r) => !r.success).length;
    const emailsSent = results.filter((r) => r.emailSent).length;

    console.log(`🎉 Bulk processing completed in ${processingTime}ms`);
    console.log(`📧 Emails sent: ${emailsSent}/${candidates.length}`);
    console.log("📊 Final API Usage:", apiManager.getUsageStats());

    return Response.json({
      success: true,
      processed: candidates.length,
      successes,
      failures,
      emailsSent,
      processingTimeMs: processingTime,
      throughputPerMinute: Math.round(
        (candidates.length / processingTime) * 60000
      ),
      results: results.map((r) => ({
        candidateId: r.candidateId,
        candidateName: r.candidateName,
        success: r.success,
        conversationId: r.conversationId,
        questionCount: r.questionCount,
        emailSent: r.emailSent,
        emailResult: r.emailResult,
        processingTime: r.processingTime,
        error: r.error,
      })),
    });
  } catch (error: any) {
    console.error("❌ Bulk outreach failed:", error);
    return Response.json(
      { error: "Bulk outreach failed", details: error.message },
      { status: 500 }
    );
  }
}

// Enhanced candidate processing with email integration
async function processCompleteCandidate(
  candidate: Candidate,
  campaign: Campaign,
  supabase: any,
  senderDetails: { email: string; name: string }
): Promise<ProcessingResult> {
  const startTime = Date.now();

  try {
    console.log(`📝 Processing ${candidate.full_name}...`);

    // Step 1: Create conversation
    const { data: conversation, error: convError } = await supabase
      .from("interview_conversations")
      .insert([
        {
          campaign_id: campaign.id,
          candidate_id: candidate.id,
          total_questions: 0,
          metadata: {
            candidate_name: candidate.full_name,
            role: campaign.role,
            processing_timestamp: new Date().toISOString(),
          },
          status: "in_progress",
        },
      ])
      .select()
      .single();

    if (convError)
      throw new Error(`Failed to create conversation: ${convError.message}`);

    // Step 2: Generate questions
    const questionRequest = {
      role: campaign.role,
      candidateProfile: {
        name: candidate.full_name,
        resume: candidate.about,
        projects: candidate.projects?.map(
          (p: any) =>
            `${p.project_name}: ${p.description} (Tech: ${p.technologies.join(
              ", "
            )})`
        ),
        skills: candidate.skills,
        experience_years: candidate.experience_years,
      },
      assessmentConfig: {
        difficulty_levels: {
          level_1: { count: campaign.technical_config.level_1 },
          level_2: { count: campaign.technical_config.level_2 },
          level_3: { count: campaign.technical_config.level_3 },
          level_4: { count: campaign.technical_config.level_4 },
          level_5: { count: campaign.technical_config.level_5 },
        },
        culture_questions: campaign.questions,
      },
    };

    const generatedQuestions = await generateQuestionsForCandidate(
      questionRequest
    );
    console.log(
      `🧠 Generated ${generatedQuestions.total_questions} questions for ${candidate.full_name}`
    );

    // Step 3: Store questions
    const messageInserts = generatedQuestions.questions.map(
      (question: any, index: number) => ({
        conversation_id: conversation.id,
        question_index: index,
        question: question.question,
        answer: null,
        metadata: {
          question_id: question.id,
          difficulty_level: question.difficulty_level,
          category: question.category,
          expected_focus: question.expected_focus,
          candidate_name: candidate.full_name,
          campaign_role: campaign.role,
          generated_at: new Date().toISOString(),
        },
      })
    );

    const { error: messageError } = await supabase
      .from("interview_messages")
      .insert(messageInserts);

    if (messageError)
      throw new Error(`Failed to store questions: ${messageError.message}`);

    // Step 4: Update conversation
    const { error: updateError } = await supabase
      .from("interview_conversations")
      .update({
        total_questions: generatedQuestions.total_questions,
        metadata: {
          candidate_name: candidate.full_name,
          role: campaign.role,
          questions_generated_at: new Date().toISOString(),
          status: "ready_for_interview",
        },
      })
      .eq("id", conversation.id);

    if (updateError) {
      console.warn(
        `Failed to update conversation metadata: ${updateError.message}`
      );
    }

    // Step 5: Enhanced email sending with better error handling
    let emailResult: EmailResult | undefined;
    let emailSent = false;

    // 🔥 IMPROVED: Email always enabled, just check if candidate has email
    const shouldSendEmail =
      candidate.email && candidate.email.trim().length > 0;

    if (shouldSendEmail) {
      try {
        console.log(
          `📧 Attempting to send email to ${candidate.full_name} (${candidate.email})`
        );
        console.log(
          `📧 Sender: ${senderDetails.name} <${senderDetails.email}>`
        );

        // Validate environment variables
        if (!process.env.BREVO_API_KEY) {
          throw new Error("BREVO_API_KEY not configured");
        }

        // Generate interview link with error handling
        const baseUrl =
          // process.env.NEXT_PUBLIC_BASE_URL ||
          process.env.VERCEL_URL || "http://localhost:3000";
        const interviewLink = `https://erwins-hire-ai.vercel.app/interview?conversationId=${conversation.id}`;

        console.log(`📧 Interview link: ${interviewLink}`);

        // 🔥 NEW: Enhanced email params with user details
        emailResult = await sendOutreachEmail({
          candidate,
          campaign: {
            ...campaign,
            email_config: {
              sender_email: senderDetails.email,
              sender_name: senderDetails.name,
            },
          },
          interviewLink,
          conversationId: conversation.id,
        });

        emailSent = emailResult.success;

        console.log(`📧 Email result for ${candidate.full_name}:`, {
          success: emailResult.success,
          messageId: emailResult.messageId,
          error: emailResult.error,
        });

        // 🔥 CRITICAL: Always log email activity, even failures
        try {
          const { error: logError } = await supabase
            .from("email_activities")
            .insert([
              {
                campaign_id: campaign.id,
                candidate_id: candidate.id,
                conversation_id: conversation.id,
                email_type: "outreach",
                recipient_email: candidate.email, // 🔥 FIX: This was missing!
                status: emailResult.success ? "sent" : "failed",
                brevo_message_id: emailResult.messageId || null,
                error_message: emailResult.error || null,
                sent_at: new Date().toISOString(),
              },
            ]);

          if (logError) {
            console.error(`🔥 Failed to log email activity:`, logError);
            // Don't throw - we still want to return success for the main processing
          } else {
            console.log(`📝 Email activity logged for ${candidate.full_name}`);
          }
        } catch (dbError) {
          console.error(`🔥 Database error logging email activity:`, dbError);
        }
      } catch (emailError: any) {
        console.error(
          `📧 Email failed for ${candidate.full_name}:`,
          emailError
        );
        emailResult = {
          success: false,
          error: emailError.message,
        };

        // 🔥 CRITICAL: Log failed attempts too
        try {
          await supabase.from("email_activities").insert([
            {
              campaign_id: campaign.id,
              candidate_id: candidate.id,
              conversation_id: conversation.id,
              email_type: "outreach",
              recipient_email: candidate.email, // 🔥 FIX: Add this here too!
              status: "failed",
              error_message: emailError.message,
              sent_at: new Date().toISOString(),
              // 🔥 REMOVED: metadata field
            },
          ]);
        } catch (dbError) {
          console.error(`🔥 Failed to log email failure:`, dbError);
        }
      }
    } else {
      // Log why email wasn't sent
      const reason = !candidate.email
        ? "No email address"
        : "Invalid email format";
      console.log(`📧 Skipping email for ${candidate.full_name}: ${reason}`);
    }

    const processingTime = Date.now() - startTime;
    console.log(
      `✅ Successfully processed ${
        candidate.full_name
      } in ${processingTime}ms (Email: ${emailSent ? "SENT" : "NOT SENT"})`
    );

    return {
      success: true,
      candidateId: candidate.id,
      candidateName: candidate.full_name,
      conversationId: conversation.id,
      questionCount: generatedQuestions.total_questions,
      emailSent,
      emailResult,
      processingTime,
    };
  } catch (error: any) {
    const processingTime = Date.now() - startTime;
    console.error(
      `❌ Failed processing ${candidate.full_name} after ${processingTime}ms:`,
      error
    );
    return {
      success: false,
      candidateId: candidate.id,
      candidateName: candidate.full_name,
      error: error.message,
      processingTime,
    };
  }
}

// Keep the existing parallel processing function unchanged
async function processWithParallelKeys<T>(
  items: T[],
  processor: (item: T) => Promise<ProcessingResult>,
  maxThroughputPerMinute: number = 60
): Promise<ProcessingResult[]> {
  const results: ProcessingResult[] = [];
  const totalItems = items.length;

  const batchSize = Math.min(maxThroughputPerMinute, totalItems);
  const batchCount = Math.ceil(totalItems / batchSize);

  console.log(
    `🔥 Processing ${totalItems} items in ${batchCount} batches of up to ${batchSize} items`
  );

  for (let i = 0; i < totalItems; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;

    console.log(
      `🚀 Batch ${batchNumber}/${batchCount}: Processing ${batch.length} items`
    );

    const batchStartTime = Date.now();

    const batchPromises = batch.map(async (item, index) => {
      const itemStartTime = Date.now();
      try {
        const result = await processor(item);
        return {
          ...result,
          processingTime: Date.now() - itemStartTime,
        };
      } catch (error: any) {
        const failedItem = item as any;
        return {
          success: false,
          candidateId: failedItem?.id || "unknown",
          candidateName: failedItem?.full_name || "unknown",
          error: error.message || "Processing failed",
          processingTime: Date.now() - itemStartTime,
        };
      }
    });

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    const batchTime = Date.now() - batchStartTime;
    const successCount = batchResults.filter((r) => r.success).length;

    console.log(
      `✅ Batch ${batchNumber} completed in ${batchTime}ms: ${successCount}/${batch.length} successful`
    );

    if (i + batchSize < totalItems) {
      console.log("⏸️  Brief pause between batches...");
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  return results;
}
