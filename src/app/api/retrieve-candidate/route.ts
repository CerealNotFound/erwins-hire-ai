import { useEmbedText } from "@/hooks/rag/useEmbedText";
import { createClient } from "@/utils/supabase/server";
import { geminiReformulator } from "@/engine/reformulators/geminiReformulator";

interface CandidateSearchResult {
  id: string;
  full_name: string;
  linkedin_url: string;
  title: string;
  skills: string[];
  experience_years: number;
  similarity: number;
  skill_match_score: number;
}

interface ProcessedCandidate extends CandidateSearchResult {
  semantic_match_score: number;
  skill_match_percentage: number;
  matching_skills: string[];
  missing_skills: string[];
  overall_score: number;
  experience_match: string;
}

// 🎯 CHUNK 1: Input Validation & Auth
async function validateAndAuthenticate(request: Request, supabase: any) {
  const { query, filters = {} } = await request.json();

  if (!query || typeof query !== "string") {
    throw new Error("Query is required and must be a string");
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("Authentication required");
  }

  return { query, filters, user };
}

// 🎯 CHUNK 2: Query Processing Pipeline
async function processQuery(query: string) {
  console.log("🔍 Processing query:", query);

  // Parallel execution for speed
  const [reformulatedQuery, embedding] = await Promise.all([
    geminiReformulator(query),
    useEmbedText([query]),
  ]);

  console.log("🧠 Reformulated:", JSON.stringify(reformulatedQuery, null, 2));

  return {
    reformulatedQuery,
    embedding: embedding[0],
    searchParams: {
      skills: reformulatedQuery.skills || [],
      minExperience: reformulatedQuery.experience?.min || 0,
      maxExperience: reformulatedQuery.experience?.max || 20,
    },
  };
}

// 🎯 CHUNK 3: Database Search Execution
async function executeSearch(
  supabase: any,
  embedding: number[],
  searchParams: any
) {
  const match_threshold = 0.5;
  const match_count = 10;

  console.log("⚙️ Search parameters:", {
    skills: searchParams.skills,
    experienceRange: `${searchParams.minExperience}-${searchParams.maxExperience} years`,
    threshold: match_threshold,
    embeddingDim: embedding.length,
  });

  const { data, error } = await supabase.rpc("match_candidates", {
    query_embedding: embedding,
    match_threshold,
    match_count,
    min_experience: searchParams.minExperience,
    max_experience: searchParams.maxExperience,
    required_skills: searchParams.skills,
  });

  if (error) {
    console.error("💥 Supabase RPC error:", error);
    throw new Error(`Search failed: ${error.message}`);
  }

  return { data: data || [], searchConfig: { match_threshold, match_count } };
}

// 🎯 CHUNK 4: Results Processing & Scoring
function processSearchResults(
  candidates: CandidateSearchResult[],
  requiredSkills: string[],
  minExp: number,
  maxExp: number
): ProcessedCandidate[] {
  return candidates
    .map((candidate) => {
      // Semantic scoring
      const semantic_match_score = Math.round((1 - candidate.similarity) * 100);
      const skill_match_percentage = Math.round(
        candidate.skill_match_score * 100
      );

      // Skill analysis
      const matching_skills = findMatchingSkills(
        candidate.skills,
        requiredSkills
      );
      const missing_skills = findMissingSkills(
        candidate.skills,
        requiredSkills
      );

      // Combined scoring
      const overall_score = Math.round(
        semantic_match_score * 0.4 + skill_match_percentage * 0.6
      );

      // Experience validation
      const experience_match =
        candidate.experience_years >= minExp &&
        candidate.experience_years <= maxExp
          ? "✅"
          : "⚠️";

      return {
        ...candidate,
        semantic_match_score,
        skill_match_percentage,
        matching_skills,
        missing_skills,
        overall_score,
        experience_match,
      };
    })
    .sort((a, b) => b.overall_score - a.overall_score);
}

// 🎯 CHUNK 5: Skill Matching Logic (extracted for reusability)
function findMatchingSkills(
  candidateSkills: string[],
  requiredSkills: string[]
): string[] {
  return candidateSkills.filter((candidateSkill) =>
    requiredSkills.some((requiredSkill) => {
      const candidateLower = candidateSkill.toLowerCase();
      const requiredLower = requiredSkill.toLowerCase();
      return (
        candidateLower === requiredLower ||
        candidateLower.includes(requiredLower) ||
        requiredLower.includes(candidateLower)
      );
    })
  );
}

function findMissingSkills(
  candidateSkills: string[],
  requiredSkills: string[]
): string[] {
  return requiredSkills.filter(
    (requiredSkill) =>
      !candidateSkills.some((candidateSkill) => {
        const candidateLower = candidateSkill.toLowerCase();
        const requiredLower = requiredSkill.toLowerCase();
        return (
          candidateLower.includes(requiredLower) ||
          requiredLower.includes(candidateLower)
        );
      })
  );
}

