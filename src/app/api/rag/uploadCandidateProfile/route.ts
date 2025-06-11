import { createClient } from "@/utils/supabase/server";

export const POST = async (request: Request) => {
  const body = await request.json();
  const candidatesWithEmbeddings = body.candidates; // Array of profiles WITH embeddings already

  console.log(`Batch inserting ${candidatesWithEmbeddings.length} candidates`);

  const supabase = await createClient();

  // Get user ONCE - not per candidate
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (!candidatesWithEmbeddings?.length) {
    return Response.json({ error: "No candidates to insert" }, { status: 400 });
  }

  // Add recruiter_id to ALL candidates in one go
  const candidatesWithUserId = candidatesWithEmbeddings.map(
    (candidate: any) => ({
      ...candidate,
      recruiter_id: user.id,
    })
  );

  try {
    // Single batch insert into Supabase
    const { error, data } = await supabase
      .from("candidates")
      .insert(candidatesWithUserId);

    if (error) {
      console.error("Supabase batch insert error:", error);
      return Response.json(
        {
          error: error.message,
          successful: 0,
          failed: candidatesWithEmbeddings.length,
        },
        { status: 400 }
      );
    }

    return Response.json(
      {
        success: true,
        successful: candidatesWithEmbeddings.length,
        failed: 0,
        inserted: data || candidatesWithEmbeddings.length,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Batch insert error:", err);
    return Response.json(
      {
        error: "Batch insert failed",
        successful: 0,
        failed: candidatesWithEmbeddings.length,
      },
      { status: 500 }
    );
  }
};
