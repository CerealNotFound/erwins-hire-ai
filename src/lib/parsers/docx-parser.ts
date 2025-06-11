import mammoth from "mammoth";

interface DocxExtractionResult {
  enrichedText: string;
  extractedLinks: string[];
}

// Enhanced DOCX parser that extracts both text and links
export async function prepareDocxForAIExtraction(buffer: Buffer): Promise<DocxExtractionResult> {
  // Extract both raw text and HTML to get links
  const [textResult, htmlResult] = await Promise.all([
    mammoth.extractRawText({ buffer }),
    mammoth.convertToHtml({ buffer })
  ]);

  const rawText = textResult.value;
  const htmlContent = htmlResult.value;

  // Extract links from HTML content
  const extractedLinks = extractLinksFromHtml(htmlContent);

  // Clean and enrich text
  const enrichedText = cleanAndEnrichText(rawText);

  return {
    enrichedText,
    extractedLinks
  };
}

function extractLinksFromHtml(html: string): string[] {
  const links: string[] = [];
  
  // Extract href attributes from anchor tags
  const hrefRegex = /<a[^>]+href=['"](.*?)['"]/gi;
  let match;
  
  while ((match = hrefRegex.exec(html)) !== null) {
    const url = match[1];
    if (isValidUrl(url)) {
      links.push(url);
    }
  }

  // Also extract URLs from plain text (in case they're not linked)
  const urlRegex = /https?:\/\/[^\s<>"]+/gi;
  const textUrls = html.match(urlRegex) || [];
  
  textUrls.forEach(url => {
    if (isValidUrl(url) && !links.includes(url)) {
      links.push(url);
    }
  });

  // Extract email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  const emails = html.match(emailRegex) || [];
  
  emails.forEach(email => {
    if (!links.includes(`mailto:${email}`)) {
      links.push(`mailto:${email}`);
    }
  });

  return [...new Set(links)]; // Remove duplicates
}

function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function cleanAndEnrichText(text: string): string {
  return text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/\n\s*\n/g, '\n') // Remove excessive line breaks
    .trim();
}

// Backward compatibility - keep the old function
export default async function parseDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}