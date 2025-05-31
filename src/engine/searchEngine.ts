export type SearchEngine = {
  query: (query: string) => Promise<{
    reformulatedQuery: string;
    results: Array<{
      docId: string;
      title: string;
      snippet: string;
    }>;
    explanation?: string;
  }>;
};
