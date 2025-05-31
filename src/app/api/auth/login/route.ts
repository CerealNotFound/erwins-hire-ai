import { createClient } from "@/utils/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();

  console.log(body);

  const { data, error } = await supabase.auth.signInWithPassword(body)

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 401,
    });
  }

  return new Response(JSON.stringify({ user: data.user }), { status: 200 });
}
