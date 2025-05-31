import { CandidateProfile, enhancedGeminiExtractor } from "@/engine/resumeExtractors/geminiExtractor";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { resume, extractedLinks = [] } = body; // Accept extractedLinks parameter

    if (!resume || typeof resume !== "string") {
      return Response.json(
        { error: "Invalid or missing 'resume' in request body" },
        { status: 400 }
      );
    }

    // Use the enhanced extractor that handles links
    const profile: CandidateProfile = await enhancedGeminiExtractor(resume, extractedLinks);

    return Response.json({ profile }, { status: 200 });
  } catch (error) {
    console.error("[/api/process-resumex] Error:", error);
    return Response.json(
      { error: "Failed to extract resume profile" },
      { status: 500 }
    );
  }
}