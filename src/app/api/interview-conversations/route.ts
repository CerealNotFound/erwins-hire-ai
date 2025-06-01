// app/api/interview-conversations/route.ts
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { campaignId, candidateId, totalQuestions = 0, metadata = {} } = body;

    if (!campaignId || !candidateId) {
      return Response.json(
        { error: "Missing required fields: campaignId, candidateId" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("interview_conversations")
      .insert([
        {
          campaign_id: campaignId,
          candidate_id: candidateId,
          total_questions: totalQuestions,
          metadata,
          status: 'in_progress'
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to create interview conversation:", error);
      return Response.json(
        { error: "Failed to create interview conversation" },
        { status: 500 }
      );
    }

    return Response.json({
      success: true,
      conversationId: data.id,
      conversation: data
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");
  const campaignId = searchParams.get("campaignId");
  const candidateId = searchParams.get("candidateId");

  const supabase = await createClient();

  try {
    let query = supabase
      .from("interview_conversations")
      .select(`
        *,
        interview_messages (
          id,
          question_index,
          question,
          answer,
          answer_timestamp,
          metadata
        )
      `);

    if (conversationId) {
      query = query.eq("id", conversationId);
    } else if (campaignId && candidateId) {
      query = query.eq("campaign_id", campaignId).eq("candidate_id", candidateId);
    } else {
      return Response.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }

    const { data, error } = await query.order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Failed to fetch conversations:", error);
      return Response.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }

    return Response.json({ conversations: data || [] });
  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { conversationId, status, completedAt, questionsAnswered, metadata } = body;

    if (!conversationId) {
      return Response.json(
        { error: "Missing conversationId" },
        { status: 400 }
      );
    }

    const updates: any = { updated_at: new Date().toISOString() };
    
    if (status) updates.status = status;
    if (completedAt) updates.completed_at = completedAt;
    if (questionsAnswered !== undefined) updates.questions_answered = questionsAnswered;
    if (metadata) updates.metadata = metadata;

    const { data, error } = await supabase
      .from("interview_conversations")
      .update(updates)
      .eq("id", conversationId)
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to update conversation:", error);
      return Response.json(
        { error: "Failed to update conversation" },
        { status: 500 }
      );
    }

    return Response.json({ success: true, conversation: data });
  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}