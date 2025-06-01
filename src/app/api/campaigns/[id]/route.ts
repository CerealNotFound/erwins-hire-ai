// app/api/campaigns/[id]/route.ts
import { createClient } from "@/utils/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { id: campaignId } = await params;

  try {
    // Get campaign details
    const { data: campaign, error: campaignError } = await supabase
      .from("outreach_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (campaignError || !campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Get all interview conversations for this campaign with candidate details
    const { data: conversations, error: conversationsError } = await supabase
      .from("interview_conversations")
      .select(
        `
        *,
        candidates (
          id,
          full_name,
          email,
          skills,
          experience_years,
          title,
          about
        )
      `
      )
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false });

    if (conversationsError) {
      console.error("❌ Failed to fetch conversations:", conversationsError);
      return Response.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }

    // Get shortlisted candidates for this campaign
    // Note: This assumes you have a way to link campaigns to recruiter_queries
    // You might need to add a campaign_id to recruiter_results or create a junction table
    const { data: shortlistedCandidates, error: shortlistError } =
      await supabase
        .from("recruiter_results")
        .select(
          `
        *,
        candidates (
          id,
          full_name,
          email,
          skills,
          experience_years,
          title,
          about
        )
      `
        )
        .eq("shortlisted", true);
    // .eq("campaign_id", campaignId); // Add this when you have the relationship

    if (shortlistError) {
      console.error(
        "❌ Failed to fetch shortlisted candidates:",
        shortlistError
      );
    }

    // Calculate campaign statistics
    const totalShortlisted = shortlistedCandidates?.length || 0;
    const totalReached = conversations?.length || 0;
    const completedInterviews =
      conversations?.filter((c) => c.status === "completed").length || 0;
    const inProgressInterviews =
      conversations?.filter((c) => c.status === "in_progress").length || 0;
    const abandonedInterviews =
      conversations?.filter((c) => c.status === "abandoned").length || 0;

    // Group conversations by status for pipeline view
    const pipeline = {
      shortlisted: totalShortlisted,
      reached: totalReached,
      in_progress: inProgressInterviews,
      completed: completedInterviews,
      abandoned: abandonedInterviews,
    };

    // Calculate response rate and completion rate
    const responseRate =
      totalReached > 0 ? (completedInterviews / totalReached) * 100 : 0;
    const reachRate =
      totalShortlisted > 0 ? (totalReached / totalShortlisted) * 100 : 0;

    const campaignData = {
      ...campaign,
      pipeline,
      metrics: {
        response_rate: responseRate,
        reach_rate: reachRate,
        total_shortlisted: totalShortlisted,
        total_reached: totalReached,
        completed_interviews: completedInterviews,
      },
      conversations: conversations || [],
      shortlisted_candidates: shortlistedCandidates || [],
    };

    return Response.json({ campaign: campaignData });
  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const campaignId = await (await params).id;

  try {
    const body = await request.json();
    const allowedFields = [
      "campaign_name",
      "role",
      "description",
      "questions",
      "is_active",
    ];

    // Filter only allowed fields
    const updateData = Object.keys(body)
      .filter((key) => allowedFields.includes(key))
      .reduce((obj, key) => {
        obj[key] = body[key];
        return obj;
      }, {} as any);

    if (Object.keys(updateData).length === 0) {
      return Response.json(
        { error: "No valid fields to update" },
        { status: 400 }
      );
    }

    // Add updated_at timestamp
    updateData.updated_at = new Date().toISOString();

    const { data: campaign, error } = await supabase
      .from("outreach_campaigns")
      .update(updateData)
      .eq("id", campaignId)
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to update campaign:", error);
      return Response.json(
        { error: "Failed to update campaign" },
        { status: 500 }
      );
    }

    if (!campaign) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    return Response.json({ campaign });
  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const campaignId = await (await params).id;

  try {
    // Check if campaign exists and has any active conversations
    const { data: conversations } = await supabase
      .from("interview_conversations")
      .select("id, status")
      .eq("campaign_id", campaignId)
      .in("status", ["in_progress"]);

    if (conversations && conversations.length > 0) {
      return Response.json(
        {
          error:
            "Cannot delete campaign with active interviews. Archive instead.",
        },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("outreach_campaigns")
      .delete()
      .eq("id", campaignId);

    if (error) {
      console.error("❌ Failed to delete campaign:", error);
      return Response.json(
        { error: "Failed to delete campaign" },
        { status: 500 }
      );
    }

    return Response.json({ message: "Campaign deleted successfully" });
  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
