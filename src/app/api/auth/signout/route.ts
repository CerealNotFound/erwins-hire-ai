import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export async function POST(request: Request) {
  const supabase = await createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
    });
  }

  // Redirect to home page after successful sign out
  redirect("/");
}
