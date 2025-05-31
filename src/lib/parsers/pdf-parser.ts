// Enhanced PDF parser that extracts both text and embedded links
//@ts-ignore
import pdf from "pdf-parse";
import { CandidateProfile } from "@/engine/resumeExtractors/geminiExtractor";
//@ts-ignore
import PDFJS from "pdf-parse/lib/pdf.js/v2.0.550/build/pdf.js";

interface PDFLink {
  url: string;
  page: number;
  rect: number[]; // [x1, y1, x2, y2] coordinates
  text?: string; // Surrounding text context
}

interface EnhancedPDFData {
  text: string;
  links: PDFLink[];
  numpages: number;
  info?: any;
  metadata?: any;
}

// Custom page renderer that extracts both text and annotations
async function renderPageWithLinks(pageData: any, pageNum: number) {
  const renderOptions = {
    normalizeWhitespace: false,
    disableCombineTextItems: false,
  };

  // Extract text content
  const textContent = await pageData.getTextContent(renderOptions);

  let lastY: number | null = null;
  let text = "";

  for (let item of textContent.items) {
    if (lastY === item.transform[5] || !lastY) {
      text += item.str;
    } else {
      text += "\n" + item.str;
    }
    lastY = item.transform[5];
  }

  // Extract annotations (links)
  const annotations = await pageData.getAnnotations();
  const links: PDFLink[] = [];

  for (let annotation of annotations) {
    if (annotation.subtype === "Link") {
      let url = "";

      // Handle different types of links
      if (annotation.url) {
        url = annotation.url;
      } else if (annotation.action && annotation.action.url) {
        url = annotation.action.url;
      } else if (annotation.dest) {
        // Internal link - you might want to handle this differently
        url = `#page=${annotation.dest}`;
      }

      if (url) {
        links.push({
          url: url,
          page: pageNum,
          rect: annotation.rect || [],
          text: annotation.contents || undefined,
        });
      }
    }
  }

  return { text, links };
}

export async function parsePDFWithLinks(
  buffer: Buffer
): Promise<EnhancedPDFData> {
  // Disable workers for compatibility
  PDFJS.disableWorker = true;

  try {
    const doc = await PDFJS.getDocument(buffer);
    const numPages = doc.numPages;

    // Get metadata
    let metaData;
    try {
      metaData = await doc.getMetadata();
    } catch (err) {
      metaData = null;
    }

    let fullText = "";
    let allLinks: PDFLink[] = [];

    // Process each page
    for (let i = 1; i <= numPages; i++) {
      try {
        const page = await doc.getPage(i);
        const { text, links } = await renderPageWithLinks(page, i);

        fullText += `\n\n${text}`;
        allLinks.push(...links);
      } catch (err) {
        console.warn(`Error processing page ${i}:`, err);
        // Continue with other pages
      }
    }

    // Clean up
    doc.destroy();

    return {
      text: fullText.trim(),
      links: allLinks,
      numpages: numPages,
      info: metaData?.info || null,
      metadata: metaData?.metadata || null,
    };
  } catch (error) {
    throw new Error(`PDF parsing failed: ${error}`);
  }
}

// Backward compatible function for just text
export default async function parsePDF(buffer: Buffer): Promise<string> {
  const data = await parsePDFWithLinks(buffer);
  return data.text;
}

// Utility function to get just the links
export async function extractPDFLinks(buffer: Buffer): Promise<PDFLink[]> {
  const data = await parsePDFWithLinks(buffer);
  return data.links;
}

// Enhanced function to process PDF and prepare data for AI extraction
export async function preparePDFForAIExtraction(buffer: Buffer): Promise<{
  enrichedText: string;
  extractedLinks: string[];
  candidateProfile?: CandidateProfile;
}> {
  const pdfData = await parsePDFWithLinks(buffer);

  // Categorize links by pattern matching
  const categorizedLinks = categorizeExtractedLinks(pdfData.links);

  // Create enriched text with special markers for AI
  const enrichedText = createEnrichedTextWithMarkers(
    pdfData.text,
    pdfData.links
  );

  // Extract all unique URLs
  const allUrls = pdfData.links.map((link) => link.url);

  return {
    enrichedText,
    extractedLinks: allUrls,
    // You can optionally pre-process with AI here
  };
}

// Pattern-based link categorization before AI processing
function categorizeExtractedLinks(links: PDFLink[]): {
  github_projects: string[];
  portfolio_candidates: string[];
  blog_candidates: string[];
  social_links: string[];
  emails: string[];
  others: string[];
} {
  const categorized = {
    github_projects: [] as string[],
    portfolio_candidates: [] as string[],
    blog_candidates: [] as string[],
    social_links: [] as string[],
    emails: [] as string[],
    others: [] as string[],
  };

  for (const link of links) {
    const url = link.url.toLowerCase();

    // Email detection
    if (url.startsWith("mailto:")) {
      categorized.emails.push(link.url.replace("mailto:", ""));
      continue;
    }

    // GitHub project detection (not just profile)
    if (url.includes("github.com/") && url.split("/").length > 4) {
      categorized.github_projects.push(link.url);
      continue;
    }

    // Social platforms
    if (
      url.includes("linkedin.com") ||
      url.includes("twitter.com") ||
      url.includes("instagram.com") ||
      url.includes("facebook.com")
    ) {
      categorized.social_links.push(link.url);
      continue;
    }

    // Blog platforms
    if (
      url.includes("dev.to") ||
      url.includes("medium.com") ||
      url.includes("hashnode") ||
      url.includes("blog") ||
      url.includes("substack.com")
    ) {
      categorized.blog_candidates.push(link.url);
      continue;
    }

    // Portfolio candidates (personal domains, vercel, netlify, etc.)
    if (
      url.includes("vercel.app") ||
      url.includes("netlify.app") ||
      url.includes("github.io") ||
      url.includes("portfolio") ||
      url.includes("personal") ||
      isLikelyPersonalDomain(url)
    ) {
      categorized.portfolio_candidates.push(link.url);
      continue;
    }

    categorized.others.push(link.url);
  }

  return categorized;
}

// Helper to detect personal domains
function isLikelyPersonalDomain(url: string): boolean {
  // Simple heuristic - domains with firstname/lastname patterns
  const domain = url.split("/")[2] || "";
  const parts = domain.split(".");
  const subdomain = parts[0];

  // Check if subdomain looks like a name (simple pattern)
  return (
    subdomain.length > 3 &&
    subdomain.length < 20 &&
    /^[a-z]+[a-z0-9]*$/.test(subdomain) &&
    !["www", "api", "mail", "blog"].includes(subdomain)
  );
}

// Create enriched text with special markers for AI understanding
function createEnrichedTextWithMarkers(text: string, links: PDFLink[]): string {
  let enrichedText = text;

  // Add special markers where links should be
  const linkMarkers = links.map((link) => `[LINK:${link.url}]`).join("\n");

  return `${enrichedText}\n\n--- EXTRACTED LINKS ---\n${linkMarkers}`;
}
