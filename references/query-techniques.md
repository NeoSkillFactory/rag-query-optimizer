# Query Refinement Techniques

## 1. Synonym Expansion
Replace or augment query terms with synonyms to broaden matching.
- **Method**: Identify key nouns/verbs, expand with WordNet-style synonyms
- **Applicability**: Low recall, few results returned
- **Risk**: May reduce precision if synonyms are ambiguous

## 2. Query Decomposition
Split complex queries into independent sub-queries.
- **Method**: Parse query for conjunctions, multiple entities, or compound questions
- **Applicability**: Multi-faceted queries with low average relevance
- **Risk**: May miss cross-document relationships

## 3. Context Refinement
Add domain or contextual qualifiers to the query.
- **Method**: Analyze top results for domain terms, prepend context
- **Applicability**: Overly broad results from generic queries
- **Risk**: Over-constraining may reduce recall

## 4. Specificity Increase
Make vague queries more specific.
- **Method**: Identify underspecified terms, suggest concrete alternatives
- **Applicability**: Very broad query with scattered results
- **Risk**: May not match user's actual intent

## 5. Specificity Decrease
Broaden overly specific queries.
- **Method**: Remove restrictive qualifiers, generalize terms
- **Applicability**: Query returns too few results
- **Risk**: Increases noise in results

## 6. Semantic Rewriting
Rephrase the query to better match document vocabulary.
- **Method**: Analyze highly-scored documents for common phrasing patterns
- **Applicability**: Query intent is clear but phrasing mismatches corpus
- **Risk**: Subtle meaning shifts possible

## 7. Entity Highlighting
Emphasize named entities and technical terms.
- **Method**: Detect entities, boost their weight or wrap in quotes
- **Applicability**: Entity-heavy queries where exact matching matters
- **Risk**: Over-emphasis may suppress context

## 8. Temporal Scoping
Add time-based restrictions or preferences.
- **Method**: Detect time-sensitive topics, add date qualifiers
- **Applicability**: Results mix current and outdated information
- **Risk**: May exclude relevant older content

## 9. Negative Term Addition
Add exclusion terms to filter noise.
- **Method**: Identify recurring irrelevant terms in low-scored results
- **Applicability**: Consistent irrelevant cluster in results
- **Risk**: May accidentally exclude relevant content

## 10. Pseudo-Relevance Feedback
Use terms from top-K results to expand the query.
- **Method**: Extract TF-IDF top terms from highly-scored results, add to query
- **Applicability**: Initial results show partial relevance
- **Risk**: Query drift if top results are not truly relevant

## 11. Structural Reformulation
Change query structure (question → keywords, or vice versa).
- **Method**: Convert natural language to keyword query or expand keywords to question
- **Applicability**: When retrieval model prefers a different query format
- **Risk**: Loss of nuance in format conversion
