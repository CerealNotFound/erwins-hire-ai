import { useEmbedText } from "@/hooks/rag/useEmbedText";
import { createClient } from "@/utils/supabase/server";
import { geminiReformulator } from "@/engine/reformulators/geminiReformulator";

interface RawCandidate {
  // Core identity
  id: string;
  full_name: string;
  linkedin_url: string;
  email: string;

  // Professional data
  title: string;
  location: string;
  skills: string[];
  about: string;
  experience_years: number;

  // Rich profile data
  experience: any;
  education: any;
  projects: any[];

  // External links
  github_url: string;
  portfolio_url: string;
  blog_url: string;

  // SQL-calculated semantic score (0-100)
  semantic_match_score: number;
}

// 2. FULLY SCORED CANDIDATE (After backend processing)
interface ScoredCandidate extends RawCandidate {
  // 🎯 Core Scoring System (0-100 each)
  project_quality_score: number;
  experience_relevance_score: number;
  skill_match_percentage: number;
  overall_score: number; // Weighted combination

  // 🔍 Skill Analysis
  matching_skills: string[];
  missing_skills: string[];

  // 💼 Experience Validation
  experience_match: "✅" | "⚠️";
}

interface SearchResponse {
  data: ScoredCandidate[];
  total_count: number;
  message: string;
  searchMetadata: {
    originalQuery: string;
    reformulatedQuery: any;
    searchParameters: {
      skills: string[];
      minExperience: number;
      maxExperience: number;
    };
    architecture: {
      retrieval: string;
      ranking: string;
      weights: {
        semantic: number;
        project_quality: number;
        experience_relevance: number;
        skills_alignment: number;
      };
    };
    average_scores: {
      semantic: number;
      project_quality: number;
      experience_relevance: number;
      skills_alignment: number;
      overall: number;
    };
  };
  searchId: string | null;
}

function transformToScoredCandidate(
  rawCandidate: RawCandidate,
  requiredSkills: string[],
  searchQuery: string,
  experienceRange: { min: number; max: number }
): ScoredCandidate {
  // 🚨 CRITICAL FIX: Handle null semantic scores
  const semantic_score = rawCandidate.semantic_match_score ?? 0;

  // Calculate all scores
  const project_quality_score = calculateProjectQualityScore(rawCandidate);
  const experience_relevance_score = calculateExperienceRelevance(
    rawCandidate.about,
    rawCandidate.experience,
    searchQuery
  );
  const skill_match_percentage = calculateSkillMatchPercentage(
    rawCandidate.skills,
    requiredSkills
  );

  // Weighted overall score with null-safe semantic score
  const overall_score = Math.round(
    semantic_score * 0.4 +
      project_quality_score * 0.3 +
      experience_relevance_score * 0.2 +
      skill_match_percentage * 0.1
  );

  // Skill analysis
  const matching_skills = findMatchingSkills(
    rawCandidate.skills,
    requiredSkills
  );
  const missing_skills = findMissingSkills(rawCandidate.skills, requiredSkills);

  // Experience validation
  const experience_match =
    rawCandidate.experience_years >= experienceRange.min &&
    rawCandidate.experience_years <= experienceRange.max
      ? "✅"
      : "⚠️";

  return {
    ...rawCandidate,
    semantic_match_score: semantic_score, // 🔥 Ensure it's never null
    project_quality_score,
    experience_relevance_score,
    skill_match_percentage,
    overall_score,
    matching_skills,
    missing_skills,
    experience_match,
  };
}

function calculateSkillMatchPercentage(
  candidateSkills: string[],
  requiredSkills: string[]
): number {
  if (!requiredSkills || requiredSkills.length === 0) return 100;

  const matchingCount = requiredSkills.filter((reqSkill) =>
    candidateSkills.some((candidateSkill) => {
      const reqLower = reqSkill.toLowerCase();
      const candLower = candidateSkill.toLowerCase();
      return (
        candLower === reqLower ||
        candLower.includes(reqLower) ||
        reqLower.includes(candLower)
      );
    })
  ).length;

  return Math.round((matchingCount / requiredSkills.length) * 100);
}

function calculateMultiScores(
  rawCandidates: RawCandidate[],
  requiredSkills: string[],
  searchQuery: string,
  experienceRange: { min: number; max: number }
): ScoredCandidate[] {
  return rawCandidates.map((candidate) =>
    transformToScoredCandidate(
      candidate,
      requiredSkills,
      searchQuery,
      experienceRange
    )
  );
}

