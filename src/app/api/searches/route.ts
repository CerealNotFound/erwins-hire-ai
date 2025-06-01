import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const userResponse = await supabase.auth.getUser();
  const user = userResponse.data.user;

  if (user) {
    const { data, error } = await supabase
      .from("recruiter_queries")
      .select("id, query_text")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) {
      return Response.json(data, { status: 200 });
    }

    return Response.json({ error: error.message }, { status: 400 });
  }

  return Response.json({ error: "User not found" }, { status: 401 });
}