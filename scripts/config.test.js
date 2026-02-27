"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { loadConfig, validateConfig, DEFAULT_CONFIG, VALID_TECHNIQUES } = require("./config");
const { SkillError, EXIT_CODES } = require("./error-handler");

describe("DEFAULT_CONFIG", () => {
  it("has required fields", () => {
    assert.ok(typeof DEFAULT_CONFIG.relevanceThreshold === "number");
    assert.ok(typeof DEFAULT_CONFIG.maxSuggestions === "number");
    assert.ok(Array.isArray(DEFAULT_CONFIG.techniques));
    assert.ok(typeof DEFAULT_CONFIG.scoring === "object");
  });
});

describe("validateConfig", () => {
  it("accepts valid config", () => {
    assert.doesNotThrow(() => validateConfig({ relevanceThreshold: 0.5, maxSuggestions: 3 }));
  });

  it("rejects non-object", () => {
    assert.throws(() => validateConfig("string"), (err) => err.exitCode === EXIT_CODES.CONFIG_ERROR);
  });

  it("rejects null", () => {
    assert.throws(() => validateConfig(null), (err) => err.exitCode === EXIT_CODES.CONFIG_ERROR);
  });

  it("rejects invalid relevanceThreshold", () => {
    assert.throws(() => validateConfig({ relevanceThreshold: 2.0 }), (err) => err instanceof SkillError);
    assert.throws(() => validateConfig({ relevanceThreshold: -0.1 }), (err) => err instanceof SkillError);
    assert.throws(() => validateConfig({ relevanceThreshold: "high" }), (err) => err instanceof SkillError);
  });

  it("rejects invalid maxSuggestions", () => {
    assert.throws(() => validateConfig({ maxSuggestions: 0 }), (err) => err instanceof SkillError);
    assert.throws(() => validateConfig({ maxSuggestions: 1.5 }), (err) => err instanceof SkillError);
  });

  it("rejects unknown techniques", () => {
    assert.throws(() => validateConfig({ techniques: ["unknown_tech"] }), (err) => err instanceof SkillError);
  });

  it("rejects non-array techniques", () => {
    assert.throws(() => validateConfig({ techniques: "synonym_expansion" }), (err) => err instanceof SkillError);
  });
});

describe("loadConfig", () => {
  it("returns defaults when no path given", () => {
    const config = loadConfig(null);
    assert.deepEqual(config.techniques, DEFAULT_CONFIG.techniques);
    assert.equal(config.relevanceThreshold, DEFAULT_CONFIG.relevanceThreshold);
  });

  it("loads config from file", () => {
    const configPath = path.join(__dirname, "..", "references", "config-examples", "basic-config.json");
    const config = loadConfig(configPath);
    assert.equal(config.relevanceThreshold, 0.7);
    assert.ok(config.techniques.includes("synonym_expansion"));
  });

  it("throws on nonexistent file", () => {
    assert.throws(() => loadConfig("/nonexistent/path.json"), (err) => err.exitCode === EXIT_CODES.CONFIG_ERROR);
  });
});

describe("VALID_TECHNIQUES", () => {
  it("contains expected techniques", () => {
    assert.ok(VALID_TECHNIQUES.includes("synonym_expansion"));
    assert.ok(VALID_TECHNIQUES.includes("query_decomposition"));
    assert.ok(VALID_TECHNIQUES.includes("context_refinement"));
  });
});
