import { GoogleGenAI, Type } from "@google/genai";

// API Key distribution system
const GEMINI_API_KEYS = {
  AGENT_1: process.env.GEMINI_API_KEY_1!, // Basic info
  AGENT_2: process.env.GEMINI_API_KEY_2!, // Experience
  AGENT_3: process.env.GEMINI_API_KEY_3!, // Skills & Education
  AGENT_4: process.env.GEMINI_API_KEY_4!, // URLs
  AGENT_5: process.env.GEMINI_API_KEY_5!, // Projects
};

const API_KEY_ARRAY = [
  GEMINI_API_KEYS.AGENT_1,
  GEMINI_API_KEYS.AGENT_2,
  GEMINI_API_KEYS.AGENT_3,
  GEMINI_API_KEYS.AGENT_4,
  GEMINI_API_KEYS.AGENT_5,
];

// Rate limiting tracking
const API_USAGE_TRACKER = {
  AGENT_1: { count: 0, resetTime: Date.now() + 60000 },
  AGENT_2: { count: 0, resetTime: Date.now() + 60000 },
  AGENT_3: { count: 0, resetTime: Date.now() + 60000 },
  AGENT_4: { count: 0, resetTime: Date.now() + 60000 },
  AGENT_5: { count: 0, resetTime: Date.now() + 60000 },
};

export interface QuestionGenerationRequest {
  role: string;
  candidateProfile: {
    name: string;
    resume?: string;
    projects?: string[];
    skills: string[];
    experience_years?: number;
  };
  assessmentConfig: {
    difficulty_levels: {
      [key: string]: { count: number };
    };
    culture_questions: string[];
  };
}

export interface GeneratedQuestion {
  id: string;
  question: string;
  difficulty_level: string;
  category: "technical" | "culture";
  expected_focus: string;
}

export interface QuestionGenerationResponse {
  candidate_id: string;
  questions: GeneratedQuestion[];
  total_questions: number;
}

// Hardcoded assessment focus by difficulty level
const DIFFICULTY_FOCUS = {
  level_1: {
    focus: "basic_understanding",
    description:
      "Tests if candidate understands their own work and can explain basic concepts",
  },
  level_2: {
    focus: "implementation_details",
    description: "Explores how they built things and technical decision-making",
  },
  level_3: {
    focus: "problem_solving",
    description: "Challenges them with scenarios and edge cases",
  },
  level_4: {
    focus: "system_design",
    description: "Architecture decisions and scalability considerations",
  },
  level_5: {
    focus: "leadership_innovation",
    description: "Technical leadership and innovative thinking",
  },
};

// Multi-API Key Manager for Parallel Processing
interface APIKeyManager {
  keys: string[];
  keyUsage: Map<string, { requests: number; resetTime: number }>;
  currentKeyIndex: number;
}

class GeminiAPIManager {
  private keys: string[];
  private keyUsage: Map<string, { requests: number; resetTime: number }>;
  private maxRequestsPerMinute: number;

  constructor() {
    this.keys = [
      process.env.GEMINI_API_KEY_1!,
      process.env.GEMINI_API_KEY_2!,
      process.env.GEMINI_API_KEY_3!,
      process.env.GEMINI_API_KEY_4!,
      process.env.GEMINI_API_KEY_5!,
    ].filter(Boolean); // Remove any undefined keys

    this.maxRequestsPerMinute = 12; // Conservative buffer
    this.keyUsage = new Map();

    // Initialize usage tracking
    this.keys.forEach((key) => {
      this.keyUsage.set(key, { requests: 0, resetTime: Date.now() + 60000 });
    });
  }

  // Get next available API key with load balancing
  getAvailableKey(): string {
    const now = Date.now();

    // Reset counters for keys past their reset time
    this.keyUsage.forEach((usage, key) => {
      if (now >= usage.resetTime) {
        usage.requests = 0;
        usage.resetTime = now + 60000; // Reset for next minute
      }
    });

    // Find key with lowest usage that's under limit
    let bestKey = this.keys[0];
    let lowestUsage = this.keyUsage.get(bestKey)!.requests;

    for (const key of this.keys) {
      const usage = this.keyUsage.get(key)!;
      if (
        usage.requests < this.maxRequestsPerMinute &&
        usage.requests < lowestUsage
      ) {
        bestKey = key;
        lowestUsage = usage.requests;
      }
    }

    // Increment usage
    const usage = this.keyUsage.get(bestKey)!;
    usage.requests++;

    return bestKey;
  }

