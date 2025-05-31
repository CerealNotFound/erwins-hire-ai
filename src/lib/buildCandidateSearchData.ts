function buildCandidateSearchData(parsed: {
  role?: string;
  seniority?: string;
  title?: string;
  skills?: string[];
  preferredLocations?: string[];
  mustHave?: string[];
}) {
  const {
    role,
    seniority,
    title,
    skills = [],
    preferredLocations = [],
    mustHave = [],
  } = parsed;

  // ---- Natural Language Sentence (for embeddings) ---- //
  const parts: string[] = [];

  if (seniority || role) {
    parts.push(
      `Looking for a${seniority ? ` ${seniority}` : ""} ${role || "candidate"}`
    );
  }

  if (title) {
    parts.push(`for the role of ${title}`);
  }

  if (skills.length) {
    parts.push(`with experience in ${skills.join(", ")}`);
  }

  if (preferredLocations.length) {
    parts.push(`based in ${preferredLocations.join(", ")}`);
  }

  if (mustHave.length) {
    parts.push(`who is ${mustHave.join(" and ")}`);
  }

  const naturalText = parts.join(". ") + ".";

  // ---- Google/Serper LinkedIn Search Query ---- //
  const quoted = (arr: string[]) => arr.map((s) => `"${s}"`).join(" ");
  const mustTerms = mustHave.length
    ? `(${mustHave.map((term) => term.split(" ").join(" OR ")).join(" OR ")})`
    : "";

  const queryParts = [
    "site:linkedin.com/in",
    seniority ? `"${seniority}"` : "",
    role ? `"${role}"` : "",
    title ? `"${title}"` : "",
    quoted(skills),
    quoted(preferredLocations),
    mustTerms,
  ];

  const searchQuery = queryParts.filter(Boolean).join(" ");

  return {
    naturalText, // For embedding and semantic search
    searchQuery, // For Serper or Google
  };
}