// 🎯 NEW: Enhanced Project Quality Scoring (Now with rich project data!)
function calculateProjectQualityScore(candidate: any): number {
  let score = 30; // Lower base score since we'll add more intelligently

  // GitHub presence
  if (candidate.github_url) score += 10;

  // Portfolio presence
  if (candidate.portfolio_url) score += 8;

  // Blog presence (thought leadership)
  if (candidate.blog_url) score += 7;

  // 🔥 NEW: Rich project analysis
  if (candidate.projects && Array.isArray(candidate.projects)) {
    const projects = candidate.projects;

    // Project quantity bonus
    score += Math.min(projects.length * 8, 25);

    // Project quality analysis
    projects.forEach((project: any) => {
      // GitHub links (shows they share code)
      if (project.github_url) score += 3;

      // Live deployment (shows they ship)
      if (project.live_url && project.live_url.trim()) score += 5;

      // Modern tech stack bonus
      if (project.technologies && Array.isArray(project.technologies)) {
        const modernTech = [
          "typescript",
          "nextjs",
          "react",
          "nodejs",
          "postgresql",
          "tailwindcss",
          "drizzleorm",
        ];
        const techMatches = project.technologies.filter((tech: string) =>
          modernTech.includes(tech.toLowerCase())
        ).length;
        score += Math.min(techMatches * 2, 10);
      }

      // Description quality (detailed explanations show depth)
      if (project.description) {
        const descLength = project.description.length;
        if (descLength > 100) score += 3;
        if (descLength > 200) score += 2;

        // Performance/optimization mentions
        const perfKeywords = [
          "optimization",
          "performance",
          "speed",
          "efficient",
          "reduced",
          "improved",
        ];
        const perfMatches = perfKeywords.filter((keyword) =>
          project.description.toLowerCase().includes(keyword)
        ).length;
        score += perfMatches * 2;
      }
    });
  }

  // About section quality (length and keywords indicating innovation)
  if (candidate.about) {
    const aboutLength = candidate.about.length;
    if (aboutLength > 200) score += 5;

    // Innovation keywords
    const innovationKeywords = [
      "ai",
      "machine learning",
      "automation",
      "optimization",
      "architecture",
      "scale",
    ];
    const keywordMatches = innovationKeywords.filter((keyword) =>
      candidate.about.toLowerCase().includes(keyword)
    ).length;
    score += keywordMatches * 2;
  }

  return Math.min(Math.max(score, 0), 100);
}