  // Check if any keys are available
  hasAvailableKey(): boolean {
    const now = Date.now();

    return this.keys.some((key) => {
      const usage = this.keyUsage.get(key)!;
      // Reset if past reset time
      if (now >= usage.resetTime) {
        return true;
      }
      return usage.requests < this.maxRequestsPerMinute;
    });
  }

  // Wait for next available key
  async waitForAvailableKey(): Promise<string> {
    while (!this.hasAvailableKey()) {
      console.log("⏳ All API keys at limit, waiting 5 seconds...");
      await new Promise((resolve) => setTimeout(resolve, 5000));
    }
    return this.getAvailableKey();
  }

  // Get usage stats for monitoring
  getUsageStats() {
    const stats = Array.from(this.keyUsage.entries()).map(([key, usage]) => ({
      key: key.substring(0, 10) + "...", // Partial key for logging
      requests: usage.requests,
      resetTime: new Date(usage.resetTime).toISOString(),
    }));

    return {
      totalKeys: this.keys.length,
      keyStats: stats,
      totalRequests: stats.reduce((sum, stat) => sum + stat.requests, 0),
    };
  }
}

// Singleton instance
const apiManager = new GeminiAPIManager();

// Enhanced function with API key distribution
export async function generateQuestionsForCandidate(
  request: QuestionGenerationRequest
): Promise<QuestionGenerationResponse> {
  const { role, candidateProfile, assessmentConfig } = request;

  console.log(`🧠 Generating questions for ${candidateProfile.name}`);
  console.log("📊 API Usage:", apiManager.getUsageStats());

  try {
    // Generate technical questions for each difficulty level IN PARALLEL
    const technicalPromises: Promise<GeneratedQuestion[]>[] = [];

    for (const [level, config] of Object.entries(
      assessmentConfig.difficulty_levels
    )) {
      if (config.count > 0) {
        const promise = generateTechnicalQuestions({
          role,
          candidateProfile,
          difficulty_level: level,
          question_count: config.count,
          focus: DIFFICULTY_FOCUS[level as keyof typeof DIFFICULTY_FOCUS],
        });
        technicalPromises.push(promise);
      }
    }

    // Execute all technical question generation in parallel
    const technicalQuestionArrays = await Promise.all(technicalPromises);
    const technicalQuestions = technicalQuestionArrays.flat();

    // Add culture questions (already provided)
    const cultureQuestions: GeneratedQuestion[] =
      assessmentConfig.culture_questions.map((question, index) => ({
        id: `culture_${index + 1}`,
        question,
        difficulty_level: "standard",
        category: "culture" as const,
        expected_focus: "cultural_fit",
      }));

    const allQuestions = [...technicalQuestions, ...cultureQuestions];

    console.log(
      `✅ Generated ${allQuestions.length} total questions for ${candidateProfile.name}`
    );

    return {
      candidate_id: candidateProfile.name,
      questions: allQuestions,
      total_questions: allQuestions.length,
    };
  } catch (error: any) {
    console.error(
      `❌ Question generation failed for ${candidateProfile.name}:`,
      error
    );
    throw new Error(`Question generation failed: ${error.message}`);
  }
}

// Get the best available API key
function getBestAvailableApiKey(preferredIndex: number): {
  apiKey: string;
  index: number;
} {
  const now = Date.now();
  const trackerKeys = Object.keys(API_USAGE_TRACKER) as Array<
    keyof typeof API_USAGE_TRACKER
  >;

  // Reset counters if time has passed
  trackerKeys.forEach((key) => {
    if (now > API_USAGE_TRACKER[key].resetTime) {
      API_USAGE_TRACKER[key].count = 0;
      API_USAGE_TRACKER[key].resetTime = now + 60000; // Reset every minute
    }
  });

  // Try preferred API key first
  const preferredKey = trackerKeys[preferredIndex];
  if (API_USAGE_TRACKER[preferredKey].count < 12) {
    // Leave 3 buffer out of 15
    API_USAGE_TRACKER[preferredKey].count++;
    return { apiKey: API_KEY_ARRAY[preferredIndex], index: preferredIndex };
  }

  // Find any available API key
  for (let i = 0; i < trackerKeys.length; i++) {
    const key = trackerKeys[i];
    if (API_USAGE_TRACKER[key].count < 12) {
      API_USAGE_TRACKER[key].count++;
      return { apiKey: API_KEY_ARRAY[i], index: i };
    }
  }

  // If all are at limit, use the preferred one anyway (with warning)
  console.warn(
    `⚠️ All API keys at limit, using preferred key ${preferredIndex + 1}`
  );
  API_USAGE_TRACKER[preferredKey].count++;
  return { apiKey: API_KEY_ARRAY[preferredIndex], index: preferredIndex };
}

