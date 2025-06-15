import { GoogleGenAI, Type } from "@google/genai";
import { preparePDFForAIExtraction } from "@/lib/parsers/pdf-parser";

interface ExperienceEntry {
  company: string;
  role: string;
  start_date: string;
  end_date: string;
  description: string;
}

export interface ProjectEntry {
  project_name: string;
  description: string;
  technologies: string[];
  github_url?: string;
  live_url?: string;
}

export function calculateTotalExperience(
  experiences: ExperienceEntry[]
): number {
  if (!experiences || experiences.length === 0) return 0;

  let totalMonths = 0;
  const currentDate = new Date();

  for (const exp of experiences) {
    const startDate = parseDate(exp.start_date);
    const endDate =
      exp.end_date.toLowerCase().includes("present") ||
      exp.end_date.toLowerCase().includes("current")
        ? currentDate
        : parseDate(exp.end_date);

    if (!startDate || !endDate) {
      console.warn(
        `Invalid dates for ${exp.company}: ${exp.start_date} - ${exp.end_date}`
      );
      continue;
    }

    const yearDiff = endDate.getFullYear() - startDate.getFullYear();
    const monthDiff = endDate.getMonth() - startDate.getMonth();
    const experienceMonths = yearDiff * 12 + monthDiff;

    totalMonths += Math.max(experienceMonths, 1);
  }

  const totalYears = Math.round((totalMonths / 12) * 10) / 10;
  return Math.max(totalYears, 0);
}

function parseDate(dateStr: string): Date | null {
  if (!dateStr) return null;

  const cleanDate = dateStr.trim().toLowerCase();

  if (cleanDate.includes("present") || cleanDate.includes("current")) {
    return new Date();
  }

  const formats = [
    /^(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})$/i,
    /^(\d{1,2})\/(\d{4})$/,
    /^(\d{4})-(\d{1,2})$/,
    /^(\d{4})$/,
  ];

  const monthNames = {
    jan: 0,
    feb: 1,
    mar: 2,
    apr: 3,
    may: 4,
    jun: 5,
    jul: 6,
    aug: 7,
    sep: 8,
    oct: 9,
    nov: 10,
    dec: 11,
  };

  for (const format of formats) {
    const match = cleanDate.match(format);
    if (match) {
      if (format === formats[0]) {
        const monthStr = match[1].substring(0, 3);
        const month = monthNames[monthStr as keyof typeof monthNames];
        const year = parseInt(match[2]);
        return new Date(year, month, 1);
      } else if (format === formats[1]) {
        const month = parseInt(match[1]) - 1;
        const year = parseInt(match[2]);
        return new Date(year, month, 1);
      } else if (format === formats[2]) {
        const year = parseInt(match[1]);
        const month = parseInt(match[2]) - 1;
        return new Date(year, month, 1);
      } else if (format === formats[3]) {
        const year = parseInt(match[1]);
        return new Date(year, 0, 1);
      }
    }
  }

  try {
    const parsed = new Date(dateStr);
    return isNaN(parsed.getTime()) ? null : parsed;
  } catch {
    return null;
  }
}

const GEMINI_API_KEYS = {
  AGENT_1: process.env.GEMINI_API_KEY_1!, // Basic info
  AGENT_2: process.env.GEMINI_API_KEY_2!, // Experience
  AGENT_3: process.env.GEMINI_API_KEY_3!, // Skills & Education
  AGENT_4: process.env.GEMINI_API_KEY_4!, // URLs
  AGENT_5: process.env.GEMINI_API_KEY_5!, // Projects
};

const ai1 = new GoogleGenAI({ apiKey: GEMINI_API_KEYS.AGENT_1 });
const ai2 = new GoogleGenAI({ apiKey: GEMINI_API_KEYS.AGENT_2 });
const ai3 = new GoogleGenAI({ apiKey: GEMINI_API_KEYS.AGENT_3 });
const ai4 = new GoogleGenAI({ apiKey: GEMINI_API_KEYS.AGENT_4 });
const ai5 = new GoogleGenAI({ apiKey: GEMINI_API_KEYS.AGENT_5 });

