import { createClient } from "@/utils/supabase/server";

// File: /api/outreach-campaigns/[id]/route.ts

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: campaignId } = await params;

    if (!campaignId) {
      return Response.json(
        { error: "Campaign ID is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("outreach_campaigns")
      .select("*")
      .eq("id", campaignId)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    if (!data) {
      return Response.json({ error: "Campaign not found" }, { status: 404 });
    }

    return Response.json({ campaign: data }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return Response.json({ error: "Internal server error" }, { status: 500 });
  }
}
