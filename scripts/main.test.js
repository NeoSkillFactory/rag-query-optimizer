"use strict";

const { describe, it } = require("node:test");
const assert = require("node:assert/strict");
const path = require("path");
const { run, parseArgs, formatTextOutput, formatJsonOutput } = require("./main");
const { analyze } = require("./analyzer");
const { suggest } = require("./suggester");
const { DEFAULT_CONFIG } = require("./config");
const { EXIT_CODES } = require("./error-handler");

describe("parseArgs", () => {
  it("parses command and input file", () => {
    const args = parseArgs(["node", "main.js", "analyze", "results.json"]);
    assert.equal(args.command, "analyze");
    assert.equal(args.inputFile, "results.json");
  });

  it("parses config flag", () => {
    const args = parseArgs(["node", "main.js", "analyze", "results.json", "--config", "config.json"]);
    assert.equal(args.configFile, "config.json");
  });

  it("parses format flag", () => {
    const args = parseArgs(["node", "main.js", "analyze", "results.json", "--format", "json"]);
    assert.equal(args.format, "json");
  });

  it("parses short flags", () => {
    const args = parseArgs(["node", "main.js", "analyze", "results.json", "-c", "c.json", "-f", "json"]);
    assert.equal(args.configFile, "c.json");
    assert.equal(args.format, "json");
  });

  it("defaults format to text", () => {
    const args = parseArgs(["node", "main.js", "analyze", "results.json"]);
    assert.equal(args.format, "text");
  });
});

describe("formatTextOutput", () => {
  it("produces readable text report", () => {
    const data = {
      query: "test query",
      results: [
        { document: "Doc about testing and queries.", score: 0.8, metadata: {} },
        { document: "Another doc about other topics.", score: 0.4, metadata: {} },
      ],
    };
    const analysis = analyze(data, DEFAULT_CONFIG);
    const suggestions = suggest(analysis, DEFAULT_CONFIG);
    const output = formatTextOutput(analysis, suggestions);

    assert.ok(output.includes("RAG Query Optimization Report"));
    assert.ok(output.includes("test query"));
    assert.ok(output.includes("Analysis:"));
  });
});

describe("formatJsonOutput", () => {
  it("produces valid JSON", () => {
    const data = {
      query: "test query",
      results: [
        { document: "Doc about testing.", score: 0.8, metadata: {} },
      ],
    };
    const analysis = analyze(data, DEFAULT_CONFIG);
    const suggestions = suggest(analysis, DEFAULT_CONFIG);
    const output = formatJsonOutput(analysis, suggestions);

    const parsed = JSON.parse(output);
    assert.ok(parsed.analysis);
    assert.ok(parsed.suggestions !== undefined);
  });
});

describe("run", () => {
  it("succeeds with valid input", () => {
    const inputFile = path.join(__dirname, "..", "assets", "examples", "sample-results.json");
    const exitCode = run(["node", "main.js", "analyze", inputFile]);
    assert.equal(exitCode, EXIT_CODES.SUCCESS);
  });

  it("returns 0 for no command (shows help)", () => {
    const exitCode = run(["node", "main.js"]);
    assert.equal(exitCode, EXIT_CODES.SUCCESS);
  });

  it("throws for unknown command", () => {
    assert.throws(() => run(["node", "main.js", "unknown"]), (err) => err.exitCode === EXIT_CODES.GENERAL_ERROR);
  });

  it("throws for missing input file", () => {
    assert.throws(() => run(["node", "main.js", "analyze"]), (err) => err.exitCode === EXIT_CODES.INVALID_INPUT);
  });

  it("throws for nonexistent input file", () => {
    assert.throws(() => run(["node", "main.js", "analyze", "nonexistent.json"]), (err) => err.exitCode === EXIT_CODES.INVALID_INPUT);
  });

  it("succeeds with json format", () => {
    const inputFile = path.join(__dirname, "..", "assets", "examples", "sample-results.json");
    const exitCode = run(["node", "main.js", "analyze", inputFile, "--format", "json"]);
    assert.equal(exitCode, EXIT_CODES.SUCCESS);
  });

  it("succeeds with config file", () => {
    const inputFile = path.join(__dirname, "..", "assets", "examples", "sample-results.json");
    const configFile = path.join(__dirname, "..", "references", "config-examples", "basic-config.json");
    const exitCode = run(["node", "main.js", "analyze", inputFile, "--config", configFile]);
    assert.equal(exitCode, EXIT_CODES.SUCCESS);
  });
});
