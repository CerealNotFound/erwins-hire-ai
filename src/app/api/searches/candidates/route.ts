import { createClient } from "@/utils/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const searchId = searchParams.get("searchId");

  if (!searchId) {
    return Response.json({ error: "Missing searchId" }, { status: 400 });
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("recruiter_results")
    .select(
      `
      rank,
      matching_skills,
      overall_score,
      skill_match_percentage,
      semantic_match_score,
      shortlisted,
      missing_skills,
      candidates (
        id,
        full_name,
        linkedin_url,
        title,
        location,
        skills,
        about,
        experience,
        github_url,
        education,
        email,
        portfolio_url,
        project_urls,
        blog_url,
        experience_years
      )
    `
    )
    .eq("recruiter_query_id", searchId)
    .order("rank", { ascending: true });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Transform the data to flatten the structure
  const candidates = data.map((result) => ({
    rank: result.rank,
    skill_match_percentage: result.skill_match_percentage,
    semantic_match_score: result.semantic_match_score,
    matching_skills: result.matching_skills,
    overall_score: result.overall_score,
    shortlisted: result.shortlisted,
    missing_skills: result.missing_skills,
    ...result.candidates,
  }));

  return Response.json(candidates, { status: 200 });
}
