import { GoogleGenAI } from "@google/genai";

// AI Configuration
const GEMINI_API_KEYS = {
  TECHNICAL_ANALYZER: process.env.GEMINI_API_KEY_1!,
  COMMUNICATION_ANALYZER: process.env.GEMINI_API_KEY_2!,
  ICP_MATCHER: process.env.GEMINI_API_KEY_3!,
};

const technicalAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEYS.TECHNICAL_ANALYZER,
});
const communicationAI = new GoogleGenAI({
  apiKey: GEMINI_API_KEYS.COMMUNICATION_ANALYZER,
});
const icpAI = new GoogleGenAI({ apiKey: GEMINI_API_KEYS.ICP_MATCHER });

// Types
interface ICPProfile {
  technicalExpectations: {
    mustHave: string[];
    minimumLevel: string;
    preferredDepth: string[];
  };
  communicationStyle: {
    preferred: string;
    clientFacing: boolean;
    teachingAbility: string;
  };
  problemSolvingApproach: {
    preferred: string;
    innovationBalance: number;
    edgeCaseImportance: string;
  };
  growthProfile: {
    currentLevel: string;
    learningAgility: string;
    leadershipPotential: string;
  };
}

interface InterviewData {
  candidateId: string;
  candidateName: string;
  qaResponses: Array<{
    question: string;
    answer: string;
    questionIndex: number;
    answeredAt: string;
  }>;
}

interface TechnicalAnalysis {
  score: number;
  level: number;
  strengths: string[];
  concerns: string[];
  insights: string[];
  dealbreakers: string[];
}

interface CommunicationAnalysis {
  score: number;
  strengths: string[];
  concerns: string[];
  insights: string[];
}

interface ICPAnalysis {
  alignmentScore: number;
  technicalFit: number;
  communicationFit: number;
  problemSolvingFit: number;
  growthFit: number;
  insights: string[];
}

interface CandidateAnalysis {
  candidateId: string;
  technicalScore: number;
  communicationScore: number;
  icpAlignment: number;
  finalRanking: number;
  insights: string[];
  strengths: string[];
  concerns: string[];
}

// Main AI Analysis Hook
export async function analyzeCandidateInterview(
  interview: any,
  icpProfile: ICPProfile
): Promise<CandidateAnalysis> {
  // Prepare interview data for AI
  const interviewData: InterviewData = {
    candidateId: interview.candidates.id,
    candidateName: interview.candidates.full_name,
    qaResponses: interview.interview_messages
      .filter((msg: any) => msg.answer && msg.answer.trim()) // Only answered questions
      .map((msg: any) => ({
        question: msg.question,
        answer: msg.answer,
        questionIndex: msg.question_index,
        answeredAt: msg.answer_timestamp,
      })),
  };

  try {
    // Run parallel AI analyses
    const [technicalAnalysis, communicationAnalysis, icpAnalysis] =
      await Promise.all([
        analyzeTechnicalSkills(interviewData),
        analyzeCommunicationSkills(interviewData),
        analyzeICPAlignment(interviewData, icpProfile),
      ]);

    // Calculate final ranking
    const finalRanking = calculateFinalRanking(
      technicalAnalysis,
      communicationAnalysis,
      icpAnalysis
    );

    return {
      candidateId: interview.candidates.id,
      technicalScore: technicalAnalysis.score,
      communicationScore: communicationAnalysis.score,
      icpAlignment: icpAnalysis.alignmentScore,
      finalRanking,
      insights: [
        ...technicalAnalysis.insights,
        ...communicationAnalysis.insights,
        ...icpAnalysis.insights,
      ],
      strengths: [
        ...technicalAnalysis.strengths,
        ...communicationAnalysis.strengths,
      ],
      concerns: [
        ...technicalAnalysis.concerns,
        ...communicationAnalysis.concerns,
      ],
    };
  } catch (error: any) {
    console.error(
      `❌ Failed to analyze candidate ${interview.candidates?.id}:`,
      error
    );
    throw new Error(
      `AI analysis failed for candidate ${interview.candidates?.full_name}: ${error.message}`
    );
  }
}

