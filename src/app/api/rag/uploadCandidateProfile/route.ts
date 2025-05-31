import { useEmbedText } from "@/hooks/rag/useEmbedText";
import { createClient } from "@/utils/supabase/server";

export const POST = async (request: Request) => {
  const body = await request.json(); // full CandidateProfile with about
  const profile = body.profile;
  console.log(body, profile);
  const supabase = await createClient();

  if (!profile.about) {
    return Response.json({ error: "Missing about" }, { status: 400 });
  }

  try {
    // Step 1: Embed the about
    const [embedding] = await useEmbedText([profile.about]);

    // Step 2: Add embedding to the profile object
    const candidateWithEmbedding = {
      ...profile,
      embedding,
    };

    // Step 3: Insert into Supabase
    const { error } = await supabase
      .from("candidates")
      .insert(candidateWithEmbedding);

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json({ error: error.message }, { status: 400 });
    }

    return Response.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Embedding error:", err);
    return Response.json({ error: "Embedding failed" }, { status: 500 });
  }
};
