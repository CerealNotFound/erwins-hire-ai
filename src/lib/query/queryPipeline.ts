import { callEngineReformulator } from "@/engine";

export type Candidate = {
  id: string;
  full_name: string;
  linkedin_url: string;
  title: string;
  location: string;
  experience: {
    position: string;
    company: string;
    duration: string; // e.g. "2 years", "6 months"
  }[];
  skills: string[];
  about: string;
  resume_text: string;
  created_at: string; // ISO timestamp
};


type PipelineOptions = {
  engine?: "gemini" | "openai";
  allowWebFallback?: boolean;
};

type PipelineResponse = {
  query: string;
  reformulated: string;
  dbResults: Candidate[];
  webResults?: Candidate[];
};

export async function queryPipeline(query: string, options: PipelineOptions): Promise<PipelineResponse> {
  const engine = options.engine ?? "gemini";

  // Step 1: Reformulate user query using selected engine
  const reformulated = callEngineReformulator(query, engine);

  // Step 2: Generate embedding for reformulated query
  const embedding = await embedText(reformulated);

  // Step 3: Query vector DB
  const dbResults = await queryVectorDB(embedding);

  // Step 4: Optional web fallback if results are poor
  let webResults;
  if (options.allowWebFallback && dbResults.length < 5) {
    const webText = await callSerper(query);
    const webEmbedding = await embedText(webText);
    webResults = await queryVectorDB(webEmbedding);
  }

  return {
    query,
    reformulated,
    dbResults,
    ...(webResults ? { webResults } : {})
  };
}
