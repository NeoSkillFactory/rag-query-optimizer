"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const {
  mean,
  variance,
  standardDeviation,
  extractKeyTerms,
  detectQueryType,
  scoreSpread,
  countBelowThreshold,
} = require("./utils");

describe("mean", () => {
  it("returns 0 for empty array", () => {
    assert.equal(mean([]), 0);
  });

  it("calculates mean of values", () => {
    assert.equal(mean([1, 2, 3, 4, 5]), 3);
  });

  it("handles single value", () => {
    assert.equal(mean([7]), 7);
  });

  it("handles decimal values", () => {
    assert.ok(Math.abs(mean([0.1, 0.2, 0.3]) - 0.2) < 0.001);
  });
});

describe("variance", () => {
  it("returns 0 for single value", () => {
    assert.equal(variance([5]), 0);
  });

  it("returns 0 for identical values", () => {
    assert.equal(variance([3, 3, 3]), 0);
  });

  it("calculates variance correctly", () => {
    assert.ok(Math.abs(variance([2, 4, 4, 4, 5, 5, 7, 9]) - 4) < 0.001);
  });
});

describe("standardDeviation", () => {
  it("returns 0 for single value", () => {
    assert.equal(standardDeviation([5]), 0);
  });

  it("calculates standard deviation correctly", () => {
    assert.ok(Math.abs(standardDeviation([2, 4, 4, 4, 5, 5, 7, 9]) - 2) < 0.001);
  });
});

describe("extractKeyTerms", () => {
  it("extracts non-stop words", () => {
    const terms = extractKeyTerms("How does retrieval augmented generation work?");
    assert.ok(terms.includes("retrieval"));
    assert.ok(terms.includes("generation"));
    assert.ok(!terms.includes("how"));
    assert.ok(!terms.includes("does"));
  });

  it("returns empty for all stop words", () => {
    const terms = extractKeyTerms("the a an is are");
    assert.equal(terms.length, 0);
  });

  it("sorts by frequency", () => {
    const terms = extractKeyTerms("rag rag rag optimization optimization query");
    assert.equal(terms[0], "rag");
    assert.equal(terms[1], "optimization");
  });
});

describe("detectQueryType", () => {
  it("detects question queries", () => {
    assert.equal(detectQueryType("How does RAG work?"), "question");
    assert.equal(detectQueryType("What is retrieval augmented generation?"), "question");
  });

  it("detects comparison queries", () => {
    assert.equal(detectQueryType("RAG vs fine-tuning"), "comparison");
    assert.equal(detectQueryType("Compare RAG and prompt engineering"), "comparison");
  });

  it("detects enumeration queries", () => {
    assert.equal(detectQueryType("List RAG optimization strategies"), "enumeration");
  });

  it("detects keyword queries", () => {
    assert.equal(detectQueryType("RAG optimization strategies"), "keyword");
  });
});

describe("scoreSpread", () => {
  it("returns 0 for single value", () => {
    assert.equal(scoreSpread([0.5]), 0);
  });

  it("calculates spread correctly", () => {
    assert.ok(Math.abs(scoreSpread([0.2, 0.5, 0.8]) - 0.6) < 0.001);
  });
});

describe("countBelowThreshold", () => {
  it("counts values below threshold", () => {
    assert.equal(countBelowThreshold([0.3, 0.5, 0.7, 0.9], 0.6), 2);
  });

  it("returns 0 when all above threshold", () => {
    assert.equal(countBelowThreshold([0.8, 0.9], 0.5), 0);
  });
});
