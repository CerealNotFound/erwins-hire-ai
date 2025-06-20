// pages/api/emails/selection.ts
import { createClient } from "@/utils/supabase/server";
import { sendBulkSelectionEmails } from "@/lib/brevo/selectionEmailService";

interface SelectionEmailRequest {
  candidate: {
    id: string;
    full_name: string;
    email: string;
  };
  campaign: {
    id: string;
    role: string;
    campaign_name: string;
    email_config?: {
      sender_email?: string;
      sender_name?: string;
    };
  };
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { emails } = await request.json();

    const emailPayload = emails.map((email: any) => ({
      candidate: email.candidate,
      campaign: email.campaign,
      email_config: {
        sender_email: user.email!,
        sender_name: user.user_metadata?.name,
      },
    }));

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return Response.json(
        { error: "emails array is required" },
        { status: 400 }
      );
    }

    // Send all emails
    console.log(emailPayload);
    const emailResults = await sendBulkSelectionEmails(emailPayload);

    // Only log successful emails to database
    const successfulEmails = emailResults
      .map((result, index) => ({ result, email: emails[index] }))
      .filter(({ result }) => result.success);

    if (successfulEmails.length > 0) {
      const emailActivities = successfulEmails.map(({ result, email }) => ({
        campaign_id: email.campaign.id,
        candidate_id: email.candidate.id,
        conversation_id: email.conversationId,
        email_type: "selection",
        recipient_email: email.candidate.email,
        status: "sent",
        brevo_message_id: result.messageId,
        error_message: null,
        sent_at: new Date().toISOString(),
      }));

      const { error: logError } = await supabase
        .from("email_activities")
        .insert(emailActivities);

      if (logError) {
        console.error("Failed to log email activities:", logError);
      }
    }

    const successCount = emailResults.filter((r) => r.success).length;

    return Response.json({
      message: "Selection emails processed",
      total: emails.length,
      successful: successCount,
      failed: emails.length - successCount,
      results: emailResults,
    });
  } catch (error) {
    console.error("Selection email API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