// 🎯 CHUNK 6: Response Builder
function buildSearchResponse(
  processedResults: ProcessedCandidate[],
  originalQuery: string,
  reformulatedQuery: any,
  searchParams: any,
  searchConfig: any
) {
  const searchMetadata = {
    originalQuery,
    reformulatedQuery,
    searchParameters: {
      skillsRequired: searchParams.skills,
      experienceRange: `${searchParams.minExperience}-${searchParams.maxExperience} years`,
      threshold: searchConfig.match_threshold,
    },
    results: {
      total_count: processedResults.length,
      best_match: processedResults[0]
        ? {
            name: processedResults[0].full_name,
            semantic_score: processedResults[0].semantic_match_score,
            skill_match: processedResults[0].skill_match_percentage,
            overall_score: processedResults[0].overall_score,
            matching_skills: processedResults[0].matching_skills,
          }
        : null,
      average_scores: calculateAverageScores(processedResults),
    },
    debugInfo: {
      reformulation_successful: !!reformulatedQuery.role,
      embedding_dimensions: searchConfig.embeddingDim,
      sql_parameters_sent: {
        min_experience: searchParams.minExperience,
        max_experience: searchParams.maxExperience,
        required_skills: searchParams.skills,
      },
    },
  };

  return {
    data: processedResults,
    message:
      processedResults.length > 0
        ? `Found ${processedResults.length} candidates matching your criteria`
        : "No candidates found matching your criteria",
    searchMetadata,
  };
}

function calculateAverageScores(results: ProcessedCandidate[]) {
  if (results.length === 0) return { semantic: 0, skills: 0 };

  const semantic = Math.round(
    results.reduce((sum, r) => sum + r.semantic_match_score, 0) / results.length
  );
  const skills = Math.round(
    results.reduce((sum, r) => sum + r.skill_match_percentage, 0) /
      results.length
  );

  return { semantic, skills };
}

// 🎯 CHUNK 7: Query & Results Storage
async function saveSearchSession(
  supabase: any,
  userId: string,
  originalQuery: string,
  embedding: number[],
  processedResults: ProcessedCandidate[]
) {
  try {
    // Save query
    const { data: queryData, error: queryError } = await supabase
      .from("recruiter_queries")
      .insert({
        recruiter_id: userId,
        query_text: originalQuery,
        embedding: embedding,
        top_k: processedResults.length,
      })
      .select("id")
      .single();

    if (queryError) throw queryError;

    // Save results in batch
    if (processedResults.length > 0) {
      const resultsToInsert = processedResults.map((candidate, index) => ({
        recruiter_query_id: queryData.id,
        candidate_id: candidate.id,
        rank: index + 1,
        skill_match_percentage: candidate.skill_match_percentage,
        semantic_match_score: candidate.semantic_match_score,
        overall_score: candidate.overall_score,
        matching_skills: candidate.matching_skills,
        missing_skills: candidate.missing_skills,
      }));

      const { error: resultsError } = await supabase
        .from("recruiter_results")
        .insert(resultsToInsert);

      if (resultsError) throw resultsError;
    }

    console.log(`✅ Saved search session: ${queryData.id}`);
    return { success: true, queryId: queryData.id };
  } catch (error: any) {
    console.error("💥 Failed to save search session:", error);
    return { success: false, error: error.message };
  }
}

// 🚀 MAIN API HANDLER - Now Clean & Focused
export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Step 1: Validate & Authenticate
    const { query, filters, user } = await validateAndAuthenticate(
      request,
      supabase
    );

    // Step 2: Process Query
    const { reformulatedQuery, embedding, searchParams } = await processQuery(
      query
    );

    // Step 3: Execute Search
    const { data: searchResults, searchConfig } = await executeSearch(
      supabase,
      embedding,
      searchParams
    );

    // Step 4: Process Results
    const processedResults = processSearchResults(
      searchResults,
      searchParams.skills,
      searchParams.minExperience,
      searchParams.maxExperience
    );

    // Step 5: Save Session (MAKE THIS BLOCKING, NOT NON-BLOCKING)
    const sessionResult = await saveSearchSession(
      supabase,
      user.id,
      query,
      embedding,
      processedResults
    );

    if (!sessionResult.success) {
      console.error("⚠️ Session save failed:", sessionResult.error);
    }

    // Step 6: Build Response - INCLUDE THE SEARCH ID
    const response = {
      ...buildSearchResponse(
        processedResults,
        query,
        reformulatedQuery,
        searchParams,
        { ...searchConfig, embeddingDim: embedding.length }
      ),
      searchId: sessionResult.queryId || null, // CRITICAL: Include search ID
    };

    console.log(`✅ Search completed: ${processedResults.length} results`);
    return Response.json(response, { status: 200 });
  } catch (error: any) {
    console.error("💥 Search API error:", error);

    const errorResponse = {
      error: "Search failed",
      message: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString(),
    };

    const status = error.message.includes("Authentication") ? 401 : 500;
    return Response.json(errorResponse, { status });
  }
}
