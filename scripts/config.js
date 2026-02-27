"use strict";

const fs = require("fs");
const path = require("path");
const { SkillError, EXIT_CODES } = require("./error-handler");

const DEFAULT_CONFIG = {
  relevanceThreshold: 0.7,
  maxSuggestions: 5,
  techniques: [
    "synonym_expansion",
    "query_decomposition",
    "context_refinement",
    "specificity_adjustment",
    "semantic_rewriting",
  ],
  scoring: {
    lowScoreThreshold: 0.4,
    highScoreThreshold: 0.85,
    varianceThreshold: 0.15,
  },
};

const VALID_TECHNIQUES = [
  "synonym_expansion",
  "query_decomposition",
  "context_refinement",
  "specificity_adjustment",
  "semantic_rewriting",
  "temporal_scoping",
  "entity_highlighting",
  "negative_filtering",
  "pseudo_relevance_feedback",
  "structural_reformulation",
  "specificity_decrease",
];

function validateConfig(config) {
  if (typeof config !== "object" || config === null) {
    throw new SkillError("Config must be a JSON object", EXIT_CODES.CONFIG_ERROR);
  }

  if (config.relevanceThreshold !== undefined) {
    if (typeof config.relevanceThreshold !== "number" || config.relevanceThreshold < 0 || config.relevanceThreshold > 1) {
      throw new SkillError("relevanceThreshold must be a number between 0 and 1", EXIT_CODES.CONFIG_ERROR);
    }
  }

  if (config.maxSuggestions !== undefined) {
    if (!Number.isInteger(config.maxSuggestions) || config.maxSuggestions < 1) {
      throw new SkillError("maxSuggestions must be a positive integer", EXIT_CODES.CONFIG_ERROR);
    }
  }

  if (config.techniques !== undefined) {
    if (!Array.isArray(config.techniques)) {
      throw new SkillError("techniques must be an array", EXIT_CODES.CONFIG_ERROR);
    }
    for (const t of config.techniques) {
      if (!VALID_TECHNIQUES.includes(t)) {
        throw new SkillError(`Unknown technique: ${t}`, EXIT_CODES.CONFIG_ERROR);
      }
    }
  }

  if (config.scoring !== undefined) {
    if (typeof config.scoring !== "object" || config.scoring === null) {
      throw new SkillError("scoring must be an object", EXIT_CODES.CONFIG_ERROR);
    }
  }
}

function loadConfig(configPath) {
  if (!configPath) {
    return { ...DEFAULT_CONFIG };
  }

  const resolved = path.resolve(configPath);
  if (!fs.existsSync(resolved)) {
    throw new SkillError(`Config file not found: ${resolved}`, EXIT_CODES.CONFIG_ERROR);
  }

  let raw;
  try {
    raw = fs.readFileSync(resolved, "utf-8");
  } catch (err) {
    throw new SkillError(`Cannot read config file: ${err.message}`, EXIT_CODES.CONFIG_ERROR);
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new SkillError(`Invalid JSON in config file: ${err.message}`, EXIT_CODES.CONFIG_ERROR);
  }

  validateConfig(parsed);

  return {
    ...DEFAULT_CONFIG,
    ...parsed,
    scoring: { ...DEFAULT_CONFIG.scoring, ...(parsed.scoring || {}) },
  };
}

module.exports = { loadConfig, validateConfig, DEFAULT_CONFIG, VALID_TECHNIQUES };
