import { GoogleGenAI, Type } from "@google/genai";
import { preparePDFForAIExtraction } from "@/lib/parsers/pdf-parser";

interface ExperienceEntry {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
}

export function calculateTotalExperience(experiences: ExperienceEntry[]): number {
  if (!experiences || experiences.length === 0) return 0;

  let totalMonths = 0;
  const currentDate = new Date();

  for (const exp of experiences) {
    const startDate = parseDate(exp.start_date);
    const endDate = exp.end_date.toLowerCase().includes('present') || 
                   exp.end_date.toLowerCase().includes('current')
      ? currentDate
      : parseDate(exp.end_date);

    if (!startDate || !endDate) {
      console.warn(`Invalid dates for ${exp.company}: ${exp.start_date} - ${exp.end_date}`);
      continue;
    }

    // Calculate months between dates
    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    const experienceMonths = yearDiff * 12 + monthDiff;

    // Add at least 1 month for any experience (handles same month start/end)
    totalMonths += Math.max(experienceMonths, 1);
  }

  // Convert to years and round to 1 decimal place
  const totalYears = Math.round((totalMonths / 12) * 10) / 10;
  return Math.max(totalYears, 0);
}

// Parse various date formats commonly found in resumes
function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  const cleanDate = dateStr.trim().toLowerCase();
  
  // Handle "present", "current", etc.
  if (cleanDate.includes('present') || cleanDate.includes('current')) {
    return new Date();
  }

  // Try different date formats
  const formats = [
    // "Jan 2023", "January 2023"
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})$/i,
    // "01/2023", "1/2023"  
    /^(\d{1,2})\/(\d{4})$/,
    // "2023-01", "2023-1"
    /^(\d{4})-(\d{1,2})$/,
    // Just year "2023"
    /^(\d{4})$/,
  ];

  const monthNames = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };

  for (const format of formats) {
    const match = cleanDate.match(format);
    if (match) {
      if (format === formats[0]) {
        // Month name format
        const monthStr = match[1].substring(0, 3);
        const month = monthNames[monthStr as keyof typeof monthNames];
        const year = parseInt(match[2]);
        return new Date(year, month, 1);
      } else if (format === formats[1]) {
        // MM/YYYY format
        const month = parseInt(match[1]) - 1; // 0-indexed
        const year = parseInt(match[2]);
        return new Date(year, month, 1);
      } else if (format === formats[2]) {
        // YYYY-MM format
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1; // 0-indexed
        return new Date(year, month, 1);
      } else if (format === formats[3]) {
        // Just year - assume January
        const year = parseInt(match[1]);
        return new Date(year, 0, 1);
      }
    }
  }

  // Fallback: try native Date parsing
  try {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

const GEMINI_API_KEY = process.env.GEMINI_API_KEY!;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

export interface CandidateProfile {
  full_name: string;
  linkedin_url: string;
  github_url: string;
  title: string;
  location: string;
  skills: string[];
  about: string;
  email: string;
  portfolio_url: string;
  project_urls: string[];
  blog_url: string;
  experience_years: number; // ADD THIS FIELD
  experience: {
    company: string;
    role: string;
    start_date: string;
    end_date: string;
    description: string;
  }[];
  education: {
    college_name: string;
    degree: string;
    start_date: string;
    end_date: string;
    cgpa: string;
    location: string;
  }[];
}

export async function enhancedGeminiExtractor(
  resumeText: string,
  extractedLinks: string[]
): Promise<CandidateProfile> {
  const chat = ai.chats.create({
    model: "gemini-1.5-flash",
    config: {
      systemInstruction: `
        You are PeopleGPT, an AI assistant that extracts structured candidate information from resumes. 

        CRITICAL: Pay special attention to date formatting for experience calculations.
        - Use consistent date formats: "Jan 2023", "Feb 2024", etc.
        - For current positions, use "present" as end_date
        - Ensure start_date comes before end_date chronologically
        - Extract ALL work experience, including internships, part-time roles, freelance work

        You will receive:
        1. Resume text (may contain special characters marking where links were)
        2. Array of extracted links from the PDF

        Your task is to intelligently categorize and assign these links to the appropriate fields:

        LINK CATEGORIZATION RULES:
        - linkedin_url: LinkedIn profile URL (linkedin.com/in/username format)
        - github_url: Main GitHub profile URL (github.com/username, NOT project repos)
        - portfolio_url: Personal portfolio/website (vercel.app, netlify.app, github.io, personal domains, or URLs with "portfolio" in them)
        - project_urls: Array of GitHub project repositories (github.com/username/project-name) - exclude the main profile
        - blog_url: Blog platform URLs (dev.to, medium.com, hashnode, substack, or URLs with "blog")
        - email: Extract from mailto: links or text

        EXPERIENCE EXTRACTION RULES:
        - Include ALL professional experience: full-time, part-time, internships, freelance, contract work
        - Use clear, consistent date formats: "Jan 2023", "Dec 2024", "present"
        - Extract role titles exactly as written
        - Include comprehensive job descriptions
        - Order experiences chronologically (most recent first)

        SKILL NORMALIZATION RULES (CRITICAL):
        - Convert ALL skills to lowercase, no spaces, no dots, no special characters
        - Examples: "React.js" -> "reactjs", "Node.JS" -> "nodejs", "C++" -> "cpp", "HTML/CSS" -> "htmlcss"

        Return a JSON object matching the exact schema provided.

        Additional Rules:
        - If no link matches a category, use empty string "" for single values or empty array [] for arrays
        - Normalize URLs by removing trailing slashes and unnecessary parameters
        - Skip school/vidyalaya entries in education
        - Dates should be normalized (e.g., "Jun 2025", "present")
        - The "about" field should be a comprehensive summary incorporating their background and work
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          full_name: { type: Type.STRING },
          linkedin_url: { type: Type.STRING },
          github_url: { type: Type.STRING },
          title: { type: Type.STRING },
          location: { type: Type.STRING },
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          about: { type: Type.STRING },
          email: { type: Type.STRING },
          portfolio_url: { type: Type.STRING },
          project_urls: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
          blog_url: { type: Type.STRING },
          experience: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                company: { type: Type.STRING },
                role: { type: Type.STRING },
                start_date: { type: Type.STRING },
                end_date: { type: Type.STRING },
                description: { type: Type.STRING },
              },
              required: [
                "company",
                "role",
                "start_date",
                "end_date",
                "description",
              ],
            },
          },
          education: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                college_name: { type: Type.STRING },
                degree: { type: Type.STRING },
                start_date: { type: Type.STRING },
                end_date: { type: Type.STRING },
                cgpa: { type: Type.STRING },
                location: { type: Type.STRING },
              },
              required: [
                "college_name",
                "degree",
                "start_date",
                "end_date",
                "cgpa",
                "location",
              ],
            },
          },
        },
        required: [
          "full_name",
          "title",
          "location",
          "skills",
          "about",
          "email",
          "portfolio_url",
          "project_urls",
          "blog_url",
          "experience",
          "education",
        ],
        additionalProperties: false,
      },
    },
  });

  const prompt = `
RESUME TEXT:
${resumeText}

EXTRACTED LINKS:
${extractedLinks.join("\n")}

Please extract and categorize all information according to the schema, paying special attention to correctly categorizing the provided links.
  `;

  const response = await chat.sendMessage({ message: prompt });

  try {
    if (!response.text) {
      throw new Error("Empty response from Gemini");
    }
    const json = JSON.parse(response.text);

    // Post-process to ensure data quality
    return validateAndEnhanceProfile(json, extractedLinks);
  } catch (err) {
    console.error("Failed to parse Gemini response as JSON:", response.text);
    throw new Error("Invalid response format from Gemini.");
  }
}

// Post-processing validation and cleanup
function validateAndEnhanceProfile(profile: any, originalLinks: string[]): CandidateProfile {
  // Ensure all required fields exist with proper defaults
  const cleaned: Omit<CandidateProfile, 'experience_years'> = {
    full_name: profile.full_name || "",
    linkedin_url: cleanUrl(profile.linkedin_url || ""),
    github_url: cleanUrl(profile.github_url || ""),
    title: profile.title || "",
    location: profile.location || "",
    skills: Array.isArray(profile.skills) ? profile.skills : [],
    about: profile.about || "",
    email: profile.email || "",
    portfolio_url: cleanUrl(profile.portfolio_url || ""),
    project_urls: Array.isArray(profile.project_urls) 
      ? profile.project_urls.map(cleanUrl).filter(Boolean)
      : [],
    blog_url: cleanUrl(profile.blog_url || ""),
    experience: Array.isArray(profile.experience) ? profile.experience : [],
    education: Array.isArray(profile.education) ? profile.education : [],
  };

  // CALCULATE EXPERIENCE YEARS
  const experienceYears = calculateTotalExperience(cleaned.experience);
  
  console.log(`Calculated ${experienceYears} years of experience for ${cleaned.full_name}`);
  console.log('Experience breakdown:', cleaned.experience.map(exp => 
    `${exp.company}: ${exp.start_date} - ${exp.end_date}`
  ));

  const enhancedProfile: CandidateProfile = {
    ...cleaned,
    experience_years: experienceYears
  };

  // Validate that assigned URLs actually exist in the extracted links
  const linkSet = new Set(originalLinks.map(link => link.toLowerCase()));
  
  if (enhancedProfile.linkedin_url && !linkSet.has(enhancedProfile.linkedin_url.toLowerCase())) {
    console.warn("LinkedIn URL not found in extracted links:", enhancedProfile.linkedin_url);
  }
  
  if (enhancedProfile.github_url && !linkSet.has(enhancedProfile.github_url.toLowerCase())) {
    console.warn("GitHub URL not found in extracted links:", enhancedProfile.github_url);
  }

  return enhancedProfile;
}

function cleanUrl(url: string): string {
  if (!url) return "";
  return url.trim().replace(/\/$/, ""); // Remove trailing slash
}

// Utility function to combine PDF processing with AI extraction
export async function processPDFResume(
  buffer: Buffer
): Promise<CandidateProfile> {
  // Import the PDF processing function

  const { enrichedText, extractedLinks } = await preparePDFForAIExtraction(
    buffer
  );

  return enhancedGeminiExtractor(enrichedText, extractedLinks);
}
