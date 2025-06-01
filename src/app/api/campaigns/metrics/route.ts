// app/api/campaigns/metrics/route.ts
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();

  try {
    // Get basic campaign stats
    const { data: campaigns, error: campaignsError } = await supabase
      .from("outreach_campaigns")
      .select("id, is_active");

    if (campaignsError) {
      console.error("❌ Failed to fetch campaigns:", campaignsError);
      return Response.json({ error: "Failed to fetch campaigns" }, { status: 500 });
    }

    // Get interview conversation stats
    const { data: conversations, error: conversationsError } = await supabase
      .from("interview_conversations")
      .select(`
        id,
        status,
        campaign_id,
        candidate_id
      `);

    if (conversationsError) {
      console.error("❌ Failed to fetch conversations:", conversationsError);
      return Response.json({ error: "Failed to fetch conversations" }, { status: 500 });
    }

    // Get shortlisted candidates count (total candidates reached)
    const { data: recruiterResults, error: resultsError } = await supabase
      .from("recruiter_results")
      .select("id, shortlisted")
      .eq("shortlisted", true);

    if (resultsError) {
      console.error("❌ Failed to fetch recruiter results:", resultsError);
      return Response.json({ error: "Failed to fetch results" }, { status: 500 });
    }

    // Calculate metrics
    const totalCampaigns = campaigns?.length || 0;
    const activeCampaigns = campaigns?.filter(c => c.is_active).length || 0;
    const totalCandidatesReached = recruiterResults?.length || 0;
    const totalInterviews = conversations?.length || 0;
    const completedInterviews = conversations?.filter(c => c.status === "completed").length || 0;
    
    // Calculate average response rate
    const campaignStats = new Map();
    
    // Group conversations by campaign
    conversations?.forEach(conv => {
      if (!campaignStats.has(conv.campaign_id)) {
        campaignStats.set(conv.campaign_id, {
          total: 0,
          completed: 0
        });
      }
      const stats = campaignStats.get(conv.campaign_id);
      stats.total++;
      if (conv.status === "completed") {
        stats.completed++;
      }
    });

    // Calculate response rates for each campaign
    const responseRates: number[] = [];
    campaignStats.forEach(stats => {
      if (stats.total > 0) {
        responseRates.push((stats.completed / stats.total) * 100);
      }
    });

    const averageResponseRate = responseRates.length > 0 
      ? responseRates.reduce((sum, rate) => sum + rate, 0) / responseRates.length 
      : 0;

    const metrics = {
      totalCampaigns,
      activeCampaigns,
      totalCandidatesReached,
      totalInterviews,
      completedInterviews,
      averageResponseRate
    };

    return Response.json(metrics);

  } catch (err) {
    console.error("❌ Server error:", err);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}