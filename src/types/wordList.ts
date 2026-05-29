/**
 * Daily Word List Types
 * 
 * Defines the structure for daily word lists, word associations, and sentence chains.
 * Requirements: 3.1
 */

import { Word } from './word';

export interface DailyWordList {
  id: string;
  date: Date;                           // The date this word list is for
  planId: string;                       // Reference to the learning plan
  words: Word[];                        // List of words for this day
  associations: WordAssociation[];      // Associations between words
  sentenceChains: SentenceChain[];      // Sentence chains using multiple words
}

export interface WordAssociation {
  word1Id: string;                      // ID of the first word
  word2Id: string;                      // ID of the second word
  associationType: AssociationType;     // Type of association
  description: string;                  // Description of the association
}

export type AssociationType = 'theme' | 'semantic' | 'root' | 'context';

export interface SentenceChain {
  id: string;
  sentence: string;          // The sentence using multiple words
  usedWordIds: string[];     // IDs of words used in this sentence
  translation: string;       // Chinese translation of the sentence
}
