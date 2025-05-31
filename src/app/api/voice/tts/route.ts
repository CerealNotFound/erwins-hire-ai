export async function POST(req: Request) {
  const { text, voice = "adam", response_format = "mp3" } = await req.json();

  const res = await fetch("https://api.lemonfox.ai/v1/audio/speech", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input: text,
      voice,
      response_format,
    }),
  });

  if (!res.ok || !res.body) {
    console.log(res);
    return Response.json(
      { error: "Failed to stream TTS audio from Lemonfox" },
      { status: 500 }
    );
  }

  return new Response(res.body, {
    headers: {
      "Content-Type": `audio/${response_format}`,
      "Transfer-Encoding": "chunked",
    },
  });
}
