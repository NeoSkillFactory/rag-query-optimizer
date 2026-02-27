"use strict";

function mean(values) {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function variance(values) {
  if (values.length < 2) return 0;
  const avg = mean(values);
  return values.reduce((sum, v) => sum + (v - avg) ** 2, 0) / values.length;
}

function standardDeviation(values) {
  return Math.sqrt(variance(values));
}

function extractKeyTerms(text) {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "for", "on", "with", "at", "by", "from",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "between", "out", "off", "over", "under", "again", "further", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "nor",
    "not", "only", "own", "same", "so", "than", "too", "very", "just",
    "because", "but", "and", "or", "if", "while", "about", "that", "this",
    "which", "what", "who", "whom", "it", "its", "i", "me", "my", "we",
    "our", "you", "your", "he", "him", "his", "she", "her", "they", "them",
    "their",
  ]);

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w));

  const freq = {};
  for (const word of words) {
    freq[word] = (freq[word] || 0) + 1;
  }

  return Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .map(([term]) => term);
}

function detectQueryType(query) {
  const lower = query.toLowerCase().trim();
  if (/^(how|what|why|when|where|who|which)\b/.test(lower)) return "question";
  if (/\b(compare|vs\.?|versus|difference)\b/.test(lower)) return "comparison";
  if (/\b(list|enumerate|name)\b/.test(lower)) return "enumeration";
  return "keyword";
}

function scoreSpread(scores) {
  if (scores.length < 2) return 0;
  return Math.max(...scores) - Math.min(...scores);
}

function countBelowThreshold(scores, threshold) {
  return scores.filter((s) => s < threshold).length;
}

module.exports = {
  mean,
  variance,
  standardDeviation,
  extractKeyTerms,
  detectQueryType,
  scoreSpread,
  countBelowThreshold,
};