async function generateTechnicalQuestions({
  role,
  candidateProfile,
  difficulty_level,
  question_count,
  focus,
}: {
  role: string;
  candidateProfile: QuestionGenerationRequest["candidateProfile"];
  difficulty_level: string;
  question_count: number;
  focus: (typeof DIFFICULTY_FOCUS)[keyof typeof DIFFICULTY_FOCUS];
}): Promise<GeneratedQuestion[]> {
  const projectContext =
    candidateProfile.projects?.join("\n") || "No specific projects mentioned";
  const skillsContext = candidateProfile.skills.join(", ");

  // Get available API key from manager
  const apiKey = await apiManager.waitForAvailableKey();
  console.log(
    `🔑 Using API key for ${difficulty_level} questions (${candidateProfile.name})`
  );

  const ai = new GoogleGenAI({ apiKey });

  const chat = ai.chats.create({
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: `
        You are an expert technical interviewer generating personalized assessment questions.
        
        DIFFICULTY LEVEL: ${difficulty_level}
        FOCUS: ${focus.focus} - ${focus.description}
        
        RULES:
        1. Generate EXACTLY ${question_count} questions
        2. Questions must be specific to the candidate's background
        3. Questions should test ${focus.focus} as described
        4. Make questions conversational but probing
        5. Reference their actual projects/experience when possible
        6. Avoid generic "tell me about yourself" questions
        
        DIFFICULTY GUIDELINES:
        - Level 1: Basic understanding, can they explain what they built?
        - Level 2: Implementation details, technical choices they made
        - Level 3: Problem-solving, how would they handle challenges?
        - Level 4: System design, architecture and scalability
        - Level 5: Leadership, innovation, complex technical scenarios
        
        Return as JSON array of objects with:
        - question: string (the actual question)
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING },
          },
          required: ["question"],
        },
      },
    },
  });

  const prompt = `
    ROLE: ${role}
    CANDIDATE PROFILE:
    - Skills: ${skillsContext}
    - Experience: ${candidateProfile.experience_years || "Not specified"} years
    - Projects: ${projectContext}
    
    Generate ${question_count} personalized questions for ${difficulty_level} difficulty focusing on ${
    focus.focus
  }.
  `;

  try {
    const response = await chat.sendMessage({ message: prompt });

    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const questions = JSON.parse(response.text);

    console.log(
      `✅ Generated ${questions.length} ${difficulty_level} questions`
    );

    return questions.map((q: any, index: number) => ({
      id: `${difficulty_level}_${index + 1}`,
      question: q.question,
      difficulty_level,
      category: "technical" as const,
      expected_focus: focus.focus,
    }));
  } catch (error: any) {
    console.error(
      `❌ Failed to generate questions for ${difficulty_level}:`,
      error
    );
    throw new Error(
      `Failed to generate questions for ${difficulty_level}: ${error.message}`
    );
  }
}

// Export the manager for monitoring
export { apiManager };

// Utility function to check API usage status
export function getApiUsageStatus() {
  const now = Date.now();
  return Object.entries(API_USAGE_TRACKER).map(([key, tracker], index) => ({
    apiKey: index + 1,
    usage: tracker.count,
    limit: 12,
    available: 12 - tracker.count,
    resetIn: Math.max(0, tracker.resetTime - now),
  }));
}

// Utility function to reset all counters (for testing)
export function resetApiUsageCounters() {
  Object.keys(API_USAGE_TRACKER).forEach((key) => {
    API_USAGE_TRACKER[key as keyof typeof API_USAGE_TRACKER].count = 0;
    API_USAGE_TRACKER[key as keyof typeof API_USAGE_TRACKER].resetTime =
      Date.now() + 60000;
  });
  console.log("🔄 All API usage counters reset");
}
