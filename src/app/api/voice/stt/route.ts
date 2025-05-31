export async function POST(req: Request) {
  const formData = await req.formData();
  const file = formData.get("audioFile");

  if (!(file instanceof Blob)) {
    return new Response("Invalid file", { status: 400 });
  }

  const audioBuffer = await file.arrayBuffer();

  const lemonForm = new FormData();
  lemonForm.append("file", new Blob([audioBuffer]), "voice.mp3");
  lemonForm.append("language", "english");
  lemonForm.append("response_format", "json");

  const res = await fetch("https://api.lemonfox.ai/v1/audio/transcriptions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.LEMONFOX_API_KEY}`,
    },
    body: lemonForm,
  });

  if (!res.ok) {
    return new Response("STT failed", { status: 500 });
  }

  const result = await res.json();
  return Response.json(result);
}
