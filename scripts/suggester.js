"use strict";

const { extractKeyTerms } = require("./utils");

const TECHNIQUE_GENERATORS = {
  synonym_expansion: generateSynonymExpansion,
  query_decomposition: generateQueryDecomposition,
  context_refinement: generateContextRefinement,
  specificity_adjustment: generateSpecificityAdjustment,
  semantic_rewriting: generateSemanticRewriting,
  temporal_scoping: generateTemporalScoping,
  entity_highlighting: generateEntityHighlighting,
  negative_filtering: generateNegativeFiltering,
  pseudo_relevance_feedback: generatePseudoRelevanceFeedback,
  structural_reformulation: generateStructuralReformulation,
  specificity_decrease: generateSpecificityDecrease,
};

function generateSynonymExpansion(analysis) {
  const { query, queryTerms, scoreAnalysis } = analysis;
  if (scoreAnalysis.avg >= 0.8 && scoreAnalysis.lowCount === 0) return null;

  const keyTerms = queryTerms.slice(0, 3);
  const synonymMap = {
    improve: "enhance, optimize, boost",
    generate: "produce, create, synthesize",
    analyze: "examine, evaluate, assess",
    retrieval: "search, fetching, lookup",
    response: "answer, output, reply",
    augmented: "enhanced, supplemented, enriched",
    model: "system, architecture, framework",
    data: "information, content, knowledge",
    query: "question, search, request",
    document: "text, passage, content",
    relevant: "pertinent, applicable, related",
    performance: "efficiency, effectiveness, quality",
  };

  const expansions = [];
  for (const term of keyTerms) {
    if (synonymMap[term]) {
      expansions.push(`${term} → ${synonymMap[term]}`);
    }
  }

  if (expansions.length === 0) {
    expansions.push(`Consider adding related terms for: ${keyTerms.join(", ")}`);
  }

  return {
    technique: "Synonym Expansion",
    suggestion: `Expand query terms with synonyms: ${expansions.join("; ")}`,
    refinedQuery: augmentQueryWithContext(query, keyTerms),
    rationale: `Average relevance (${scoreAnalysis.avg.toFixed(2)}) may improve by broadening term matching.`,
    priority: scoreAnalysis.avg < 0.5 ? "high" : "medium",
  };
}

function generateQueryDecomposition(analysis) {
  const { query, queryType, scoreAnalysis } = analysis;
  if (queryType !== "question" && queryType !== "comparison") return null;
  if (scoreAnalysis.spread < 0.2) return null;

  const subQueries = decomposeQuery(query);
  if (subQueries.length < 2) return null;

  return {
    technique: "Query Decomposition",
    suggestion: `Split into focused sub-queries for better retrieval:`,
    subQueries,
    rationale: `High score spread (${scoreAnalysis.spread.toFixed(2)}) suggests the query addresses multiple topics that would benefit from separate retrieval.`,
    priority: "high",
  };
}

function generateContextRefinement(analysis) {
  const { query, topResults, contentGaps, scoreAnalysis } = analysis;
  if (topResults.length === 0) return null;

  const topTerms = extractKeyTerms(topResults.map((r) => r.document).join(" ")).slice(0, 5);
  const queryTermSet = new Set(analysis.queryTerms);
  const contextTerms = topTerms.filter((t) => !queryTermSet.has(t));

  if (contextTerms.length === 0) return null;

  const refinedQuery = `${query} (${contextTerms.slice(0, 3).join(", ")})`;

  return {
    technique: "Context Refinement",
    suggestion: `Add contextual qualifiers from top results: ${contextTerms.slice(0, 3).join(", ")}`,
    refinedQuery,
    rationale: `Top-scoring documents share terms not in the original query, suggesting these contextual additions would improve precision.`,
    priority: scoreAnalysis.spread > 0.3 ? "high" : "medium",
  };
}

