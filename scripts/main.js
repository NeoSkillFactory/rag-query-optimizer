#!/usr/bin/env node
"use strict";

const fs = require("fs");
const path = require("path");
const { loadConfig } = require("./config");
const { analyze } = require("./analyzer");
const { suggest } = require("./suggester");
const { handleError, SkillError, EXIT_CODES } = require("./error-handler");

function parseArgs(argv) {
  const args = argv.slice(2);
  const parsed = { command: null, inputFile: null, configFile: null, format: "text" };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];
    if (arg === "--help" || arg === "-h") {
      printHelp();
      process.exit(0);
    } else if (arg === "--config" || arg === "-c") {
      i++;
      parsed.configFile = args[i];
    } else if (arg === "--format" || arg === "-f") {
      i++;
      parsed.format = args[i];
    } else if (!parsed.command) {
      parsed.command = arg;
    } else if (!parsed.inputFile) {
      parsed.inputFile = arg;
    }
    i++;
  }

  return parsed;
}

function printHelp() {
  const help = `
rag-query-optimizer — Analyze RAG retrieval results and generate query refinement suggestions.

Usage:
  node scripts/main.js analyze <results-file> [options]

Commands:
  analyze    Analyze retrieval results and generate suggestions

Options:
  --config, -c <path>   Path to configuration file
  --format, -f <type>   Output format: text (default) or json
  --help, -h            Show this help message

Examples:
  node scripts/main.js analyze results.json
  node scripts/main.js analyze results.json --config config.json
  node scripts/main.js analyze results.json --format json
`.trim();
  console.log(help);
}

function loadInput(filePath) {
  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    throw new SkillError(`Input file not found: ${resolved}`, EXIT_CODES.INVALID_INPUT);
  }

  let raw;
  try {
    raw = fs.readFileSync(resolved, "utf-8");
  } catch (err) {
    throw new SkillError(`Cannot read input file: ${err.message}`, EXIT_CODES.INVALID_INPUT);
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    throw new SkillError(`Invalid JSON in input file: ${err.message}`, EXIT_CODES.INVALID_INPUT);
  }
}

function formatTextOutput(analysis, suggestions) {
  const lines = [];
  lines.push("=== RAG Query Optimization Report ===");
  lines.push("");
  lines.push(`Original Query: "${analysis.query}"`);
  lines.push(`Query Type: ${analysis.queryType}`);
  lines.push("");
  lines.push("Analysis:");
  lines.push(`  - Total results: ${analysis.totalResults}`);
  lines.push(`  - Average relevance score: ${analysis.scoreAnalysis.avg.toFixed(2)}`);
  lines.push(`  - Score spread: ${analysis.scoreAnalysis.spread.toFixed(2)}`);
  lines.push(`  - Std deviation: ${analysis.scoreAnalysis.stdDev.toFixed(2)}`);
  lines.push(`  - Low-relevance results: ${analysis.scoreAnalysis.lowCount} of ${analysis.totalResults}`);
  lines.push(`  - High-relevance results: ${analysis.scoreAnalysis.highCount} of ${analysis.totalResults}`);

  if (analysis.patterns.length > 0) {
    lines.push("");
    lines.push("Detected Patterns:");
    for (const p of analysis.patterns) {
      lines.push(`  - [${p.severity.toUpperCase()}] ${p.detail}`);
    }
  }

  if (analysis.contentGaps.length > 0) {
    lines.push("");
    lines.push("Content Gaps:");
    for (const g of analysis.contentGaps) {
      lines.push(`  - ${g.detail}`);
    }
  }

  if (suggestions.length > 0) {
    lines.push("");
    lines.push("Suggestions:");
    for (let i = 0; i < suggestions.length; i++) {
      const s = suggestions[i];
      lines.push("");
      lines.push(`  ${i + 1}. [${s.technique}] (Priority: ${s.priority})`);
      lines.push(`     ${s.suggestion}`);
      if (s.refinedQuery) {
        lines.push(`     Refined: ${s.refinedQuery}`);
      }
      if (s.subQueries) {
        for (const sq of s.subQueries) {
          lines.push(`       - ${sq}`);
        }
      }
      lines.push(`     Rationale: ${s.rationale}`);
    }
  } else {
    lines.push("");
    lines.push("No suggestions generated — the retrieval results appear well-optimized.");
  }

  lines.push("");
  return lines.join("\n");
}

function formatJsonOutput(analysis, suggestions) {
  return JSON.stringify({ analysis, suggestions }, null, 2);
}

function run(argv) {
  const args = parseArgs(argv);

  if (!args.command) {
    printHelp();
    return EXIT_CODES.SUCCESS;
  }

  if (args.command !== "analyze") {
    throw new SkillError(`Unknown command: ${args.command}. Use 'analyze'.`, EXIT_CODES.GENERAL_ERROR);
  }

  if (!args.inputFile) {
    throw new SkillError("Missing input file. Usage: analyze <results-file>", EXIT_CODES.INVALID_INPUT);
  }

  if (args.format && !["text", "json"].includes(args.format)) {
    throw new SkillError(`Invalid format: ${args.format}. Use 'text' or 'json'.`, EXIT_CODES.INVALID_INPUT);
  }

  const config = loadConfig(args.configFile);
  const data = loadInput(args.inputFile);
  const analysis = analyze(data, config);
  const suggestions = suggest(analysis, config);

  const output = args.format === "json"
    ? formatJsonOutput(analysis, suggestions)
    : formatTextOutput(analysis, suggestions);

  console.log(output);
  return EXIT_CODES.SUCCESS;
}

if (require.main === module) {
  try {
    const exitCode = run(process.argv);
    process.exit(exitCode);
  } catch (err) {
    const exitCode = handleError(err);
    process.exit(exitCode);
  }
}

module.exports = { run, parseArgs, formatTextOutput, formatJsonOutput };