// Technical Skills Analysis
async function analyzeTechnicalSkills(
  interviewData: InterviewData
): Promise<TechnicalAnalysis> {
  const chat = technicalAI.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
You are a SENIOR TECHNICAL HIRING MANAGER with 10+ years of experience identifying talent.

CORE PHILOSOPHY: 
- Separate COMPETENCE from COMMUNICATION style
- Look for EVIDENCE of technical thinking, not just polished explanations
- Consider CONTEXT - junior candidates show potential differently than seniors
- DEPTH matters more than breadth - one deep insight > many surface-level mentions

SCORING CALIBRATION (0-1 scale):
- 0.0-0.2: Cannot demonstrate basic technical competence
- 0.2-0.4: Shows some technical awareness but major gaps
- 0.4-0.6: Solid technical foundation with room for growth
- 0.6-0.8: Strong technical competence, can contribute independently  
- 0.8-1.0: Exceptional technical insight, would elevate the team

EVIDENCE HIERARCHY (what to look for):
1. PROBLEM-SOLVING INDICATORS:
   - Mentions edge cases or error scenarios
   - Discusses trade-offs between approaches
   - Shows awareness of system interactions
   - Demonstrates debugging methodology

2. TECHNICAL DEPTH SIGNALS:
   - Specific technology choices with reasoning
   - Performance or scalability considerations
   - Testing or validation approaches
   - Architecture or design patterns

3. LEARNING INDICATORS:
   - Mentions what they learned from challenges
   - Shows evolution in their approach
   - Demonstrates curiosity about underlying mechanisms
   - Asks clarifying questions (if applicable)

RED FLAGS (but not auto-disqualifiers):
- Buzzword usage without substance
- Cannot explain their own code/projects
- No mention of testing, errors, or edge cases
- Claims expertise in everything

CRITICAL: A candidate who says "I used React hooks to manage state efficiently" 
shows more technical competence than one who gives a textbook definition of hooks.
Look for APPLIED knowledge, not academic recitation.

COMPETENCY CALIBRATION:
- Level 1: Can implement basic features with guidance
- Level 2: Understands system interactions, handles edge cases
- Level 3: Designs solutions, considers trade-offs, mentors others
- Level 4: Architects systems, drives technical decisions
- Level 5: Technical visionary, solves complex problems others can't

SCORING EXAMPLES:
- "I built a login system" (basic) = 0.2-0.4
- "I built a login system with JWT tokens and refresh logic" (applied) = 0.4-0.6  
- "I built auth with JWT, handled token refresh, and added rate limiting for security" (systematic) = 0.6-0.8
- "I designed a microservices auth system with OAuth flows, implemented distributed session management, and built monitoring for security events" (advanced) = 0.8-1.0
`,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          score: { type: "number" }, // 0-1 scale, BE HARSH
          level: { type: "number" }, // 1-5 competency level
          strengths: { type: "array", items: { type: "string" } },
          concerns: { type: "array", items: { type: "string" } },
          insights: { type: "array", items: { type: "string" } },
          dealbreakers: { type: "array", items: { type: "string" } }, // NEW: Absolute no-gos
        },
        required: [
          "score",
          "level",
          "strengths",
          "concerns",
          "insights",
          "dealbreakers",
        ],
      },
    },
  });

  try {
    const response = await chat.sendMessage({
      message: `Analyze technical competency for ${interviewData.candidateName}:
      
      ${interviewData.qaResponses
        .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}\n---`)
        .join("\n")}`,
    });

    if (!response.text) {
      throw new Error("Empty response from Technical AI");
    }

    console.log(
      `✅ Technical analysis completed for ${interviewData.candidateName}`
    );
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error(
      `❌ Technical analysis failed for ${interviewData.candidateName}:`,
      error
    );
    throw new Error(`Technical analysis failed: ${error.message}`);
  }
}

