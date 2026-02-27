"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { analyze, validateInput, analyzeScoreDistribution } = require("./analyzer");
const { DEFAULT_CONFIG } = require("./config");
const { SkillError, EXIT_CODES } = require("./error-handler");

const sampleData = {
  query: "How does RAG improve LLM responses?",
  results: [
    { document: "RAG combines retrieval with generation for better answers.", score: 0.9, metadata: {} },
    { document: "Vector databases store document embeddings.", score: 0.6, metadata: {} },
    { document: "Fine-tuning is an alternative approach.", score: 0.4, metadata: {} },
  ],
};

describe("validateInput", () => {
  it("accepts valid input", () => {
    assert.doesNotThrow(() => validateInput(sampleData));
  });

  it("rejects null input", () => {
    assert.throws(() => validateInput(null), (err) => err instanceof SkillError && err.exitCode === EXIT_CODES.INVALID_INPUT);
  });

  it("rejects missing query", () => {
    assert.throws(() => validateInput({ results: [] }), (err) => err instanceof SkillError);
  });

  it("rejects empty query", () => {
    assert.throws(() => validateInput({ query: "  ", results: [{ document: "x", score: 0.5 }] }), (err) => err instanceof SkillError);
  });

  it("rejects non-array results", () => {
    assert.throws(() => validateInput({ query: "test", results: "not array" }), (err) => err instanceof SkillError);
  });

  it("rejects empty results", () => {
    assert.throws(() => validateInput({ query: "test", results: [] }), (err) => err.exitCode === EXIT_CODES.NO_RESULTS);
  });

  it("rejects invalid scores", () => {
    assert.throws(
      () => validateInput({ query: "test", results: [{ document: "x", score: 1.5 }] }),
      (err) => err instanceof SkillError
    );
  });

  it("rejects missing document field", () => {
    assert.throws(
      () => validateInput({ query: "test", results: [{ score: 0.5 }] }),
      (err) => err instanceof SkillError
    );
  });
});

describe("analyzeScoreDistribution", () => {
  it("detects low average relevance", () => {
    const result = analyzeScoreDistribution([0.3, 0.4, 0.5], DEFAULT_CONFIG);
    const hasPattern = result.patterns.some((p) => p.type === "low_average_relevance");
    assert.ok(hasPattern);
  });

  it("detects high score spread", () => {
    const result = analyzeScoreDistribution([0.1, 0.9], DEFAULT_CONFIG);
    const hasPattern = result.patterns.some((p) => p.type === "high_score_spread");
    assert.ok(hasPattern);
  });

  it("returns correct counts", () => {
    const result = analyzeScoreDistribution([0.3, 0.5, 0.8, 0.9], DEFAULT_CONFIG);
    assert.equal(result.lowCount, 2);
    assert.equal(result.highCount, 1);
  });
});

describe("analyze", () => {
  it("returns complete analysis object", () => {
    const result = analyze(sampleData, DEFAULT_CONFIG);
    assert.equal(result.query, sampleData.query);
    assert.equal(result.queryType, "question");
    assert.equal(result.totalResults, 3);
    assert.ok(result.scoreAnalysis);
    assert.ok(Array.isArray(result.contentGaps));
    assert.ok(Array.isArray(result.topResults));
    assert.ok(Array.isArray(result.lowResults));
    assert.ok(Array.isArray(result.patterns));
  });

  it("correctly splits top and low results", () => {
    const result = analyze(sampleData, DEFAULT_CONFIG);
    assert.equal(result.topResults.length, 1); // only 0.9 is above 0.7
    assert.equal(result.lowResults.length, 2); // 0.6 and 0.4 are below 0.7
  });

  it("includes query terms", () => {
    const result = analyze(sampleData, DEFAULT_CONFIG);
    assert.ok(result.queryTerms.length > 0);
    assert.ok(result.queryTerms.includes("rag"));
  });
});
