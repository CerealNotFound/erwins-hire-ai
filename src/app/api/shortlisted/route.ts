import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;

  if (!user) {
    return Response.json({ error: "User not found" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("recruiter_results")
    .select(
      `
      id,
      rank,
      matching_skills,
      overall_score,
      skill_match_percentage,
      semantic_match_score,
      shortlisted,
      created_at,
      missing_skills,
      recruiter_queries!inner (
        id,
        query_text,
        created_at
      ),
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
    .eq("recruiter_queries.recruiter_id", user.id)
    .eq("shortlisted", true)
    .order("created_at", { ascending: false });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Transform the data to flatten the structure and include search context
  const shortlistedCandidates = data.map((result) => ({
    result_id: result.id,
    rank: result.rank,
    skill_match_percentage: result.skill_match_percentage,
    semantic_match_score: result.semantic_match_score,
    matching_skills: result.matching_skills,
    overall_score: result.overall_score,
    missing_skills: result.missing_skills,
    shortlisted: result.shortlisted,
    shortlisted_at: result.created_at,
    search_query: (result.recruiter_queries as any).query_text,
    search_id: (result.recruiter_queries as any).id,
    search_date: (result.recruiter_queries as any).created_at,
    ...result.candidates,
  }));

  return Response.json(shortlistedCandidates, { status: 200 });
}
