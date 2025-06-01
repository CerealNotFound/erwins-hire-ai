import { createClient } from "@/utils/supabase/server";

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const searchId = searchParams.get("searchId");
    const candidateId = searchParams.get("candidateId");
    
    // Parse the body to get the shortlisted status
    const body = await request.json();
    const { shortlisted } = body;

    // Validation - be strict about what we accept
    if (!searchId) {
      return Response.json({ error: "Missing searchId parameter" }, { status: 400 });
    }
    
    if (!candidateId) {
      return Response.json({ error: "Missing candidateId parameter" }, { status: 400 });
    }

    if (typeof shortlisted !== "boolean") {
      return Response.json({ error: "Invalid shortlisted value - must be boolean" }, { status: 400 });
    }

    const supabase = await createClient();

    // Update the shortlisted status in recruiter_results table
    const { data, error } = await supabase
      .from("recruiter_results")
      .update({ shortlisted })
      .eq("recruiter_query_id", searchId)
      .eq("candidate_id", candidateId)
      .select("shortlisted, candidate_id")
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return Response.json({ error: "Candidate not found for this search" }, { status: 404 });
    }

    return Response.json({ 
      message: `Candidate ${shortlisted ? 'shortlisted' : 'removed from shortlist'} successfully`,
      candidateId: data.candidate_id,
      shortlisted: data.shortlisted
    }, { status: 200 });

  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}