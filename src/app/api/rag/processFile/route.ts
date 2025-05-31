import { useCleanup } from "@/hooks/rag/useCleanup";
import { fileParsers } from "@/lib/parsers";

export async function POST(request: Request) {
  const formData = await request.formData();
  const uploadedFile = formData.get("file");

  if (!(uploadedFile instanceof File)) {
    return Response.json({ error: "Form data is not a file" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
  const parser = fileParsers[uploadedFile.type];

  if (!parser) {
    return Response.json({ error: "Unsupported file type" }, { status: 415 });
  }

  try {
    const rawData = await parser(fileBuffer);
    
    // Apply cleanup for text-based data
    if (rawData.type === "text" || rawData.type === "enhanced-text") {
      rawData.data.text = useCleanup(rawData.data.text);
    }
    
    console.log(rawData);
    return Response.json(rawData, { status: 200 });
  } catch (err) {
    return Response.json({ error: "Failed to parse file" }, { status: 500 });
  }
}
