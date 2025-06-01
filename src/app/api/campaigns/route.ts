// app/api/campaigns/route.ts
import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const includeArchived = searchParams.get("include_archived") === "true";
  
  const supabase = await createClient();

  try {
    // Build the base query
    let campaignsQuery = supabase
      .from("outreach_campaigns")
      .select("*")
      .order("created_at", { ascending: false });

    // Filter by active status if not including archived
    if (!includeArchived) {
      campaignsQuery = campaignsQuery.eq("is_active", true);
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery;

    if (campaignsError) {
      console.error("❌ Failed to fetch campaigns:", campaignsError);
      return Response.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    // Get aggregated stats for each campaign
    const campaignsWithStats = await Promise.all(
      campaigns.map(async (campaign) => {
        // Get interview conversations for this campaign
        const { data: conversations } = await supabase
          .from("interview_conversations")
          .select("id, status, candidate_id")
          .eq("campaign_id", campaign.id);

        // Get unique candidates for this campaign (from shortlisted results)
        // Note: You'll need to connect campaigns to recruiter_queries somehow
        // For now, we'll use the conversations to count unique candidates
        const uniqueCandidates = new Set(conversations?.map(c => c.candidate_id) || []);
        const total_candidates = uniqueCandidates.size;
        
        const interviews_started = conversations?.length || 0;
        const interviews_completed = conversations?.filter(c => c.status === "completed").length || 0;
        
        const response_rate = interviews_started > 0 
          ? (interviews_completed / interviews_started) * 100 
          : 0;

        return {
          ...campaign,
          total_candidates,
          interviews_started,
          interviews_completed,
          response_rate
        };
      })
    );

    return Response.json({ campaigns: campaignsWithStats });

  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const body = await request.json();
    const { campaign_name, role, description, questions } = body;

    // Validate required fields
    if (!campaign_name || !role || !questions || !Array.isArray(questions)) {
      return Response.json(
        { error: "Missing required fields: campaign_name, role, questions" },
        { status: 400 }
      );
    }

    if (questions.length === 0) {
      return Response.json(
        { error: "At least one question is required" },
        { status: 400 }
      );
    }

    // Get current user (you'll need to implement user session handling)
    // For now, we'll assume recruiter_id is passed or use a default
    // const { data: { user } } = await supabase.auth.getUser();
    // const recruiter_id = user?.id;

    const { data: campaign, error } = await supabase
      .from("outreach_campaigns")
      .insert({
        campaign_name,
        role,
        description: description || null,
        questions,
        // recruiter_id, // Add when you have user session
      })
      .select()
      .single();

    if (error) {
      console.error("❌ Failed to create campaign:", error);
      return Response.json({ error: "Failed to create campaign" }, { status: 500 });
    }

    return Response.json({ campaign }, { status: 201 });

  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}