function generateSpecificityAdjustment(analysis) {
  const { query, scoreAnalysis, patterns } = analysis;
  const hasLowAvg = patterns.some((p) => p.type === "low_average_relevance");
  const hasMajorityLow = patterns.some((p) => p.type === "majority_low_relevance");

  if (!hasLowAvg && !hasMajorityLow) return null;

  const queryWords = query.split(/\s+/);
  const isVague = queryWords.length < 5;

  if (isVague) {
    return {
      technique: "Specificity Increase",
      suggestion: `Make the query more specific by adding domain qualifiers and constraints.`,
      refinedQuery: `${query} — consider adding: specific technology names, version numbers, or use case context`,
      rationale: `Short, generic query (${queryWords.length} words) with low relevance (${scoreAnalysis.avg.toFixed(2)}) suggests under-specification.`,
      priority: "high",
    };
  }

  return {
    technique: "Specificity Adjustment",
    suggestion: `Restructure the query to focus on the primary information need.`,
    refinedQuery: `Focus on the core question: ${extractCoreQuestion(query)}`,
    rationale: `Despite being detailed, the query produces low relevance — it may be too complex for single-pass retrieval.`,
    priority: "medium",
  };
}

function generateSemanticRewriting(analysis) {
  const { query, topResults, lowResults, scoreAnalysis } = analysis;
  if (topResults.length === 0 || lowResults.length === 0) return null;

  const topTerms = extractKeyTerms(topResults.map((r) => r.document).join(" "));
  const matchingTerms = topTerms.slice(0, 4);

  return {
    technique: "Semantic Rewriting",
    suggestion: `Rephrase the query using vocabulary from high-scoring documents.`,
    refinedQuery: `Rewrite using these high-match terms: ${matchingTerms.join(", ")}`,
    rationale: `Top-scoring documents use different vocabulary than the query. Aligning query language with corpus language can improve retrieval.`,
    priority: "medium",
  };
}

function generateTemporalScoping(analysis) {
  const { query, scoreAnalysis } = analysis;
  const hasTimeWords = /\b(latest|recent|current|new|updated|modern|now)\b/i.test(query);
  if (!hasTimeWords && scoreAnalysis.avg > 0.6) return null;

  if (hasTimeWords) {
    return {
      technique: "Temporal Scoping",
      suggestion: `Add explicit date ranges to enforce temporal relevance.`,
      refinedQuery: `${query} (2024-2026)`,
      rationale: `Query contains temporal language but retrieval may not enforce recency. Adding date constraints improves precision.`,
      priority: "medium",
    };
  }
  return null;
}

function generateEntityHighlighting(analysis) {
  const { query } = analysis;
  const entities = query.match(/\b[A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)*\b/g);
  if (!entities || entities.length === 0) return null;

  const unique = [...new Set(entities)];
  return {
    technique: "Entity Highlighting",
    suggestion: `Emphasize key entities in the query: ${unique.join(", ")}`,
    refinedQuery: `${query} — boost terms: "${unique.join('", "')}"`,
    rationale: `Named entities detected. Boosting entity weight in retrieval can improve precision for entity-centric queries.`,
    priority: "low",
  };
}

function generateNegativeFiltering(analysis) {
  const { contentGaps, lowResults } = analysis;
  const driftGap = contentGaps.find((g) => g.type === "topic_drift");
  if (!driftGap || lowResults.length < 2) return null;

  return {
    technique: "Negative Filtering",
    suggestion: `Exclude divergent topics found in low-relevance results: ${driftGap.terms.slice(0, 3).join(", ")}`,
    refinedQuery: `Add exclusion terms: NOT ${driftGap.terms.slice(0, 3).join(", NOT ")}`,
    rationale: `Low-scoring results contain recurring off-topic terms that can be filtered out to improve precision.`,
    priority: "medium",
  };
}

