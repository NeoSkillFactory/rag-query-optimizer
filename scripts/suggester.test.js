"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const { suggest, TECHNIQUE_GENERATORS } = require("./suggester");
const { analyze } = require("./analyzer");
const { DEFAULT_CONFIG } = require("./config");

const sampleData = {
  query: "How does retrieval augmented generation improve LLM responses?",
  results: [
    { document: "RAG combines retrieval with generation for better LLM answers and grounded responses.", score: 0.9, metadata: {} },
    { document: "LLMs hallucinate without retrieval context. RAG reduces this significantly.", score: 0.85, metadata: {} },
    { document: "Vector databases enable similarity search for RAG pipelines.", score: 0.6, metadata: {} },
    { document: "Fine-tuning models on domain data is an alternative to RAG.", score: 0.45, metadata: {} },
    { document: "Prompt engineering can improve outputs without retrieval.", score: 0.3, metadata: {} },
  ],
};

const highScoreData = {
  query: "What is RAG?",
  results: [
    { document: "RAG is retrieval augmented generation.", score: 0.95, metadata: {} },
    { document: "RAG combines search with LLM generation.", score: 0.92, metadata: {} },
    { document: "Retrieval augmented generation improves accuracy.", score: 0.88, metadata: {} },
  ],
};

describe("suggest", () => {
  it("returns an array of suggestions", () => {
    const analysis = analyze(sampleData, DEFAULT_CONFIG);
    const suggestions = suggest(analysis, DEFAULT_CONFIG);
    assert.ok(Array.isArray(suggestions));
    assert.ok(suggestions.length > 0);
  });

  it("respects maxSuggestions", () => {
    const config = { ...DEFAULT_CONFIG, maxSuggestions: 2 };
    const analysis = analyze(sampleData, config);
    const suggestions = suggest(analysis, config);
    assert.ok(suggestions.length <= 2);
  });

  it("each suggestion has required fields", () => {
    const analysis = analyze(sampleData, DEFAULT_CONFIG);
    const suggestions = suggest(analysis, DEFAULT_CONFIG);
    for (const s of suggestions) {
      assert.ok(s.technique, "missing technique");
      assert.ok(s.suggestion, "missing suggestion");
      assert.ok(s.rationale, "missing rationale");
      assert.ok(["high", "medium", "low"].includes(s.priority), "invalid priority");
    }
  });

  it("sorts by priority (high first)", () => {
    const analysis = analyze(sampleData, DEFAULT_CONFIG);
    const suggestions = suggest(analysis, DEFAULT_CONFIG);
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    for (let i = 1; i < suggestions.length; i++) {
      assert.ok(priorityOrder[suggestions[i].priority] >= priorityOrder[suggestions[i - 1].priority]);
    }
  });

  it("only uses enabled techniques", () => {
    const config = { ...DEFAULT_CONFIG, techniques: ["synonym_expansion"] };
    const analysis = analyze(sampleData, config);
    const suggestions = suggest(analysis, config);
    for (const s of suggestions) {
      assert.equal(s.technique, "Synonym Expansion");
    }
  });

  it("returns fewer suggestions for high-quality results", () => {
    const analysis = analyze(highScoreData, DEFAULT_CONFIG);
    const suggestions = suggest(analysis, DEFAULT_CONFIG);
    // High-scoring data should produce fewer or no suggestions
    const lowScoreAnalysis = analyze(sampleData, DEFAULT_CONFIG);
    const lowScoreSuggestions = suggest(lowScoreAnalysis, DEFAULT_CONFIG);
    assert.ok(suggestions.length <= lowScoreSuggestions.length);
  });
});

describe("TECHNIQUE_GENERATORS", () => {
  it("has generators for all default techniques", () => {
    for (const technique of DEFAULT_CONFIG.techniques) {
      assert.ok(TECHNIQUE_GENERATORS[technique], `Missing generator for ${technique}`);
    }
  });

  it("generators return null when not applicable", () => {
    const analysis = analyze(highScoreData, DEFAULT_CONFIG);
    // At least some generators should return null for high-quality data
    let nullCount = 0;
    for (const [name, gen] of Object.entries(TECHNIQUE_GENERATORS)) {
      if (gen(analysis) === null) nullCount++;
    }
    assert.ok(nullCount > 0, "Expected at least some generators to return null for high-quality data");
  });
});
