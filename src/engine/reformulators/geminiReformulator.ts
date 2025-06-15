import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_1!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface CandidateQuery {
  role: string;
  skills: string[];
  preferredLocations?: string[];
  title?: string;
  experience?: {
    min?: number;
    max?: number;
  };
  seniority?: string;
}

export async function geminiReformulator(
  userQuery: string
): Promise<CandidateQuery> {
  const chat = ai.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
        You are a JSON extractor that MUST capture ALL user requirements precisely.
        
        🔥 CRITICAL: ALWAYS extract experience requirements when mentioned!
        
        Experience patterns (MANDATORY to capture):
        - "1+ years" → "experience": {"min": 1}
        - "2+ years" → "experience": {"min": 2}  
        - "5+ years" → "experience": {"min": 5}
        - "3-5 years" → "experience": {"min": 3, "max": 5}
        - "junior" → "experience": {"min": 0, "max": 2}
        - "senior" → "experience": {"min": 5}
        - "entry level" → "experience": {"min": 0, "max": 1}
        
        Skills normalization:
        - React → reactjs
        - Node.js → nodejs
        - Python → python
        - TypeScript → typescript
        - Next.js → nextjs
        
        Location rules:
        - If NO location mentioned → "preferredLocations": ["remote"]
        - Only add specific locations if user mentions them
        - BANNED: "on-site", "hybrid", "flexible", "any"
        
        Required format examples:
        
        Input: "react developer with 1+ years"
        Output: {
          "role": "Developer",
          "skills": ["reactjs"],
          "experience": {"min": 1},
          "preferredLocations": ["remote"]
        }
        
        Input: "senior python engineer"
        Output: {
          "role": "Engineer", 
          "skills": ["python"],
          "seniority": "Senior",
          "experience": {"min": 5},
          "preferredLocations": ["remote"]
        }
        
        Input: "junior frontend developer in San Francisco"
        Output: {
          "role": "Developer",
          "skills": ["javascript", "html", "css"], 
          "seniority": "Junior",
          "experience": {"min": 0, "max": 2},
          "preferredLocations": ["San Francisco"]
        }
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          role: { type: Type.STRING },
          seniority: { type: Type.STRING },
          title: { type: Type.STRING },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          preferredLocations: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          experience: {
            type: Type.OBJECT,
            properties: {
              min: { type: Type.INTEGER },
              max: { type: Type.INTEGER },
            },
          },
        },
        required: ["role", "skills"],
      },
    },
  });

  const response = await chat.sendMessage({ message: userQuery });

  try {
    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }

    const json = JSON.parse(response.text);

    // 🔥 VALIDATION: Ensure experience extraction worked
    console.log("🧠 Reformulated Query:", JSON.stringify(json, null, 2));

    // Add debug logging for experience extraction
    if (userQuery.includes("year") || userQuery.includes("experience")) {
      if (!json.experience) {
        console.warn("⚠️ Experience mentioned in query but not extracted!", {
          query: userQuery,
          extracted: json,
        });
      }
    }

    return json;
  } catch (err) {
    console.error("Failed to parse Gemini response:", response.text);
    throw new Error("Invalid response format from Gemini.");
  }
}
