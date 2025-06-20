// app/api/questions/generate/route.ts - Separate endpoint for question generation
import {
  generateQuestionsForCandidate,
  QuestionGenerationRequest,
} from "@/engine/generateQuestions/geminiGenerateQuestions";

export async function POST(req: Request) {
  try {
    const body: QuestionGenerationRequest = await req.json();

    // Validate required fields
    if (!body.role || !body.candidateProfile || !body.assessmentConfig) {
      return Response.json(
        {
          error:
            "Missing required fields: role, candidateProfile, assessmentConfig",
        },
        { status: 400 }
      );
    }

    console.log(
      `🧠 Generating questions for ${body.candidateProfile.name} - ${body.role}`
    );

    const result = await generateQuestionsForCandidate(body);

    console.log(`✅ Generated ${result.total_questions} questions`);

    return Response.json(result);
  } catch (error: any) {
    console.error("❌ Question generation failed:", error);
    return Response.json(
      { error: "Failed to generate questions", details: error.message },
      { status: 500 }
    );
  }
}
