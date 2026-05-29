/**
 * Word Association Utilities
 * 
 * Provides functions for calculating and validating word associations.
 * Requirements: 4.1, 4.2
 */

import type { Word, WordAssociation } from '../types';

/**
 * Calculate the association rate between words in a list.
 *
 * The rate is defined as the fraction of words that appear in at least one
 * association — NOT the fraction of all possible word-pairs that are linked.
 * For example, with 10 words where 8 appear in at least one association,
 * the rate is 0.8 (80%).
 *
 * Requirements: 4.1
 *
 * @param words - Array of words to analyze
 * @param associations - Array of word associations
 * @returns Association rate as a decimal (0-1)
 */
export function calculateAssociationRate(
  words: Word[],
  associations: WordAssociation[]
): number {
  if (words.length === 0) return 1;
  if (words.length === 1) return 1;

  // Collect all word IDs that appear in at least one association
  const associatedWordIds = new Set<string>();
  for (const assoc of associations) {
    associatedWordIds.add(assoc.word1Id);
    associatedWordIds.add(assoc.word2Id);
  }

  // Count how many words from our list appear in at least one association
  const wordsWithAssociation = words.filter(w => associatedWordIds.has(w.id)).length;

  return wordsWithAssociation / words.length;
}

/**
 * Check if two words have an association
 * Requirements: 4.2
 * 
 * @param word1 - First word
 * @param word2 - Second word
 * @param associations - Array of word associations
 * @returns true if words are associated
 */
export function hasAssociation(
  word1: Word,
  word2: Word,
  associations: WordAssociation[]
): boolean {
  // Check if there's an explicit association
  const hasExplicitAssociation = associations.some(
    assoc =>
      (assoc.word1Id === word1.id && assoc.word2Id === word2.id) ||
      (assoc.word1Id === word2.id && assoc.word2Id === word1.id)
  );

  if (hasExplicitAssociation) {
    return true;
  }

  // Check if words share common roots (simple heuristic)
  if (shareCommonRoot(word1.word, word2.word)) {
    return true;
  }

  return false;
}

/**
 * Check if two words share a common root (simple heuristic)
 * Requirements: 4.2
 * 
 * @param word1 - First word
 * @param word2 - Second word
 * @returns true if words likely share a root
 */
export function shareCommonRoot(word1: string, word2: string): boolean {
  const w1 = word1.toLowerCase();
  const w2 = word2.toLowerCase();

  // Check if one word is a substring of the other (minimum 4 characters)
  if (w1.length >= 4 && w2.includes(w1)) {
    return true;
  }
  if (w2.length >= 4 && w1.includes(w2)) {
    return true;
  }

  // Check if they share a common prefix (minimum 4 characters)
  const minLength = Math.min(w1.length, w2.length);
  if (minLength >= 4) {
    let commonPrefixLength = 0;
    for (let i = 0; i < minLength; i++) {
      if (w1[i] === w2[i]) {
        commonPrefixLength++;
      } else {
        break;
      }
    }
    if (commonPrefixLength >= 4) {
      return true;
    }
  }

  return false;
}

/**
 * Validate that a word list meets the association threshold
 * Requirements: 4.1
 * 
 * @param words - Array of words
 * @param associations - Array of word associations
 * @param threshold - Minimum association rate (default 0.8 for 80%)
 * @returns true if association rate meets threshold
 */
export function validateAssociationThreshold(
  words: Word[],
  associations: WordAssociation[],
  threshold: number = 0.8
): boolean {
  const rate = calculateAssociationRate(words, associations);
  return rate >= threshold;
}
