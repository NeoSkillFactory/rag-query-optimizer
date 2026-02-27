# RAG Optimization Patterns

## 1. Query Decomposition
Break complex queries into simpler sub-queries that can be independently retrieved.
- **When**: Query contains multiple distinct information needs
- **Signal**: Low average relevance with high score variance
- **Example**: "Compare X and Y" → "What is X?" + "What is Y?"

## 2. Synonym Expansion
Expand query terms with synonyms and related terms to increase recall.
- **When**: Few results returned or very low relevance scores
- **Signal**: Average score below threshold with few results
- **Example**: "ML models" → "machine learning models, neural networks, AI algorithms"

## 3. Context Refinement
Add contextual qualifiers to narrow retrieval scope.
- **When**: Results are topically diverse but lack focus
- **Signal**: High score variance, many partially relevant results
- **Example**: "Python errors" → "Python runtime TypeError debugging"

## 4. Specificity Adjustment
Adjust query specificity based on retrieval patterns.
- **When**: Results are either too broad or too narrow
- **Signal**: All scores clustered at extremes
- **Example**: "database" → "PostgreSQL query optimization" (more specific)

## 5. Temporal Scoping
Add time-based qualifiers when results span multiple time periods.
- **When**: Results contain outdated or mixed-era information
- **Signal**: Metadata shows wide date ranges
- **Example**: "React patterns" → "React patterns 2024-2025"

## 6. Reranking Strategy
Suggest reranking configurations based on result patterns.
- **When**: Relevant docs exist but are ranked poorly
- **Signal**: High relevance docs in bottom half of results
- **Example**: Apply cross-encoder reranking, adjust MMR diversity

## 7. Hybrid Search
Recommend combining keyword and semantic search.
- **When**: Pure semantic search misses keyword-critical terms
- **Signal**: Important exact terms not found in top results
- **Example**: Combine BM25 keyword matching with dense retrieval

## 8. Query Expansion via Feedback
Use pseudo-relevance feedback from top results to expand the query.
- **When**: Initial results show partial relevance
- **Signal**: Top results share common terms not in original query
- **Example**: Extract key terms from top-3 docs, add to query

## 9. Entity Focus
Identify and emphasize named entities in queries.
- **When**: Query contains proper nouns or technical terms
- **Signal**: Entity-containing results score higher
- **Example**: "the framework by Facebook" → "React framework Meta"

## 10. Negative Filtering
Suggest exclusion terms to filter irrelevant results.
- **When**: Results contain a recurring irrelevant topic
- **Signal**: Cluster of low-relevance results share common terms
- **Example**: "jaguar speed" → "jaguar speed -car -automobile"

## 11. Multi-hop Decomposition
For questions requiring reasoning across multiple documents.
- **When**: No single document can answer the query
- **Signal**: Moderate scores but incomplete information per document
- **Example**: "Who founded the company that made GPT?" → "Who made GPT?" → "Who founded [company]?"

## 12. Passage-level Targeting
Suggest narrowing retrieval to passage level instead of document level.
- **When**: Documents are long but only sections are relevant
- **Signal**: Score variance within documents is high
- **Example**: Reduce chunk size, use passage-level retrieval

## 13. Metadata Filtering
Leverage metadata fields to improve precision.
- **When**: Results from irrelevant sources pollute rankings
- **Signal**: Low-relevance results share metadata patterns
- **Example**: Filter by source type, date range, or category

## 14. Query Reformulation
Completely rephrase the query while preserving intent.
- **When**: Query phrasing doesn't match document language
- **Signal**: Low scores despite topic relevance
- **Example**: "How to fix slow code?" → "Performance optimization techniques"

## 15. Ensemble Retrieval
Combine multiple retrieval strategies for robustness.
- **When**: Single strategy shows inconsistent results
- **Signal**: Different query phrasings produce very different results
- **Example**: Merge results from BM25 + dense + sparse retrieval
