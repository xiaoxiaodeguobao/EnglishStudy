/**
 * WordListResponseParser
 *
 * Pure-function module for parsing and validating AI-generated word list responses.
 * Handles Markdown code block extraction, JSON parsing, field validation,
 * association type normalization, and ID resolution.
 *
 * **Validates: Requirements 3.3, 4.2, 4.3, 5.3, 7.3, 8.1, 8.2, 8.3**
 */

import { GenerationError } from '../../types/error';
import { Word, } from '../../types/word';
import { WordAssociation, SentenceChain, AssociationType } from '../../types/wordList';
import { RawWordData, RawAssociationData, RawSentenceChainData } from './types';

// ---------------------------------------------------------------------------
// Task 3.1 — extractJSON
// ---------------------------------------------------------------------------

/**
 * Extract and parse a JSON value from an AI response string.
 *
 * Strategy (in order):
 * 1. Try to extract content from a Markdown fenced code block (```json ... ``` or ``` ... ```)
 * 2. Use a regex to find the first complete top-level JSON object `{...}`
 * 3. If both fail, throw GenerationError("AI 返回数据格式无效")
 *
 * Requirements: 8.1, 8.2, 7.3
 */
export function extractJSON(content: string): unknown {
  // Strategy 1: Markdown fenced code block
  // Matches ```json ... ``` or ``` ... ``` (non-greedy, dotAll)
  const fencedBlockRegex = /```(?:json)?\s*([\s\S]*?)```/i;
  const fencedMatch = fencedBlockRegex.exec(content);
  if (fencedMatch) {
    const candidate = fencedMatch[1].trim();
    try {
      return JSON.parse(candidate);
    } catch {
      // Fall through to strategy 2
    }
  }

  // Strategy 2: First complete top-level JSON object using a balanced-brace scan
  const firstBrace = content.indexOf('{');
  if (firstBrace !== -1) {
    let depth = 0;
    let inString = false;
    let escape = false;
    for (let i = firstBrace; i < content.length; i++) {
      const ch = content[i];
      if (escape) {
        escape = false;
        continue;
      }
      if (ch === '\\' && inString) {
        escape = true;
        continue;
      }
      if (ch === '"') {
        inString = !inString;
        continue;
      }
      if (inString) continue;
      if (ch === '{') depth++;
      else if (ch === '}') {
        depth--;
        if (depth === 0) {
          const candidate = content.slice(firstBrace, i + 1);
          try {
            return JSON.parse(candidate);
          } catch {
            // Fall through to error
            break;
          }
        }
      }
    }
  }

  throw new GenerationError('AI 返回数据格式无效');
}

// ---------------------------------------------------------------------------
// Task 3.2 — validateAndFilterWords
// ---------------------------------------------------------------------------

/**
 * Validate and filter a raw array of word objects.
 *
 * Each entry must have:
 *   - `word`: non-empty string
 *   - `definitions`: non-empty array
 *   - `examples`: non-empty array
 *
 * Invalid entries are discarded and a console.warn is emitted for each.
 *
 * Requirements: 3.3, 8.3
 */
export function validateAndFilterWords(raw: unknown[]): RawWordData[] {
  const result: RawWordData[] = [];

  for (const item of raw) {
    if (
      item !== null &&
      typeof item === 'object' &&
      !Array.isArray(item)
    ) {
      const obj = item as Record<string, unknown>;
      const hasWord =
        typeof obj['word'] === 'string' && obj['word'].trim().length > 0;
      const hasDefinitions =
        Array.isArray(obj['definitions']) &&
        (obj['definitions'] as unknown[]).length > 0;
      const hasExamples =
        Array.isArray(obj['examples']) &&
        (obj['examples'] as unknown[]).length > 0;

      if (hasWord && hasDefinitions && hasExamples) {
        result.push(obj as unknown as RawWordData);
        continue;
      }
    }

    console.warn(
      '[WordListResponseParser] Discarding invalid word entry:',
      item
    );
  }

  return result;
}

// ---------------------------------------------------------------------------
// Task 3.3 — normalizeAssociationType
// ---------------------------------------------------------------------------

const VALID_ASSOCIATION_TYPES: AssociationType[] = [
  'theme',
  'semantic',
  'root',
  'context',
];

/**
 * Normalize an association type string to a valid AssociationType.
 *
 * Any value not in `theme | semantic | root | context` is normalized to `'semantic'`.
 *
 * Requirements: 4.2
 */
export function normalizeAssociationType(type: string): AssociationType {
  if ((VALID_ASSOCIATION_TYPES as string[]).includes(type)) {
    return type as AssociationType;
  }
  return 'semantic';
}

// ---------------------------------------------------------------------------
// Task 3.4 — resolveAssociationIds
// ---------------------------------------------------------------------------

/**
 * Convert text-based word associations to ID-based WordAssociation objects.
 *
 * `word1` and `word2` in each raw association are word text strings.
 * They are looked up in the `words` array by their `.word` property.
 * Associations where either word text is not found are silently skipped.
 *
 * Requirements: 4.3
 */
export function resolveAssociationIds(
  rawAssociations: RawAssociationData[],
  words: Word[]
): WordAssociation[] {
  // Build a lookup map: lowercase word text → word id
  const wordMap = new Map<string, string>();
  for (const w of words) {
    wordMap.set(w.word.toLowerCase(), w.id);
  }

  const result: WordAssociation[] = [];

  for (const raw of rawAssociations) {
    const word1Id = wordMap.get(raw.word1?.toLowerCase());
    const word2Id = wordMap.get(raw.word2?.toLowerCase());

    if (!word1Id || !word2Id) {
      // Skip associations where either word is not found
      continue;
    }

    result.push({
      word1Id,
      word2Id,
      associationType: normalizeAssociationType(raw.associationType),
      description: raw.description,
    });
  }

  return result;
}

// ---------------------------------------------------------------------------
// Task 3.5 — filterValidSentenceChainWords
// ---------------------------------------------------------------------------

/**
 * Filter sentence chains so that only words present in the daily word list
 * are included in each chain's `usedWordIds`.
 *
 * Generates SentenceChain objects with:
 *   - `id`: a UUID generated via crypto.randomUUID()
 *   - `sentence`: the original sentence
 *   - `translation`: the original translation
 *   - `usedWordIds`: only IDs of words that exist in the daily word list
 *
 * Requirements: 5.3
 */
export function filterValidSentenceChainWords(
  chains: RawSentenceChainData[],
  words: Word[]
): SentenceChain[] {
  // Build a lookup map: lowercase word text → word id
  const wordMap = new Map<string, string>();
  for (const w of words) {
    wordMap.set(w.word.toLowerCase(), w.id);
  }

  return chains.map((chain) => {
    const usedWordIds: string[] = [];
    for (const wordText of chain.usedWords) {
      const id = wordMap.get(wordText?.toLowerCase());
      if (id) {
        usedWordIds.push(id);
      }
    }

    return {
      id: crypto.randomUUID(),
      sentence: chain.sentence,
      translation: chain.translation,
      usedWordIds,
    };
  });
}
