import { useCleanup } from "@/hooks/rag/useCleanup";
import { fileParsers } from "@/lib/parsers";
import { processResumeFile } from "@/lib/parsers";
import { CandidateProfile } from "@/engine/resumeExtractors/geminiExtractor";
import { useEmbedText } from "@/hooks/rag/useEmbedText"; // Your embedding function

export async function POST(request: Request) {
  const formData = await request.formData();
  const uploadedFile = formData.get("file");

  if (!(uploadedFile instanceof File)) {
    return Response.json({ error: "Form data is not a file" }, { status: 400 });
  }

  const fileBuffer = Buffer.from(await uploadedFile.arrayBuffer());
  const fileType = uploadedFile.type;

  // Check if this is a resume file (PDF or DOCX)
  const isResumeFile = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ].includes(fileType);

  try {
    if (isResumeFile) {
      // FULL RESUME PROCESSING WITH AI EXTRACTION
      console.log(`🚀 Processing resume: ${uploadedFile.name}`);
      const candidateProfile: CandidateProfile = await processResumeFile(fileBuffer, fileType);
      
      console.log(`✅ Profile extracted for: ${candidateProfile.full_name}`);
      
      // GENERATE EMBEDDING FOR THE PROFILE
      console.log(`🔥 Generating embedding for: ${candidateProfile.full_name}`);
      const embedding = await useEmbedText([candidateProfile.about]);
      
      // Return profile WITH embedding
      return Response.json({
        type: "candidate-profile",
        data: {
          ...candidateProfile,
          embedding: embedding[0] // First (and only) embedding from the array
        },
        metadata: {
          filename: uploadedFile.name,
          fileType: fileType,
          processingTime: Date.now()
        }
      }, { status: 200 });
      
    } else {
      // FALLBACK: Regular file parsing for non-resume files
      const parser = fileParsers[fileType];
      
      if (!parser) {
        return Response.json({ error: "Unsupported file type" }, { status: 415 });
      }

      const rawData = await parser(fileBuffer);
      
      // Apply cleanup for text-based data
      if (rawData.type === "text" || rawData.type === "enhanced-text") {
        rawData.data.text = useCleanup(rawData.data.text);
      }
      
      return Response.json(rawData, { status: 200 });
    }
    
  } catch (err) {
    console.error("Resume processing failed:", err);
    return Response.json({ 
      error: "Failed to process resume",
      details: err instanceof Error ? err.message : "Unknown error"
    }, { status: 500 });
  }
}