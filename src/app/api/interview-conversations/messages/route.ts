// app/api/interview-conversations/messages/route.ts
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  const supabase = await createClient();

  try {
    const body = await req.json();
    const { 
      conversationId, 
      questionIndex, 
      question, 
      answer, 
      metadata = {} 
    } = body;

    if (!conversationId || questionIndex === undefined || !question) {
      return Response.json(
        { error: "Missing required fields: conversationId, questionIndex, question" },
        { status: 400 }
      );
    }

    // First, check if this question already exists
    const { data: existingMessage } = await supabase
      .from("interview_messages")
      .select("id")
      .eq("conversation_id", conversationId)
      .eq("question_index", questionIndex)
      .single();

    let result;

    if (existingMessage) {
      // Update existing message with answer
      const { data, error } = await supabase
        .from("interview_messages")
        .update({
          answer,
          answer_timestamp: answer ? new Date().toISOString() : null,
          metadata
        })
        .eq("id", existingMessage.id)
        .select()
        .single();

      if (error) {
        console.error("❌ Failed to update interview message:", error);
        return Response.json(
          { error: "Failed to update interview message" },
          { status: 500 }
        );
      }
      result = data;
    } else {
      // Create new message
      const { data, error } = await supabase
        .from("interview_messages")
        .insert([
          {
            conversation_id: conversationId,
            question_index: questionIndex,
            question,
            answer,
            answer_timestamp: answer ? new Date().toISOString() : null,
            metadata
          },
        ])
        .select()
        .single();

      if (error) {
        console.error("❌ Failed to create interview message:", error);
        return Response.json(
          { error: "Failed to create interview message" },
          { status: 500 }
        );
      }
      result = data;
    }

    // If answer was provided, update the conversation's questions_answered count
    if (answer) {
      const { data: messages } = await supabase
        .from("interview_messages")
        .select("id")
        .eq("conversation_id", conversationId)
        .not("answer", "is", null);

      const questionsAnswered = messages?.length || 0;

      await supabase
        .from("interview_conversations")
        .update({ 
          questions_answered: questionsAnswered,
          updated_at: new Date().toISOString()
        })
        .eq("id", conversationId);
    }

    return Response.json({
      success: true,
      message: result
    });
  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const conversationId = searchParams.get("conversationId");

  if (!conversationId) {
    return Response.json(
      { error: "Missing conversationId parameter" },
      { status: 400 }
    );
  }

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("interview_messages")
      .select("*")
      .eq("conversation_id", conversationId)
      .order("question_index", { ascending: true });

    if (error) {
      console.error("❌ Failed to fetch interview messages:", error);
      return Response.json(
        { error: "Failed to fetch interview messages" },
        { status: 500 }
      );
    }

    return Response.json({ messages: data || [] });
  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}