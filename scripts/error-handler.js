"use strict";

const EXIT_CODES = {
  SUCCESS: 0,
  GENERAL_ERROR: 1,
  INVALID_INPUT: 2,
  CONFIG_ERROR: 3,
  NO_RESULTS: 4,
};

const ERROR_MESSAGES = {
  [EXIT_CODES.GENERAL_ERROR]: "An unexpected error occurred",
  [EXIT_CODES.INVALID_INPUT]: "Invalid input",
  [EXIT_CODES.CONFIG_ERROR]: "Configuration error",
  [EXIT_CODES.NO_RESULTS]: "No retrieval results found",
};

class SkillError extends Error {
  constructor(message, exitCode = EXIT_CODES.GENERAL_ERROR) {
    super(message);
    this.name = "SkillError";
    this.exitCode = exitCode;
  }
}

function handleError(error) {
  if (error instanceof SkillError) {
    const prefix = ERROR_MESSAGES[error.exitCode] || "Error";
    process.stderr.write(`${prefix}: ${error.message}\n`);
    return error.exitCode;
  }

  process.stderr.write(`Unexpected error: ${error.message}\n`);
  return EXIT_CODES.GENERAL_ERROR;
}

module.exports = { EXIT_CODES, SkillError, handleError };
