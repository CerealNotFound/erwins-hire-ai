import axios from "axios";
import { CandidateQuery } from "./reformulators/geminiReformulator";
import { CandidateProfile } from "./resumeExtractors/geminiExtractor";

export const callGeminiReformulator = async (
  query: string
): Promise<string> => {
  const candidateQuery: string = await axios
    .post("/api/user-query", {
      query: query,
    })
    .then((response) => {
      return response.data.parsedQuery;
    });

  return candidateQuery;
};

export const callGeminiResumeExtractor = async (resume: string) : Promise<CandidateProfile> => {
    const profile: CandidateProfile = await axios
    .post("/api/process-resume", {
      resume: resume,
    })
    .then((response) => {
      return response.data.profile;
    });

  return profile;
}