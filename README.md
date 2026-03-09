# rag-query-optimizer

![Audit](https://img.shields.io/badge/audit%3A%20PASS-brightgreen) ![License](https://img.shields.io/badge/license-MIT-blue) ![OpenClaw](https://img.shields.io/badge/OpenClaw-skill-orange)

> Automatically analyzes RAG pipeline retrieval results and generates optimized query refinement suggestions to improve answer relevance.

## Description

**rag-query-optimizer** — Automatically analyzes RAG pipeline retrieval results and generates optimized query refinement suggestions to improve answer relevance.

## Features

- Analyze RAG pipeline retrieval results for relevance patterns and gaps
- Detect low-relevance retrievals through statistical score analysis
- Identify query-document semantic mismatches
- Generate intelligent query refinement suggestions based on retrieval analysis
- Suggest synonym expansions and contextual rewrites
- Recommend query decomposition strategies for complex queries
- Support multiple RAG pipeline configurations and retrieval strategies
- Provide CLI interface for direct query optimization tasks
- Integrate seamlessly with OpenClaw agent workflows
- Handle errors gracefully with non-zero exit codes on failure

## Usage

```bash
# Analyze a retrieval results file
node scripts/main.js analyze <results-file>

# Analyze with custom configuration
node scripts/main.js analyze <results-file> --config <config-file>

# Output as JSON
node scripts/main.js analyze <results-file> --format json

# Show help
node scripts/main.js --help
```

## Examples

node scripts/main.js analyze results.json --format json
```

## 9. Error Handling

| Exit Code | Meaning |
|-----------|---------|
| 0 | Success — suggestions generated |
| 1 | General error — unexpected failure |
| 2 | Invalid input — malformed results file |
| 3 | Configuration error — invalid config |
| 4 | No results — empty retrieval data |
```

## GitHub

Source code: [github.com/NeoSkillFactory/rag-query-optimizer](https://github.com/NeoSkillFactory/rag-query-optimizer)

**Price suggestion:** $49 USD

## License

MIT © NeoSkillFactory
