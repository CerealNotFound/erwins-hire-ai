import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import {
  analyzeBatchCandidates,
  getDefaultICP,
} from "@/engine/analyzeCandidate/analyzeCandidate";

export async function POST(request: NextRequest) {
  const { campaignId } = await request.json();

  console.log(campaignId);
  const supabase = await createClient();

  try {
    // 1. Fetch campaign with ICP and completed interviews using Supabase joins
    const { data: campaign, error: campaignError } = await supabase
      .from("outreach_campaigns")
      .select(
        `
        *,
        interview_conversations!inner (
          *,
          candidates (*),
          interview_messages (*)
        )
      `
      )
      .eq("id", campaignId)
      .eq("interview_conversations.status", "completed")
      .single();

    console.log(campaign, campaignError);

    if (campaignError || !campaign) {
      return NextResponse.json(
        { error: "Campaign not found" },
        { status: 404 }
      );
    }

    const completedInterviews = campaign.interview_conversations || [];

    if (completedInterviews.length === 0) {
      return NextResponse.json({
        message: "No completed interviews to analyze",
        rankings: [],
      });
    }

    // 2. Get ICP profile (handle both single object and array cases)
    const icpProfile = Array.isArray(campaign.icp_profiles)
      ? campaign.icp_profiles[0]
      : campaign.icp_profiles || getDefaultICP();

    // 3. Analyze all candidates using the AI hook
    const candidateAnalyses = await analyzeBatchCandidates(
      completedInterviews,
      icpProfile
    );

    // 4. Rank candidates
    const rankedCandidates = candidateAnalyses
      .sort((a, b) => b.finalRanking - a.finalRanking)
      .map((analysis, index) => ({
        ...analysis,
        rank: index + 1,
      }));

    // 5. Store rankings in database using Supabase upsert
    const rankingUpdates = rankedCandidates.map((candidate) => ({
      campaign_id: campaignId,
      candidate_id: candidate.candidateId,
      technical_score: Math.min(Math.max(candidate.technicalScore, 0), 1), // Clamp between 0-1
      communication_score: Math.min(
        Math.max(candidate.communicationScore, 0),
        1
      ),
      icp_alignment: Math.min(Math.max(candidate.icpAlignment, 0), 1),
      final_score: Math.min(Math.max(candidate.finalRanking, 0), 1),
      rank_position: candidate.rank,
      tier: getTierFromRank(candidate.rank, rankedCandidates.length),
      insights: candidate.insights,
      strengths: candidate.strengths,
      concerns: candidate.concerns,
      updated_at: new Date().toISOString(),
    }));

    // Batch upsert for better performance
    const { error: upsertError } = await supabase
      .from("candidate_rankings")
      .upsert(rankingUpdates, {
        onConflict: "campaign_id,candidate_id",
        ignoreDuplicates: false,
      });

    if (upsertError) {
      console.error("❌ Failed to update rankings:", upsertError);
      throw new Error("Failed to store candidate rankings");
    }

    // 6. Update campaign with analysis completion timestamp
    await supabase
      .from("outreach_campaigns")
      .update({
        last_analysis_at: new Date().toISOString(),
        analysis_status: "completed",
      })
      .eq("id", campaignId);

    return NextResponse.json({
      success: true,
      message: `Successfully analyzed ${rankedCandidates.length} candidates`,
      rankings: rankedCandidates,
      metadata: {
        analyzedAt: new Date().toISOString(),
        totalCandidates: rankedCandidates.length,
        icpCriteria: icpProfile,
        campaignId,
      },
    });
  } catch (error) {
    console.error("❌ AI Analysis failed:", error);

    // Update campaign with error status
    await supabase
      .from("outreach_campaigns")
      .update({
        analysis_status: "failed",
        last_error: error instanceof Error ? error.message : "Unknown error",
      })
      .eq("id", campaignId);

    return NextResponse.json(
      { error: "Failed to generate AI analysis" },
      { status: 500 }
    );
  }
}

// Tier Classification Helper - Enhanced with more granular tiers
function getTierFromRank(rank: number, totalCandidates: number): string {
  const percentile = (rank - 1) / totalCandidates;

  if (percentile <= 0.1) return "exceptional"; // Top 10%
  if (percentile <= 0.25) return "excellent"; // Top 25%
  if (percentile <= 0.5) return "good"; // Top 50%
  if (percentile <= 0.75) return "fair"; // Top 75%
  return "needs_improvement"; // Bottom 25%
}

// export async function GET({ params }: { params: Promise<{ id: string }> }) {
//   const supabase = await createClient();

//   const { id: campaignId } = await params;

//   if (!campaignId || typeof campaignId !== "string") {
//     return NextResponse.json(
//       { error: "Campaign ID is required" },
//       { status: 400 }
//     );
//   }

//   try {
//     // Fetch rankings with candidate data joined
//     const { data: rankings, error } = await supabase
//       .from("candidate_rankings")
//       .select(
//         `
//         *,
//         candidate:candidates (
//           id,
//           full_name,
//           title,
//           current_company
//         )
//       `
//       )
//       .eq("campaign_id", campaignId)
//       .order("rank_position", { ascending: true });

//     if (error) {
//       console.error("Supabase error:", error);
//       return NextResponse.json(
//         {
//           error: "Failed to fetch rankings",
//         },
//         {
//           status: 500,
//         }
//       );
//     }

//     // Transform the data to match your existing interface
//     const transformedRankings =
//       rankings?.map((ranking) => ({
//         ...ranking,
//         candidateId: ranking.candidate_id, // Add this for backward compatibility
//         technicalScore: ranking.technical_score,
//         communicationScore: ranking.communication_score,
//         icpAlignment: ranking.icp_alignment,
//         finalRanking: ranking.final_score,
//         rank: ranking.rank_position,
//         candidate: ranking.candidate,
//       })) || [];

//     return NextResponse.json(
//       {
//         rankings: transformedRankings,
//         hasAnalysis: rankings && rankings.length > 0,
//       },
//       { status: 200 }
//     );
//   } catch (error) {
//     console.error("API error:", error);
//     return NextResponse.json(
//       { error: "Internal server error" },
//       { status: 500 }
//     );
//   }
// }
