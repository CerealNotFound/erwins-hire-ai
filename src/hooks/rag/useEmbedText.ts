import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { TaskType } from "@google/generative-ai";

export const useEmbedText = async (textToEmbed: string[]) => {
  const geminiKey = process.env.GEMINI_API_KEY;
  const embedder = new GoogleGenerativeAIEmbeddings({
    apiKey: geminiKey,
    model: "text-embedding-004", // 768 dimensions
    taskType: TaskType.RETRIEVAL_DOCUMENT,
  });

  const embeddings = embedder.embedDocuments(textToEmbed);

  return embeddings;
};
