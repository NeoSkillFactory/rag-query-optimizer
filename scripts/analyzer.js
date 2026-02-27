"use strict";

const { SkillError, EXIT_CODES } = require("./error-handler");
const {
  mean,
  standardDeviation,
  scoreSpread,
  countBelowThreshold,
  extractKeyTerms,
  detectQueryType,
} = require("./utils");

function validateInput(data) {
  if (!data || typeof data !== "object") {
    throw new SkillError("Input must be a JSON object", EXIT_CODES.INVALID_INPUT);
  }
  if (typeof data.query !== "string" || data.query.trim().length === 0) {
    throw new SkillError("Input must contain a non-empty 'query' string", EXIT_CODES.INVALID_INPUT);
  }
  if (!Array.isArray(data.results)) {
    throw new SkillError("Input must contain a 'results' array", EXIT_CODES.INVALID_INPUT);
  }
  if (data.results.length === 0) {
    throw new SkillError("Results array is empty", EXIT_CODES.NO_RESULTS);
  }
  for (let i = 0; i < data.results.length; i++) {
    const r = data.results[i];
    if (typeof r.document !== "string") {
      throw new SkillError(`Result at index ${i} is missing 'document' string`, EXIT_CODES.INVALID_INPUT);
    }
    if (typeof r.score !== "number" || r.score < 0 || r.score > 1) {
      throw new SkillError(`Result at index ${i} has invalid 'score' (must be 0-1)`, EXIT_CODES.INVALID_INPUT);
    }
  }
}

function analyzeScoreDistribution(scores, config) {
  const { lowScoreThreshold, highScoreThreshold, varianceThreshold } = config.scoring;
  const avg = mean(scores);
  const stdDev = standardDeviation(scores);
  const spread = scoreSpread(scores);
  const lowCount = countBelowThreshold(scores, config.relevanceThreshold);
  const veryLowCount = countBelowThreshold(scores, lowScoreThreshold);
  const highCount = scores.filter((s) => s >= highScoreThreshold).length;

  const patterns = [];

  if (avg < config.relevanceThreshold) {
    patterns.push({
      type: "low_average_relevance",
      severity: "high",
      detail: `Average score ${avg.toFixed(2)} is below threshold ${config.relevanceThreshold}`,
    });
  }

  if (spread > 0.4) {
    patterns.push({
      type: "high_score_spread",
      severity: "medium",
      detail: `Score spread of ${spread.toFixed(2)} indicates mixed relevance`,
    });
  }

  if (stdDev > varianceThreshold) {
    patterns.push({
      type: "high_variance",
      severity: "medium",
      detail: `Score standard deviation ${stdDev.toFixed(2)} exceeds threshold`,
    });
  }

  if (lowCount > scores.length / 2) {
    patterns.push({
      type: "majority_low_relevance",
      severity: "high",
      detail: `${lowCount} of ${scores.length} results below relevance threshold`,
    });
  }

  if (veryLowCount > 0) {
    patterns.push({
      type: "very_low_scores_present",
      severity: "medium",
      detail: `${veryLowCount} result(s) scored below ${lowScoreThreshold}`,
    });
  }

  if (highCount === 0) {
    patterns.push({
      type: "no_high_relevance",
      severity: "high",
      detail: `No results scored above ${highScoreThreshold}`,
    });
  }

  return { avg, stdDev, spread, lowCount, veryLowCount, highCount, patterns };
}

function analyzeContentGaps(query, results, config) {
  const queryTerms = extractKeyTerms(query);
  const gaps = [];

  const allDocText = results.map((r) => r.document).join(" ");
  const docTerms = new Set(extractKeyTerms(allDocText));

  const missingTerms = queryTerms.filter((t) => !docTerms.has(t));
  if (missingTerms.length > 0) {
    gaps.push({
      type: "missing_query_terms",
      terms: missingTerms.slice(0, 5),
      detail: `Query terms not found in results: ${missingTerms.slice(0, 5).join(", ")}`,
    });
  }

  const lowResults = results.filter((r) => r.score < config.relevanceThreshold);
  if (lowResults.length > 0) {
    const lowTerms = extractKeyTerms(lowResults.map((r) => r.document).join(" ")).slice(0, 5);
    const highResults = results.filter((r) => r.score >= config.relevanceThreshold);
    const highTerms = new Set(extractKeyTerms(highResults.map((r) => r.document).join(" ")));
    const divergentTerms = lowTerms.filter((t) => !highTerms.has(t));
    if (divergentTerms.length > 0) {
      gaps.push({
        type: "topic_drift",
        terms: divergentTerms,
        detail: `Low-relevance results contain divergent topics: ${divergentTerms.join(", ")}`,
      });
    }
  }

  return gaps;
}

function analyze(data, config) {
  validateInput(data);

  const scores = data.results.map((r) => r.score);
  const queryType = detectQueryType(data.query);
  const scoreAnalysis = analyzeScoreDistribution(scores, config);
  const contentGaps = analyzeContentGaps(data.query, data.results, config);
  const queryTerms = extractKeyTerms(data.query);

  const topResults = data.results
    .filter((r) => r.score >= config.relevanceThreshold)
    .sort((a, b) => b.score - a.score);

  const lowResults = data.results
    .filter((r) => r.score < config.relevanceThreshold)
    .sort((a, b) => a.score - b.score);

  return {
    query: data.query,
    queryType,
    queryTerms,
    totalResults: data.results.length,
    scoreAnalysis,
    contentGaps,
    topResults,
    lowResults,
    patterns: scoreAnalysis.patterns,
  };
}

module.exports = { analyze, validateInput, analyzeScoreDistribution, analyzeContentGaps };
