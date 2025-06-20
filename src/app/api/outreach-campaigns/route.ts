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
    const { 
      campaign_name, 
      role, 
      description, 
      culture_questions, 
      technical_config,
      icp_config
    } = body;

    // Validate required fields
    if (!campaign_name || !role) {
      return Response.json(
        {
          error: "Campaign name and role are required",
        },
        { status: 400 }
      );
    }

    // Process culture questions - filter out empty ones
    const validCultureQuestions = culture_questions?.filter(
      (q: string) => q && q.trim() !== ""
    ) || [];

    // Validate technical config
    const validTechnicalConfig = technical_config || {};
    const totalTechnicalQuestions = Object.values(validTechnicalConfig).reduce(
      (sum: number, count: any) => sum + (parseInt(count) || 0),
      0
    );

    // Ensure at least one question type exists
    if (validCultureQuestions.length === 0 && totalTechnicalQuestions === 0) {
      return Response.json(
        {
          error: "At least one culture question or technical question configuration is required",
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
          questions: validCultureQuestions, // Culture questions as text array
          technical_config: validTechnicalConfig, // Technical config as JSONB
          icp_config: icp_config,
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
1
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
