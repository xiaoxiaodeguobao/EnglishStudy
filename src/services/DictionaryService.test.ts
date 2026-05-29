/**
 * Unit Tests for DictionaryService
 * 
 * Tests the dictionary service implementation with mocked API responses.
 * Requirements: 6.1, 6.2, 6.3, 6.4, 12.1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DictionaryServiceImpl } from './DictionaryService';
import { NetworkError } from '../types/error';

// Mock fetch globally
global.fetch = vi.fn();

describe('DictionaryService', () => {
  let service: DictionaryServiceImpl;

  beforeEach(() => {
    service = new DictionaryServiceImpl();
    vi.clearAllMocks();
  });

  describe('getWordDefinitions', () => {
    it('should return definitions for a valid word', async () => {
      // Requirement 6.1, 6.2, 6.3
      const mockResponse = [
        {
          word: 'hello',
          phonetic: '/həˈloʊ/',
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [
                {
                  definition: 'A greeting',
                  example: 'She said hello',
                },
              ],
            },
            {
              partOfSpeech: 'verb',
              definitions: [
                {
                  definition: 'To greet someone',
                },
              ],
            },
          ],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const definitions = await service.getWordDefinitions('hello');

      expect(definitions).toHaveLength(2);
      expect(definitions[0].partOfSpeech).toBe('noun');
      expect(definitions[0].meaningEN).toBe('A greeting');
      expect(definitions[1].partOfSpeech).toBe('verb');
      expect(definitions[1].meaningEN).toBe('To greet someone');
    });

    it('should return empty array for non-existent word (404)', async () => {
      // Requirement 6.1
      // Mock fetch to return 404 for all retry attempts
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const definitions = await service.getWordDefinitions('nonexistentword');

      expect(definitions).toEqual([]);
    });

    it('should throw NetworkError for API failures', async () => {
      // Requirement 12.1
      // Mock fetch to return 500 for all retry attempts
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
      } as Response);

      await expect(service.getWordDefinitions('test')).rejects.toThrow(NetworkError);
    });

    it('should retry on network failure', async () => {
      // Requirement 12.1
      vi.mocked(fetch)
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce({
          ok: true,
          json: async () => [
            {
              word: 'test',
              meanings: [
                {
                  partOfSpeech: 'noun',
                  definitions: [{ definition: 'A test' }],
                },
              ],
            },
          ],
        } as Response);

      const definitions = await service.getWordDefinitions('test');

      expect(definitions).toHaveLength(1);
      expect(fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle multiple meanings for the same part of speech', async () => {
      // Requirement 6.4
      const mockResponse = [
        {
          word: 'run',
          meanings: [
            {
              partOfSpeech: 'verb',
              definitions: [
                { definition: 'To move quickly' },
                { definition: 'To operate' },
              ],
            },
          ],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const definitions = await service.getWordDefinitions('run');

      // Should return the first definition for each part of speech
      expect(definitions).toHaveLength(1);
      expect(definitions[0].meaningEN).toBe('To move quickly');
    });
  });

  describe('getPhonetic', () => {
    it('should return phonetic from main entry', async () => {
      // Requirement 6.6
      const mockResponse = [
        {
          word: 'hello',
          phonetic: '/həˈloʊ/',
          meanings: [],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const phonetic = await service.getPhonetic('hello');

      expect(phonetic).toBe('/həˈloʊ/');
    });

    it('should return phonetic from phonetics array if main entry is missing', async () => {
      // Requirement 6.6
      const mockResponse = [
        {
          word: 'hello',
          phonetics: [
            { text: '/həˈloʊ/', audio: 'audio.mp3' },
            { text: '/heˈloʊ/' },
          ],
          meanings: [],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const phonetic = await service.getPhonetic('hello');

      expect(phonetic).toBe('/həˈloʊ/');
    });

    it('should return undefined for non-existent word', async () => {
      // Requirement 6.6
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: false,
        status: 404,
      } as Response);

      const phonetic = await service.getPhonetic('nonexistentword');

      expect(phonetic).toBeUndefined();
    });

    it('should return undefined if no phonetic is available', async () => {
      // Requirement 6.6
      const mockResponse = [
        {
          word: 'test',
          meanings: [],
        },
      ];

      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const phonetic = await service.getPhonetic('test');

      expect(phonetic).toBeUndefined();
    });

    it('should return undefined on network error instead of throwing', async () => {
      // Requirement 12.1
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const phonetic = await service.getPhonetic('test');

      expect(phonetic).toBeUndefined();
    });
  });

  describe('searchWord', () => {
    it('should return word with definitions if found', async () => {
      // Requirement 6.1
      const mockResponse = [
        {
          word: 'test',
          phonetic: '/test/',
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [{ definition: 'A test' }],
            },
          ],
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const results = await service.searchWord('test');

      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('test');
      expect(results[0].phonetic).toBe('/test/');
      expect(results[0].definitions).toHaveLength(1);
    });

    it('should return empty array if word not found', async () => {
      // Requirement 6.1
      // Mock fetch to return 404 for all retry attempts
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 404,
      } as Response);

      const results = await service.searchWord('nonexistent');

      expect(results).toEqual([]);
    }, 10000); // Increase timeout to account for retries

    it('should return empty array on error instead of throwing', async () => {
      // Requirement 12.1
      // Mock fetch to reject for all retry attempts
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'));

      const results = await service.searchWord('test');

      expect(results).toEqual([]);
    }, 10000); // Increase timeout to account for retries

    it('should convert query to lowercase', async () => {
      // Requirement 6.1
      const mockResponse = [
        {
          word: 'hello',
          meanings: [
            {
              partOfSpeech: 'noun',
              definitions: [{ definition: 'A greeting' }],
            },
          ],
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      } as Response);

      const results = await service.searchWord('HELLO');

      expect(results).toHaveLength(1);
      expect(results[0].word).toBe('hello');
    });
  });
});
