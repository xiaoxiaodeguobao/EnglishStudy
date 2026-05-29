/**
 * DictionaryService Implementation
 * 
 * Provides word definitions, phonetics, and search functionality using Free Dictionary API.
 * Includes error handling and retry logic for API requests.
 * 
 * Requirements: 6.1, 6.2, 6.3, 6.6, 12.1
 */

import type { DictionaryService, WordDefinition, Word } from '../types';
import { NetworkError } from '../types/error';

/**
 * Free Dictionary API response structure
 */
interface DictionaryAPIResponse {
  word: string;
  phonetic?: string;
  phonetics?: Array<{
    text?: string;
    audio?: string;
  }>;
  meanings: Array<{
    partOfSpeech: string;
    definitions: Array<{
      definition: string;
      example?: string;
      synonyms?: string[];
      antonyms?: string[];
    }>;
  }>;
}

/**
 * Logger utility
 */
class Logger {
  static info(message: string, context?: Record<string, any>): void {
    console.info(`[${new Date().toISOString()}] [INFO] ${message}`, context || '');
  }

  static error(message: string, context?: Record<string, any>): void {
    console.error(`[${new Date().toISOString()}] [ERROR] ${message}`, context || '');
  }

  static warn(message: string, context?: Record<string, any>): void {
    console.warn(`[${new Date().toISOString()}] [WARN] ${message}`, context || '');
  }
}

/**
 * DictionaryService implementation using Free Dictionary API
 */
export class DictionaryServiceImpl implements DictionaryService {
  private readonly API_BASE_URL = 'https://api.dictionaryapi.dev/api/v2/entries/en';
  private readonly MAX_RETRIES = 3;
  private readonly RETRY_DELAY = 1000; // 1 second

  /**
   * Fetch data from API with retry logic
   */
  private async fetchWithRetry(url: string, retries = this.MAX_RETRIES): Promise<Response> {
    try {
      Logger.info('Fetching from API', { url, retriesLeft: retries });
      
      const response = await fetch(url);
      
      // Don't retry on 404 - it's a permanent failure (word not found)
      if (!response.ok && response.status !== 404 && retries > 0) {
        Logger.warn('API request failed, retrying', {
          status: response.status,
          retriesLeft: retries - 1,
        });
        
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.fetchWithRetry(url, retries - 1);
      }
      
      return response;
    } catch (error) {
      if (retries > 0) {
        Logger.warn('Network error, retrying', {
          error: error instanceof Error ? error.message : String(error),
          retriesLeft: retries - 1,
        });
        
        await new Promise(resolve => setTimeout(resolve, this.RETRY_DELAY));
        return this.fetchWithRetry(url, retries - 1);
      }
      
      throw error;
    }
  }

  /**
   * Parse API response to WordDefinition array
   */
  private parseDefinitions(apiResponse: DictionaryAPIResponse[]): WordDefinition[] {
    const definitions: WordDefinition[] = [];

    for (const entry of apiResponse) {
      for (const meaning of entry.meanings) {
        // Get the first definition for each part of speech
        const firstDef = meaning.definitions[0];
        
        if (firstDef) {
          definitions.push({
            partOfSpeech: meaning.partOfSpeech,
            meaningEN: firstDef.definition,
            meaningCN: '', // Free Dictionary API doesn't provide Chinese translations
          });
        }
      }
    }

    return definitions;
  }

  /**
   * Get word definitions from Free Dictionary API
   * Requirements: 6.1, 6.2, 6.3
   */
  async getWordDefinitions(word: string): Promise<WordDefinition[]> {
    try {
      Logger.info('Getting word definitions', { word });

      const url = `${this.API_BASE_URL}/${encodeURIComponent(word.toLowerCase())}`;
      const response = await this.fetchWithRetry(url);

      if (!response.ok) {
        if (response.status === 404) {
          Logger.warn('Word not found in dictionary', { word });
          return [];
        }
        
        throw new NetworkError(`API returned status ${response.status}`);
      }

      const data: DictionaryAPIResponse[] = await response.json();
      const definitions = this.parseDefinitions(data);

      Logger.info('Word definitions retrieved', {
        word,
        definitionCount: definitions.length,
      });

      return definitions;
    } catch (error) {
      Logger.error('Failed to get word definitions', {
        word,
        error: error instanceof Error ? error.message : String(error),
      });

      if (error instanceof NetworkError) {
        throw error;
      }

      throw new NetworkError('无法获取单词解释');
    }
  }

  /**
   * Get phonetic transcription for a word
   * Requirements: 6.6
   */
  async getPhonetic(word: string): Promise<string | undefined> {
    try {
      Logger.info('Getting phonetic', { word });

      const url = `${this.API_BASE_URL}/${encodeURIComponent(word.toLowerCase())}`;
      const response = await this.fetchWithRetry(url);

      if (!response.ok) {
        Logger.warn('Word not found for phonetic', { word });
        return undefined;
      }

      const data: DictionaryAPIResponse[] = await response.json();

      // Try to get phonetic from the main entry first
      if (data[0]?.phonetic) {
        Logger.info('Phonetic retrieved from main entry', { word, phonetic: data[0].phonetic });
        return data[0].phonetic;
      }

      // Try to get phonetic from phonetics array
      if (data[0]?.phonetics && data[0].phonetics.length > 0) {
        for (const phoneticEntry of data[0].phonetics) {
          if (phoneticEntry.text) {
            Logger.info('Phonetic retrieved from phonetics array', {
              word,
              phonetic: phoneticEntry.text,
            });
            return phoneticEntry.text;
          }
        }
      }

      Logger.warn('No phonetic found for word', { word });
      return undefined;
    } catch (error) {
      Logger.error('Failed to get phonetic', {
        word,
        error: error instanceof Error ? error.message : String(error),
      });

      // Return undefined instead of throwing for phonetic failures
      return undefined;
    }
  }

  /**
   * Search for words (basic implementation)
   * Note: Free Dictionary API doesn't have a search endpoint,
   * so this is a placeholder that attempts to fetch the exact word
   * Requirements: 6.1
   */
  async searchWord(query: string): Promise<Word[]> {
    try {
      Logger.info('Searching for word', { query });

      // For now, just try to fetch the exact word
      const definitions = await this.getWordDefinitions(query);
      const phonetic = await this.getPhonetic(query);

      if (definitions.length === 0) {
        Logger.info('No results found for search', { query });
        return [];
      }

      const word: Word = {
        id: `word-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        word: query.toLowerCase(),
        phonetic,
        definitions,
        examples: [], // Examples will be provided by ExampleSentenceService
        associations: [],
        generatedAt: new Date(),
      };

      Logger.info('Search completed', { query, resultCount: 1 });
      return [word];
    } catch (error) {
      Logger.error('Search failed', {
        query,
        error: error instanceof Error ? error.message : String(error),
      });

      // Return empty array instead of throwing for search failures
      return [];
    }
  }
}

// Export singleton instance
export const dictionaryService = new DictionaryServiceImpl();
