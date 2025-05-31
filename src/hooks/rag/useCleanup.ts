export const useCleanup = (rawText: string) => {
  return rawText
    .replace(/\r\n/g, '\n')  // Normalize line endings
    .replace(/\r/g, '\n')    // Handle old Mac format
    .trim();                 // Remove leading/trailing whitespace
};