function generatePseudoRelevanceFeedback(analysis) {
  const { query, topResults, scoreAnalysis } = analysis;
  if (topResults.length < 2) return null;
  if (scoreAnalysis.avg > 0.85) return null;

  const feedbackTerms = extractKeyTerms(topResults.slice(0, 3).map((r) => r.document).join(" "));
  const queryTermSet = new Set(analysis.queryTerms);
  const newTerms = feedbackTerms.filter((t) => !queryTermSet.has(t)).slice(0, 4);

  if (newTerms.length === 0) return null;

  return {
    technique: "Pseudo-Relevance Feedback",
    suggestion: `Expand query with terms from top-ranked results: ${newTerms.join(", ")}`,
    refinedQuery: `${query} ${newTerms.join(" ")}`,
    rationale: `Top results share common terms not in the original query. Adding these terms can pull in more relevant documents.`,
    priority: "medium",
  };
}

function generateStructuralReformulation(analysis) {
  const { query, queryType, scoreAnalysis } = analysis;
  if (scoreAnalysis.avg > 0.7) return null;

  if (queryType === "question") {
    const keywords = analysis.queryTerms.slice(0, 5).join(" ");
    return {
      technique: "Structural Reformulation",
      suggestion: `Convert the question to keyword form for potentially better retrieval.`,
      refinedQuery: keywords,
      rationale: `Some retrieval systems perform better with keyword queries than natural language questions.`,
      priority: "low",
    };
  }

  if (queryType === "keyword") {
    return {
      technique: "Structural Reformulation",
      suggestion: `Convert keywords to a natural language question.`,
      refinedQuery: `What is ${query}?`,
      rationale: `Some retrieval systems (especially dense retrievers) perform better with natural language queries.`,
      priority: "low",
    };
  }

  return null;
}

function generateSpecificityDecrease(analysis) {
  const { query, scoreAnalysis, totalResults } = analysis;
  if (scoreAnalysis.avg > 0.5 || totalResults > 3) return null;

  const queryWords = query.split(/\s+/);
  if (queryWords.length < 6) return null;

  return {
    technique: "Specificity Decrease",
    suggestion: `Broaden the query by removing restrictive qualifiers.`,
    refinedQuery: `Try a shorter version: ${queryWords.slice(0, Math.ceil(queryWords.length / 2)).join(" ")}`,
    rationale: `Overly specific query (${queryWords.length} words) with low results may be too restrictive.`,
    priority: "medium",
  };
}

// Helper functions

function augmentQueryWithContext(query, terms) {
  return `${query} (including: ${terms.join(", ")})`;
}

function decomposeQuery(query) {
  const clean = query.replace(/[?!.]+$/, "").trim();

  // Try splitting on "and"
  if (/\band\b/i.test(clean)) {
    const parts = clean.split(/\band\b/i).map((s) => s.trim()).filter(Boolean);
    if (parts.length >= 2) return parts.map((p) => p + "?");
  }

  // Try splitting compound questions
  if (clean.split(/\s+/).length > 8) {
    const mid = Math.ceil(clean.split(/\s+/).length / 2);
    const words = clean.split(/\s+/);
    return [
      words.slice(0, mid).join(" ") + "?",
      words.slice(mid).join(" ") + "?",
    ];
  }

  return [clean];
}

function extractCoreQuestion(query) {
  const words = query.split(/\s+/);
  if (words.length <= 6) return query;
  return words.slice(0, 6).join(" ") + "...";
}

// Main suggestion generator

function suggest(analysis, config) {
  const enabledTechniques = config.techniques;
  const suggestions = [];

  for (const technique of enabledTechniques) {
    const generator = TECHNIQUE_GENERATORS[technique];
    if (!generator) continue;

    const suggestion = generator(analysis);
    if (suggestion) {
      suggestions.push(suggestion);
    }
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  suggestions.sort((a, b) => (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2));

  return suggestions.slice(0, config.maxSuggestions);
}

module.exports = { suggest, TECHNIQUE_GENERATORS };