// Communication Skills Analysis
async function analyzeCommunicationSkills(
  interviewData: InterviewData
): Promise<CommunicationAnalysis> {
  const chat = communicationAI.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
You are evaluating COMMUNICATION EFFECTIVENESS for professional software development roles.

CORE PHILOSOPHY:
- CLARITY over eloquence - can they be understood?
- SUBSTANCE over style - do they convey meaningful information?
- CONTEXT AWARENESS - appropriate for the situation?
- TEACHING ABILITY - can they explain complex concepts?

COMMUNICATION SCORING (0-1 scale):
- 0.0-0.2: Cannot effectively communicate technical concepts
- 0.2-0.4: Basic communication with significant clarity issues
- 0.4-0.6: Adequate communication for internal work
- 0.6-0.8: Clear, professional communication suitable for clients
- 0.8-1.0: Exceptional communicator, builds understanding and trust

EVALUATION FRAMEWORK:

1. CLARITY INDICATORS:
   - Logical flow of ideas
   - Specific examples when explaining concepts
   - Appropriate level of detail for the audience
   - Clear cause-and-effect relationships

2. COMPLETENESS SIGNALS:
   - Actually answers the question asked
   - Provides relevant context
   - Acknowledges limitations or unknowns
   - Follows up with implications or next steps

3. PROFESSIONALISM MARKERS:
   - Appropriate tone for business context
   - Respectful language
   - Organized presentation of ideas
   - Confidence without arrogance

4. TEACHING ABILITY:
   - Breaks down complex topics
   - Uses analogies or examples
   - Checks for understanding
   - Adapts explanation to audience level

COMMUNICATION PATTERNS TO RECOGNIZE:

POSITIVE PATTERNS:
- "I used X because Y, which solved Z problem"
- "The main challenge was A, so I tried B approach"
- "I learned that C doesn't work in D situations"
- "The trade-off was between E and F, I chose E because..."

CONCERNING PATTERNS:
- Circular explanations that don't add information
- Overuse of buzzwords without substance
- Cannot explain their own work
- Consistently vague or incomplete responses

SCORING EXAMPLES:
- "It was cool to work with React" (vague) = 0.2-0.4
- "React's component structure made the UI easier to maintain" (clear) = 0.4-0.6
- "I chose React because the component reusability reduced our development time by 30%" (specific) = 0.6-0.8
- "I implemented React with custom hooks for state management, which improved our team's ability to maintain consistent UX patterns across features" (comprehensive) = 0.8-1.0

CRITICAL: Don't penalize informal language if the CONTENT is solid.
"It was cool to work with" followed by substantive explanation shows enthusiasm + competence.
`,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          score: { type: "number" },
          strengths: { type: "array", items: { type: "string" } },
          concerns: { type: "array", items: { type: "string" } },
          insights: { type: "array", items: { type: "string" } },
          clientReadiness: { type: "number" }, // NEW: 0-1 scale for client-facing work
        },
        required: [
          "score",
          "strengths",
          "concerns",
          "insights",
          "clientReadiness",
        ],
      },
    },
  });

  try {
    const response = await chat.sendMessage({
      message: `Analyze communication skills for ${interviewData.candidateName}:
      
      ${interviewData.qaResponses
        .map((qa) => `Q: ${qa.question}\nA: ${qa.answer}\n---`)
        .join("\n")}`,
    });

    if (!response.text) {
      throw new Error("Empty response from Communication AI");
    }

    console.log(
      `✅ Communication analysis completed for ${interviewData.candidateName}`
    );
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error(
      `❌ Communication analysis failed for ${interviewData.candidateName}:`,
      error
    );
    throw new Error(`Communication analysis failed: ${error.message}`);
  }
}

// ICP Alignment Analysis
async function analyzeICPAlignment(
  interviewData: InterviewData,
  icpProfile: ICPProfile
): Promise<ICPAnalysis> {
  const chat = icpAI.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
You are an ICP ALIGNMENT SPECIALIST focused on OBJECTIVE PATTERN MATCHING.

CORE PHILOSOPHY:
- EVIDENCE-BASED assessment - what can you prove from their responses?
- ROLE-SPECIFIC matching - how well do they fit THIS specific role?  
- POTENTIAL vs. CURRENT STATE - are they ready now or could they be soon?
- RISK ASSESSMENT - what are the likelihood and impact of gaps?

ICP ALIGNMENT SCORING (0-1 scale):
- 0.0-0.2: Fundamental misalignment, high risk of failure
- 0.2-0.4: Significant gaps requiring extensive support
- 0.4-0.6: Adequate fit with manageable development needs
- 0.6-0.8: Strong alignment, low risk of role mismatch
- 0.8-1.0: Exceptional fit, exceeds requirements

EVALUATION METHODOLOGY:

1. MUST-HAVE TECHNICAL SKILLS (35% weight):
   - Direct evidence of each required skill
   - Depth of application (not just familiarity)
   - Problem-solving approach within those skills
   - Growth trajectory in technical areas

2. COMMUNICATION ALIGNMENT (25% weight):
   - Match between their natural style and role needs
   - Client-facing readiness (if required)
   - Ability to explain complex concepts
   - Professional presentation skills

3. PROBLEM-SOLVING APPROACH (25% weight):
   - Methodology alignment (systematic vs. intuitive)
   - Innovation balance (creative vs. methodical)
   - Risk awareness and mitigation
   - Edge case consideration

4. GROWTH TRAJECTORY (15% weight):
   - Current level vs. role requirements
   - Learning agility evidence
   - Leadership potential (if needed)
   - Career progression alignment

PATTERN RECOGNITION GUIDELINES:

STRONG ALIGNMENT SIGNALS:
- Uses required technologies in context
- Demonstrates preferred problem-solving approach
- Shows awareness of role-specific challenges
- Natural communication style matches needs

CONCERNING MISALIGNMENT:
- Cannot demonstrate must-have skills
- Problem-solving approach conflicts with role needs
- Communication style inappropriate for client work
- Experience level significantly below requirements

SCORING LOGIC:
- Start with baseline competence assessment
- Add points for strong alignment evidence
- Subtract points for critical gaps
- Weight by importance to role success

CRITICAL: Focus on PREDICTIVE VALIDITY - how likely is this person to succeed in THIS role?
A perfect candidate for Role A might be wrong for Role B. Context is everything.
`,
      responseMimeType: "application/json",
      responseSchema: {
        type: "object",
        properties: {
          alignmentScore: { type: "number" },
          technicalFit: { type: "number" },
          communicationFit: { type: "number" },
          problemSolvingFit: { type: "number" },
          growthFit: { type: "number" },
          insights: { type: "array", items: { type: "string" } },
          criticalGaps: { type: "array", items: { type: "string" } }, // NEW
          evidenceFound: { type: "array", items: { type: "string" } }, // NEW
          wouldRecommend: { type: "boolean" }, // NEW: Clear hire/no-hire
          riskFactors: { type: "array", items: { type: "string" } }, // NEW
        },
        required: [
          "alignmentScore",
          "technicalFit",
          "communicationFit",
          "problemSolvingFit",
          "growthFit",
          "insights",
          "criticalGaps",
          "evidenceFound",
          "wouldRecommend",
          "riskFactors",
        ],
      },
    },
  });

  try {
    const response = await chat.sendMessage({
      message: `
      ANALYZE ICP ALIGNMENT FOR: ${interviewData.candidateName}
      
      CLIENT'S EXACT REQUIREMENTS:
      ${JSON.stringify(icpProfile, null, 2)}
      
      CANDIDATE'S INTERVIEW RESPONSES:
      ${interviewData.qaResponses
        .map(
          (qa, index) => `
        QUESTION ${index + 1}: ${qa.question}
        ANSWER: "${qa.answer}"
        WORD COUNT: ${qa.answer.split(" ").length}
        ---`
        )
        .join("\n")}
      
      CRITICAL ASSESSMENT NEEDED:
      - Does this candidate have the MUST-HAVE skills? (Provide evidence)
      - Can they handle ${
        icpProfile.communicationStyle.preferred
      } communication with clients?
      - Do they demonstrate ${
        icpProfile.problemSolvingApproach.preferred
      } problem-solving?
      - Are they at ${icpProfile.growthProfile.currentLevel} level as required?
      
      Remember: Vague answers = No evidence = Low alignment score
      `,
    });

    if (!response.text) {
      throw new Error("Empty response from ICP AI");
    }

    console.log(`✅ ICP analysis completed for ${interviewData.candidateName}`);
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error(
      `❌ ICP analysis failed for ${interviewData.candidateName}:`,
      error
    );
    throw new Error(`ICP analysis failed: ${error.message}`);
  }
}

