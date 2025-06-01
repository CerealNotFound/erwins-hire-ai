import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { campaign_name, role, description, questions } = body;

    if (!campaign_name || !role || !questions || questions.length === 0) {
      return Response.json(
        {
          error: "Missing required fields",
        },
        { status: 400 }
      );
    }

    const validQuestions = questions.filter(
      (q: string) => q && q.trim() !== ""
    );

    if (validQuestions.length === 0) {
      return Response.json(
        {
          error: "At least one valid question is required",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("outreach_campaigns")
      .insert([
        {
          campaign_name: campaign_name.trim(),
          role: role.trim(),
          description: description?.trim() || null,
          questions: validQuestions,
          recruiter_id: user.id,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { error: "Failed to create campaign" },
        { status: 500 }
      );
    }

    return Response.json(
      {
        message: "Campaign created successfully",
        campaign: data,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("outreach_campaigns")
      .select("*")
      .eq("recruiter_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase error:", error);
      return Response.json(
        { error: "Failed to fetch campaigns" },
        { status: 500 }
      );
    }

    return Response.json({ campaigns: data }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