// 🎯 NEW: Experience Relevance Scoring
function calculateExperienceRelevance(
  about: string,
  experience: string,
  searchQuery: string
): number {
  let score = 50; // Base score

  if (!about && !experience) return score;

  const combinedText = `${about || ""} ${experience || ""}`.toLowerCase();
  const queryTerms = searchQuery.toLowerCase().split(" ");

  // Context matching
  const contextMatches = queryTerms.filter(
    (term) => combinedText.includes(term) && term.length > 2
  ).length;

  score += Math.min(contextMatches * 10, 30);

  // Leadership/senior indicators
  const leadershipKeywords = [
    "lead",
    "senior",
    "architect",
    "manager",
    "mentor",
  ];
  const leadershipMatches = leadershipKeywords.filter((keyword) =>
    combinedText.includes(keyword)
  ).length;
  score += leadershipMatches * 5;

  return Math.min(Math.max(score, 0), 100);
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

// 🎯 UPDATED: Database Search Execution (Replace Chunk 3)
async function executeSemanticSearch(
  supabase: any,
  embedding: number[],
  searchParams: any
) {
  const match_threshold = 0.85;

  console.log("⚙️ Clean semantic search parameters:", {
    experienceRange: `${searchParams.minExperience}-${searchParams.maxExperience} years`,
    threshold: match_threshold,
    embeddingDim: embedding.length,
  });

  const { data, error } = await supabase.rpc("semantic_candidate_search", {
    query_embedding: embedding,
    match_threshold: match_threshold,
    min_experience: searchParams.minExperience,
    max_experience: searchParams.maxExperience,
    result_limit: 100,
  });

  if (error) {
    console.error("💥 Supabase RPC error:", error);
    throw new Error(`Search failed: ${error.message}`);
  }

  // 🚨 DEBUG: Check what the database is actually returning
  console.log("🔍 Sample raw candidate from DB:", {
    id: data?.[0]?.id,
    semantic_match_score: data?.[0]?.semantic_match_score,
    has_semantic_score: data?.[0]?.semantic_match_score !== null,
    type_of_semantic: typeof data?.[0]?.semantic_match_score,
  });

  console.log(`📊 Raw retrieval: ${data?.length || 0} candidates`);
  return { data: data || [], searchConfig: { match_threshold } };
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

// 🎯 CHUNK 7: Query & Results Storage
async function saveSearchSession(
  supabase: any,
  userId: string,
  originalQuery: string,
  embedding: number[],
  processedResults: ScoredCandidate[]
) {
  try {
    // 🚨 DEBUG: Log the first candidate to see what's actually being sent
    console.log("🔍 First candidate being saved:", {
      id: processedResults[0]?.id,
      semantic_match_score: processedResults[0]?.semantic_match_score,
      skill_match_percentage: processedResults[0]?.skill_match_percentage,
      overall_score: processedResults[0]?.overall_score,
    });

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

    // Save results in batch with null safety
    if (processedResults.length > 0) {
      const resultsToInsert = processedResults.map((candidate, index) => ({
        recruiter_query_id: queryData.id,
        candidate_id: candidate.id,
        rank: index + 1,
        skill_match_percentage: candidate.skill_match_percentage ?? 0, // 🔥 Null safety
        semantic_match_score: candidate.semantic_match_score ?? 0, // 🔥 Null safety
        overall_score: candidate.overall_score ?? 0, // 🔥 Null safety
        project_quality_score: candidate.project_quality_score,
        experience_relevance_score: candidate.experience_relevance_score,
        matching_skills: candidate.matching_skills || [],
        missing_skills: candidate.missing_skills || [],
      }));

      // 🚨 DEBUG: Log what we're actually inserting
      console.log("📝 Sample insert data:", resultsToInsert[0]);

      const { error: resultsError } = await supabase
        .from("recruiter_results")
        .insert(resultsToInsert);

      if (resultsError) {
        console.error("💥 Insert error details:", resultsError);
        throw resultsError;
      }
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

    // Steps 1-3: Same as before...
    const { query, filters, user } = await validateAndAuthenticate(
      request,
      supabase
    );
    const { reformulatedQuery, embedding, searchParams } = await processQuery(
      query
    );
    const { data: rawCandidates, searchConfig } = await executeSemanticSearch(
      supabase,
      embedding,
      searchParams
    );

    // 🔥 STEP 4: Clean, Single Transformation
    const scoredCandidates = calculateMultiScores(
      rawCandidates, // Type: RawCandidate[]
      searchParams.skills,
      query,
      { min: searchParams.minExperience, max: searchParams.maxExperience }
    );

    // 🎯 STEP 5: Single Ranking (No more double-ranking!)
    const rankedCandidates = scoredCandidates.sort(
      (a, b) => b.overall_score - a.overall_score
    );

    // 🏆 STEP 6: Save Session (Don't forget this!)
    const sessionResult = await saveSearchSession(
      supabase,
      user.id,
      query,
      embedding,
      rankedCandidates
    );

    // 🏆 STEP 7: Type-safe response
    const response: SearchResponse = {
      data: rankedCandidates, // Type: ScoredCandidate[]
      total_count: rankedCandidates.length,
      message:
        rankedCandidates.length > 0
          ? `Found ${rankedCandidates.length} candidates, ranked by comprehensive scoring`
          : "No candidates found matching your criteria",
      searchMetadata: {
        originalQuery: query,
        reformulatedQuery,
        searchParameters: searchParams,
        architecture: {
          retrieval: "SQL semantic search only",
          ranking: "Backend comprehensive scoring",
          weights: {
            semantic: 0.4,
            project_quality: 0.3,
            experience_relevance: 0.2,
            skills_alignment: 0.1,
          },
        },
        average_scores: calculateAverageScores(rankedCandidates),
      },
      searchId: sessionResult.queryId || null,
    };

    console.log("FINAL RESPONSE", response);

    return Response.json(response, { status: 200 });
  } catch (error: any) {
    // Error handling...
  }
}
// 🎯 UPDATED: Average Scores Calculator
function calculateAverageScores(results: ScoredCandidate[]) {
  if (results.length === 0)
    return {
      semantic: 0,
      project_quality: 0,
      experience_relevance: 0,
      skills_alignment: 0,
      overall: 0,
    };

  return {
    semantic: Math.round(
      results.reduce((sum, r) => sum + r.semantic_match_score, 0) /
        results.length
    ),
    project_quality: Math.round(
      results.reduce((sum, r) => sum + r.project_quality_score, 0) /
        results.length
    ),
    experience_relevance: Math.round(
      results.reduce((sum, r) => sum + Number(r.experience_match), 0) /
        results.length
    ),
    skills_alignment: Math.round(
      results.reduce((sum, r) => sum + r.skill_match_percentage, 0) /
        results.length
    ),
    overall: Math.round(
      results.reduce((sum, r) => sum + r.overall_score, 0) / results.length
    ),
  };
}
