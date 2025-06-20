import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// API Route: /api/campaigns/rankings (POST)
export async function POST(request: Request) {
  const supabase = await createClient();

  try {
    const { campaignId } = await request.json();

    if (!campaignId || typeof campaignId !== "string") {
      return NextResponse.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    // Fetch rankings with candidate data joined
    const { data: rankings, error } = await supabase
      .from("candidate_rankings")
      .select(
        `
        *,
        candidate:candidates (
          id,
          full_name,
          title
        )
      `
      )
      .eq("campaign_id", campaignId)
      .order("rank_position", { ascending: true });

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        {
          error: "Failed to fetch rankings",
        },
        {
          status: 500,
        }
      );
    }

    // Transform the data to match your existing interface
    const transformedRankings =
      rankings?.map((ranking) => ({
        ...ranking,
        candidateId: ranking.candidate_id, // Add this for backward compatibility
        technicalScore: ranking.technical_score,
        communicationScore: ranking.communication_score,
        icpAlignment: ranking.icp_alignment,
        finalRanking: ranking.final_score,
        rank: ranking.rank_position,
        candidate: ranking.candidate,
      })) || [];

    return NextResponse.json(
      {
        rankings: transformedRankings,
        hasAnalysis: rankings && rankings.length > 0,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