// AGENT 1: RECRUITER'S HONEST ASSESSMENT EXTRACTOR
async function extractBasicInfo(resumeText: string) {
  const chat = ai1.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
        You are a senior technical recruiter with 10+ years of experience. Your job is to provide an HONEST, UNBIASED assessment of this candidate that would actually help in hiring decisions.

        Extract:
        - Full name (properly capitalized)
        - Email address (valid format)
        - Location (clean format)
        - Professional title/role (their actual current/target role)
        - Recruiter's honest assessment (THIS IS CRITICAL)

        For the ABOUT (RECRUITER'S ASSESSMENT), be brutally honest and specific:
        - What's their actual experience level? (Junior/Mid/Senior/Principal)
        - What are their strongest technical skills based on real projects?
        - What gaps or weaknesses do you see?
        - Are they a generalist or specialist? In what?
        - What type of companies/roles would they be a good fit for?
        - Any red flags or concerns?
        - What makes them stand out (if anything)?
        - Career trajectory - are they growing or stagnant?

        TONE: Professional but honest. Think like you're briefing a hiring manager.
        LENGTH: 4-6 sentences that actually matter.
        AVOID: Generic buzzwords, fluff, or marketing speak.

        Example good assessment:
        "Mid-level full-stack developer with 3+ years focused on React/Node.js. Strong frontend skills evident from multiple production projects, but backend experience seems limited to basic CRUD operations. Has worked at early-stage startups, shows initiative in learning new technologies quickly. Lacks enterprise-scale experience and system design knowledge. Good fit for growth-stage companies needing versatile developers, but would struggle in senior architect roles. Career trajectory shows consistent upward movement."

        Example bad assessment:
        "Passionate software engineer with expertise in modern technologies and a drive for innovation."
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          full_name: { type: Type.STRING },
          email: { type: Type.STRING },
          location: { type: Type.STRING },
          title: { type: Type.STRING },
          about: { type: Type.STRING },
        },
        required: ["full_name", "email", "location", "title", "about"],
        additionalProperties: false,
      },
    },
  });

  const response = await chat.sendMessage({
    message: `Analyze this resume from a recruiter's perspective:\n\n${resumeText}`,
  });

  return JSON.parse(response.text || "{}");
}

// AGENT 2: EXPERIENCE EXTRACTOR
async function extractExperience(resumeText: string) {
  const chat = ai2.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
        You are an experience extraction specialist. Extract ALL work experience including:
        - Full-time jobs, internships, freelance, contract work, part-time roles
        - Company names (clean, no extra characters)
        - Role titles (exact as written)
        - Start/end dates in format "Jan 2023" or "present"
        - Detailed job descriptions

        CRITICAL DATE RULES:
        - Use format: "Jan 2023", "Feb 2024", "Dec 2025"
        - Current roles: use "present" as end_date
        - Always ensure start_date is before end_date chronologically
        - If unsure about dates, use best approximation

        ORDER: Most recent experience first
        QUALITY: Include comprehensive job descriptions, not just job titles
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
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
        },
        required: ["experience"],
        additionalProperties: false,
      },
    },
  });

  const response = await chat.sendMessage({
    message: `Extract all work experience from this resume:\n\n${resumeText}`,
  });

  return JSON.parse(response.text || "{}");
}

// AGENT 3: SKILLS & EDUCATION EXTRACTOR
async function extractSkillsEducation(resumeText: string) {
  const chat = ai3.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
        You are a skills and education extraction specialist.

        SKILLS NORMALIZATION (CRITICAL):
        - Convert ALL skills to lowercase, no spaces, no dots, no special characters
        - Examples: "React.js" -> "reactjs", "Node.JS" -> "nodejs", "C++" -> "cpp"
        - "HTML/CSS" -> "htmlcss", "PostgreSQL" -> "postgresql"
        - Include programming languages, frameworks, tools, technologies
        - NO duplicates, NO generic terms like "programming" or "software"

        EDUCATION RULES:
        - Include universities/colleges only (skip high school/vidyalaya)
        - Clean college names, proper degree titles
        - Date format: "Jan 2020" to "May 2024" or "2020" to "2024"
        - Include CGPA/GPA if mentioned else leave blank, location if clear
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          skills: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
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
        required: ["skills", "education"],
        additionalProperties: false,
      },
    },
  });

  const response = await chat.sendMessage({
    message: `Extract skills and education from this resume:\n\n${resumeText}`,
  });

  return JSON.parse(response.text || "{}");
}

// AGENT 4: URL EXTRACTOR (THE STRICT ONE)
async function extractUrls(resumeText: string, extractedLinks: string[]) {
  const context = `Resume context: ${resumeText.substring(0, 500)}...`;

  const chat = ai4.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
        You are a URL categorization specialist. Your job is to categorize URLs with BRUTAL precision.

        CANDIDATE CONTEXT: You are processing URLs for a resume belonging to "${context}".
        
        CRITICAL VALIDATION RULES:
        - ONLY categorize URLs that clearly belong to this specific candidate
        - LinkedIn URLs must contain this candidate's name or obvious username variation
        - GitHub URLs must be the candidate's profile, not random repos they mentioned
        - Portfolio URLs must be personal sites belonging to this candidate
        - If you cannot verify a URL belongs to this candidate, set it to empty string

        MANDATORY URL FORMATTING:
        - ALL URLs must start with "https://"
        - LinkedIn: MUST be "https://www.linkedin.com/in/username" (include https://www.)
        - GitHub profile: MUST be "https://github.com/username" (NOT project repos)
        - Portfolio: Personal websites, vercel.app, netlify.app, github.io domains
        - Blog: dev.to, medium.com, hashnode, substack URLs

        VALIDATION RULES:
        - If a URL doesn't match exact format, fix it or reject it
        - No trailing slashes
        - No query parameters unless essential
        - linkedin.com/in/user -> https://www.linkedin.com/in/user
        - github.com/user -> https://github.com/user

        IF URL IS MALFORMED OR INCOMPLETE: Return empty string for that field
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          linkedin_url: { type: Type.STRING },
          github_url: { type: Type.STRING },
          portfolio_url: { type: Type.STRING },
          blog_url: { type: Type.STRING },
        },
        required: ["linkedin_url", "github_url", "portfolio_url", "blog_url"],
        additionalProperties: false,
      },
    },
  });

  const response = await chat.sendMessage({
    message: `Categorize and format these URLs strictly:\n\n${extractedLinks.join(
      "\n"
    )}`,
  });

  return JSON.parse(response.text || "{}");
}

