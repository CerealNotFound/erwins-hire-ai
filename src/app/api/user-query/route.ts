import { geminiReformulator } from "@/engine/reformulators/geminiReformulator";

export async function POST(req: Request) {
  const { query } = await req.json();
  const parsedQuery = await geminiReformulator(query);

  console.log("parsed user query: ", parsedQuery);

  //   Now hit your /candidates/query endpoint or DB with parsedQuery filters
  //   const matches = await findMatchingCandidates(parsedQuery);

  return Response.json({ parsedQuery });
}
