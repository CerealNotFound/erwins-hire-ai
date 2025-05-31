import { callGeminiReformulator } from "./geminiEngine";
import { CandidateQuery } from "./reformulators/geminiReformulator";

export function callEngineReformulator(
  query: string,
  engine: string
): Promise<string> {
  if (engine === "gemini") return callGeminiReformulator(query);
  //   if (engine === "openai") return callOpenAIReformulator(query);
  throw new Error("Unsupported engine");
}