// Final Ranking Calculation
interface QualificationThresholds {
  minimumTechnicalScore: number;
  minimumCommunicationScore: number;
  minimumICPAlignment: number;
  dealBreakerPenalty: number; // Subtract this for each dealbreaker
}

function calculateFinalRanking(
  technical: TechnicalAnalysis,
  communication: CommunicationAnalysis,
  icp: ICPAnalysis,
  thresholds: QualificationThresholds = {
    minimumTechnicalScore: 0.25,
    minimumCommunicationScore: 0.35,
    minimumICPAlignment: 0.3,
    dealBreakerPenalty: 0.15,
  }
): number {
  // Weighted scoring - no early returns, always calculate
  const weights = {
    technical: 0.4,
    communication: 0.25,
    icpAlignment: 0.35,
  };

  let baseScore =
    technical.score * weights.technical +
    communication.score * weights.communication +
    icp.alignmentScore * weights.icpAlignment;

  // Bonus for exceptional performance in any area
  const exceptionalBonus = Math.max(
    technical.score > 0.8 ? 0.05 : 0,
    communication.score > 0.8 ? 0.03 : 0,
    icp.alignmentScore > 0.8 ? 0.04 : 0
  );

  baseScore += exceptionalBonus;
  console.log("before dealbreakers base score", baseScore);

  // Apply dealbreaker penalties
  // const dealBreakerCount = technical.dealbreakers?.length || 0;
  // baseScore = Math.max(
  //   0,
  //   baseScore - dealBreakerCount * thresholds.dealBreakerPenalty
  // );

  // Always return a score between 0 and 1
  console.log("final base score", baseScore);
  return Math.min(1.0, Math.max(0, baseScore));
}

