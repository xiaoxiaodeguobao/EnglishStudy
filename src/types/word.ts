/**
 * Word and Definition Types
 * 
 * Defines the structure for words, their definitions, and example sentences.
 * Requirements: 3.1, 6.1, 7.1
 */

export interface Word {
  id: string;
  word: string;                     // The word itself
  phonetic?: string;                // Phonetic transcription (e.g., /həˈloʊ/)
  definitions: WordDefinition[];    // All definitions for different parts of speech
  examples: ExampleSentence[];      // Example sentences demonstrating usage
  associations: string[];           // IDs of associated words
  generatedAt: Date;                // When this word was generated
}

export interface WordDefinition {
  partOfSpeech: string;      // Part of speech (noun, verb, adjective, etc.)
  meaningCN: string;         // Chinese meaning/definition
  meaningEN: string;         // English meaning/definition
}

export interface ExampleSentence {
  sentence: string;          // The example sentence
  translation: string;       // Chinese translation of the sentence
  highlightWord: string;     // The word to highlight in the sentence
}
