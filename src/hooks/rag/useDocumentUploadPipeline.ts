import { useApiToast } from "@/components/promise-sonner/promise-sonner";
import { CandidateProfile } from "@/engine/resumeExtractors/geminiExtractor";

export const useUploadPipeline = () => {
  const { callApi } = useApiToast();

  const processFile = async (
    file: File
  ): Promise<{ type: string; data: any }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await callApi({
      url: "/api/rag/processFile",
      method: "POST", 
      data: formData,
      loadingMessage: `Processing ${file.name}...`,
      successMessage: () => "File processed successfully!",
      errorMessage: (err) => `File processing failed: ${err.message}`,
    });

    return response;
  };

  const extractProfile = async (
    processedData: any
  ): Promise<{ profile: CandidateProfile }> => {
    // Handle both old and new data structures
    let resume: string;
    let extractedLinks: string[] = [];

    if (typeof processedData === 'string') {
      // Legacy: just text
      resume = processedData;
    } else if (processedData.text) {
      // New structure: object with text and extractedLinks
      resume = processedData.text;
      extractedLinks = processedData.extractedLinks || [];
    } else {
      throw new Error("Invalid processed data structure");
    }

    const response = await callApi({
      url: "/api/process-resume",
      method: "POST",
      data: { resume, extractedLinks }, // Now properly passing both parameters
      loadingMessage: `Processing resume...`,
      successMessage: () => "Resume processed successfully!",
      errorMessage: (err) => `Resume processing failed: ${err.message}`,
    });

    return response;
  };

  const uploadCandidateProfile = async (candidate: CandidateProfile) => {
    await callApi({
      url: "/api/rag/uploadCandidateProfile",
      method: "POST",
      data: { profile: candidate },
      loadingMessage: `Creating and uploading embeddings...`,
      successMessage: () => "Embeddings uploaded successfully!",
      errorMessage: (err) => `Embedding upload failed: ${err.message}`,
    });
  };

  const handleFullUploadPipeline = async (file: File) => {
    // Step 1: Process file (now extracts links for PDFs)
    const processedFile = await processFile(file);
    console.log("Processed file:", processedFile);
    
    // Step 2: Extract profile using both text and links
    const { profile } = await extractProfile(processedFile.data);
    console.log("Extracted profile:", profile);
    
    // Step 3: Upload to database
    await uploadCandidateProfile(profile);
  };

  return { handleFullUploadPipeline };
};