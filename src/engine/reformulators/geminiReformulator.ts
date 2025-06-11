import { GoogleGenAI, Type } from "@google/genai";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY_1!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface CandidateQuery {
  role: string;
  skills: string[];
  preferredLocations?: string;
  title?: string;
  experience?: {
    min?: number;
    max?: number;
  };
  seniority?: string;
  // mustHave?: string[];
}

export async function geminiReformulator(
  userQuery: string
): Promise<CandidateQuery> {
  const chat = ai.chats.create({
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: `
        You are a JSON extractor. Extract EXACTLY what the user says. 

        CRITICAL: If the user does not mention locations, ONLY include remote in your preferredLocations in your response.

        Valid response formats:

        Format 1 (Basic - no locations/experience):
        {
          "role": "Developer",
          "skills": ["reactjs"]
        }

        Format 2 (With locations):
        {
          "role": "Developer", 
          "skills": ["reactjs"],
          "preferredLocations": ["remote"]
        }

        Format 3 (With experience):
        {
          "role": "Developer",
          "skills": ["reactjs"],
          "experience": {"min": 1}
        }

        Format 4 (With multiple fields):
        {
          "role": "Senior Developer",
          "skills": ["reactjs", "nodejs"], 
          "preferredLocations": ["remote"],
          "experience": {"min": 3, "max": 5},
          "seniority": "Senior"
        }

        BANNED WORDS in preferredLocations: "on-site", "hybrid", "flexible", "any", "etc."

        Only add preferredLocations if user says words like: "remote", "San Francisco", "India", "New York"

        Skills normalization:
        - React → reactjs
        - Node.js → nodejs
        - Python → python

        Experience patterns:
        - "5+ years" → "experience": {"min": 5}
        - "3-5 years" → "experience": {"min": 3, "max": 5}
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
        },
        propertyOrdering: [
          "role",
          "seniority",
          "title",
          "skills",
          "preferredLocations",
        ],
        required: ["role", "skills"], // Only these are required
      },
    },
  });

  const response = await chat.sendMessage({ message: userQuery });

  try {
    // Parse and return JSON
    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }
    const json = JSON.parse(response.text);
    return json;
  } catch (err) {
    console.error("Failed to parse Gemini response as JSON:", response.text);
    throw new Error("Invalid response format from Gemini.");
  }
}