// Batch Analysis Hook for Multiple Candidates
export async function analyzeBatchCandidates(
  interviews: any[],
  icpProfile: ICPProfile
): Promise<CandidateAnalysis[]> {
  const candidateAnalyses: CandidateAnalysis[] = [];

  console.log(`🚀 Starting batch analysis for ${interviews.length} candidates`);

  for (const interview of interviews) {
    try {
      const analysis = await analyzeCandidateInterview(interview, icpProfile);
      candidateAnalyses.push(analysis);
      console.log(
        `✅ Completed analysis for ${interview.candidates?.full_name}`
      );
    } catch (error) {
      console.error(
        `❌ Failed to analyze candidate ${interview.candidates?.id}:`,
        error
      );
      // Continue with other candidates instead of failing the entire batch
    }
  }

  console.log(
    `🎯 Batch analysis completed: ${candidateAnalyses.length}/${interviews.length} successful`
  );
  return candidateAnalyses;
}

// Default ICP Profile
export function getDefaultICP(): ICPProfile {
  return {
    technicalExpectations: {
      mustHave: ["error_handling", "testing_mindset", "debugging"],
      minimumLevel: "level_2",
      preferredDepth: ["system_design", "performance_optimization"],
    },
    communicationStyle: {
      preferred: "detailed_thorough",
      clientFacing: true,
      teachingAbility: "medium",
    },
    problemSolvingApproach: {
      preferred: "systematic_methodical",
      innovationBalance: 0.7,
      edgeCaseImportance: "medium",
    },
    growthProfile: {
      currentLevel: "mid_level",
      learningAgility: "high",
      leadershipPotential: "optional",
    },
  };
}
