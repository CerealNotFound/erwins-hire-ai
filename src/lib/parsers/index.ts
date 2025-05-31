type ParsedData =
  | { type: "text"; data: { text: string; extractedLinks: string[] } }
  | { type: "enhanced-text"; data: { text: string; extractedLinks: string[] } }
  | { type: "structured"; data: any[] };

type FileParser = (buffer: Buffer) => Promise<ParsedData>;

import parsePDF from "./pdf-parser";
import parseExcel from "./excel-parser";
import parseDocx from "./docx-parser";
import parseTxt from "./txt-parser";

import { parsePDFWithLinks, preparePDFForAIExtraction } from "./pdf-parser";

export const fileParsers: Record<string, FileParser> = {
  "application/pdf": async (buffer) => {
    // Use the enhanced PDF parser that extracts links
    const pdfData = await preparePDFForAIExtraction(buffer);
    return {
      type: "enhanced-text",
      data: {
        text: pdfData.enrichedText,
        extractedLinks: pdfData.extractedLinks
      }
    };
  },
  
  // Keep other parsers as-is, but ensure they have consistent return structure
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": async (buffer) => ({
    type: "text",
    data: {
      text: await parseDocx(buffer),
      extractedLinks: [] // No links for DOCX
    }
  }),
  
  "text/plain": async (buffer) => ({
    type: "text", 
    data: {
      text: await parseTxt(buffer),
      extractedLinks: []
    }
  }),
  
  // Structured data parsers remain unchanged
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": async (buffer) => ({
    type: "structured",
    data: await parseExcel(buffer),
  }),
  
  "text/csv": async (buffer) => ({
    type: "structured", 
    data: await parseExcel(buffer),
  }),
};