// AGENT 5: PROJECT EXTRACTOR (NEW!)
async function extractProjects(resumeText: string) {
  const chat = ai5.chats.create({
    model: "gemini-2.0-flash",
    config: {
      systemInstruction: `
        You are a technical project extraction specialist. Your job is to extract ALL personal, academic, and professional projects from resumes.

        EXTRACTION RULES:
        - Extract project name (clean, no extra symbols)
        - Extract comprehensive project description
        - Extract technologies used (normalize: "React.js" -> "reactjs", "Node.JS" -> "nodejs")
        - Extract key achievements/metrics (performance improvements, user impact, etc.)
        - Extract any GitHub URLs for individual projects
        - Extract live demo/deployment URLs if mentioned

        WHAT TO LOOK FOR:
        - Section headers: "Projects", "Personal Projects", "Academic Projects", "Side Projects"
        - Bullet points describing what was built
        - Technology stacks mentioned with project names
        - GitHub repo links associated with specific projects
        - Live URLs, deployment links, demo links

        NORMALIZATION:
        - Technologies should be lowercase, no spaces: "PostgreSQL" -> "postgresql", "TailwindCSS" -> "tailwindcss"
        - Clean project names: remove extra characters, proper capitalization

        QUALITY FOCUS:
        - Comprehensive descriptions that show technical depth
        - Clear technology categorization
        - Separate GitHub URLs from general portfolio links

        ORDER: Most impressive/recent projects first
      `,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          projects: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                project_name: { type: Type.STRING },
                description: { type: Type.STRING },
                technologies: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                },
                github_url: { type: Type.STRING },
                live_url: { type: Type.STRING },
              },
              required: [
                "project_name",
                "description",
                "technologies",
                "github_url",
                "live_url",
              ],
            },
          },
        },
        required: ["projects"],
        additionalProperties: false,
      },
    },
  });

  const response = await chat.sendMessage({
    message: `Extract all projects with their details from this resume:\n\n${resumeText}`,
  });

  return JSON.parse(response.text || "{}");
}

// MAIN ORCHESTRATOR
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
  blog_url: string;
  experience_years: number;
  embedding?: number[];
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
  projects: ProjectEntry[]; // NEW FIELD!
}

export async function enhancedGeminiExtractor(
  resumeText: string,
  extractedLinks: string[]
): Promise<CandidateProfile> {
  console.log("🚀 Starting parallel extraction with 5 specialized agents...");

  // RUN ALL 5 AGENTS IN PARALLEL
  const [basicInfo, experienceData, skillsEducationData, urlData, projectData] =
    await Promise.all([
      extractBasicInfo(resumeText),
      extractExperience(resumeText),
      extractSkillsEducation(resumeText),
      extractUrls(resumeText, extractedLinks),
      extractProjects(resumeText), // NEW AGENT!
    ]);

  console.log("✅ All agents completed. Combining results...");

  // Calculate experience years
  const experienceYears = calculateTotalExperience(
    experienceData.experience || []
  );

  // COMBINE ALL RESULTS
  const profile: CandidateProfile = {
    // Basic info
    full_name: basicInfo.full_name || "",
    email: basicInfo.email || "",
    location: basicInfo.location || "",
    title: basicInfo.title || "",
    about: basicInfo.about || "",

    // URLs (strictly formatted)
    linkedin_url: urlData.linkedin_url || "",
    github_url: urlData.github_url || "",
    portfolio_url: urlData.portfolio_url || "",
    blog_url: urlData.blog_url || "",

    // Skills & Education
    skills: skillsEducationData.skills || [],
    education: skillsEducationData.education || [],

    // Experience
    experience: experienceData.experience || [],
    experience_years: experienceYears,

    // Projects (NEW!)
    projects: projectData.projects || [],
  };

  console.log(
    `🎯 Profile created for ${profile.full_name} with ${profile.experience_years} years experience and ${profile.projects.length} projects`
  );

  return profile;
}

// Keep your existing utility function
export async function processPDFResume(
  buffer: Buffer
): Promise<CandidateProfile> {
  const { enrichedText, extractedLinks } = await preparePDFForAIExtraction(
    buffer
  );
  return enhancedGeminiExtractor(enrichedText, extractedLinks);
}
