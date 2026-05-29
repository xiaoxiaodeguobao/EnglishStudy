/**
 * ReviewPage Component Tests
 * 
 * Tests for the ReviewPage component including search, date filtering, and word display.
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ReviewPage from './ReviewPage';
import { storageService } from '../services/StorageService';
import type { Word } from '../types/word';

// Mock the StorageService
vi.mock('../services/StorageService', () => ({
  storageService: {
    getWordsByDateRange: vi.fn(),
    searchWords: vi.fn(),
  },
}));

// Mock WordList component
vi.mock('../components/WordList', () => ({
  WordList: ({ words, loading }: { words: Word[]; loading: boolean }) => (
    <div data-testid="word-list">
      {loading && <div>Loading...</div>}
      {!loading && words.length === 0 && <div>No words</div>}
      {!loading && words.length > 0 && (
        <div>
          {words.map((word) => (
            <div key={word.id} data-testid={`word-${word.id}`}>
              {word.word}
            </div>
          ))}
        </div>
      )}
    </div>
  ),
}));

// Mock ErrorMessage component
vi.mock('../components/ErrorMessage', () => ({
  ErrorMessage: ({ message, onRetry }: { message: string; onRetry: () => void }) => (
    <div data-testid="error-message">
      <p>{message}</p>
      <button onClick={onRetry}>Retry</button>
    </div>
  ),
}));

describe('ReviewPage', () => {
  const mockWords: Word[] = [
    {
      id: '1',
      word: 'hello',
      phonetic: '/həˈloʊ/',
      definitions: [
        {
          partOfSpeech: 'interjection',
          meaningCN: '你好',
          meaningEN: 'used as a greeting',
        },
      ],
      examples: [
        {
          sentence: 'Hello, how are you?',
          translation: '你好，你好吗？',
          highlightWord: 'Hello',
        },
      ],
      associations: [],
      generatedAt: new Date('2024-01-15'),
    },
    {
      id: '2',
      word: 'world',
      phonetic: '/wɜːrld/',
      definitions: [
        {
          partOfSpeech: 'noun',
          meaningCN: '世界',
          meaningEN: 'the earth and all its inhabitants',
        },
      ],
      examples: [
        {
          sentence: 'The world is beautiful.',
          translation: '世界是美丽的。',
          highlightWord: 'world',
        },
      ],
      associations: [],
      generatedAt: new Date('2024-01-16'),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Load (Requirement 9.1)', () => {
    it('should load and display historical words on mount', async () => {
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);

      render(<ReviewPage />);

      // Should show loading state initially
      expect(screen.getByText('Loading...')).toBeInTheDocument();

      // Wait for words to load
      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
        expect(screen.getByTestId('word-2')).toBeInTheDocument();
      });

      // Verify getWordsByDateRange was called
      expect(storageService.getWordsByDateRange).toHaveBeenCalledTimes(1);
    });

    it('should display word count', async () => {
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByText(/找到/)).toBeInTheDocument();
        expect(screen.getByText('2')).toBeInTheDocument();
      });
    });

    it('should handle empty word list', async () => {
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue([]);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByText('No words')).toBeInTheDocument();
      });
    });
  });

  describe('Search Functionality (Requirement 9.4)', () => {
    it('should search words when search button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);
      vi.mocked(storageService.searchWords).mockResolvedValue([mockWords[0]]);

      render(<ReviewPage />);

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
      });

      // Type in search box
      const searchInput = screen.getByPlaceholderText('搜索单词...');
      await user.type(searchInput, 'hello');

      // Click search button
      const searchButton = screen.getByRole('button', { name: '搜索' });
      await user.click(searchButton);

      // Verify searchWords was called
      await waitFor(() => {
        expect(storageService.searchWords).toHaveBeenCalledWith('hello');
      });

      // Should display only the searched word
      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
        expect(screen.queryByTestId('word-2')).not.toBeInTheDocument();
      });
    });

    it('should search words when Enter key is pressed', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);
      vi.mocked(storageService.searchWords).mockResolvedValue([mockWords[0]]);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('搜索单词...');
      await user.type(searchInput, 'hello{Enter}');

      await waitFor(() => {
        expect(storageService.searchWords).toHaveBeenCalledWith('hello');
      });
    });

    it('should reload all words when search query is empty', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
      });

      // Clear search and click search button
      const searchInput = screen.getByPlaceholderText('搜索单词...');
      await user.clear(searchInput);
      
      const searchButton = screen.getByRole('button', { name: '搜索' });
      await user.click(searchButton);

      // Should call getWordsByDateRange again (reload all)
      await waitFor(() => {
        expect(storageService.getWordsByDateRange).toHaveBeenCalledTimes(2);
      });
    });

    it('should display error when search fails', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);
      vi.mocked(storageService.searchWords).mockRejectedValue(new Error('Search failed'));

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('搜索单词...');
      await user.type(searchInput, 'test');

      const searchButton = screen.getByRole('button', { name: '搜索' });
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('搜索失败，请稍后重试')).toBeInTheDocument();
      });
    });
  });

  describe('Date Range Filter (Requirement 9.2)', () => {
    it('should filter words by date range', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
      });

      // Open filters
      const filterButton = screen.getByRole('button', { name: '切换筛选器' });
      await user.click(filterButton);

      // Set date range
      const startDateInput = screen.getByLabelText('开始日期');
      const endDateInput = screen.getByLabelText('结束日期');
      
      await user.type(startDateInput, '2024-01-15');
      await user.type(endDateInput, '2024-01-16');

      // Apply filter
      const applyButton = screen.getByRole('button', { name: '应用筛选' });
      await user.click(applyButton);

      // Verify getWordsByDateRange was called with correct dates
      await waitFor(() => {
        expect(storageService.getWordsByDateRange).toHaveBeenCalledWith(
          new Date('2024-01-15'),
          new Date('2024-01-16')
        );
      });
    });

    it('should show error when start date is after end date', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
      });

      // Open filters
      const filterButton = screen.getByRole('button', { name: '切换筛选器' });
      await user.click(filterButton);

      // Set invalid date range
      const startDateInput = screen.getByLabelText('开始日期');
      const endDateInput = screen.getByLabelText('结束日期');
      
      await user.type(startDateInput, '2024-01-20');
      await user.type(endDateInput, '2024-01-10');

      // Apply filter
      const applyButton = screen.getByRole('button', { name: '应用筛选' });
      await user.click(applyButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('开始日期不能晚于结束日期')).toBeInTheDocument();
      });
    });

    it('should show error when dates are not selected', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
      });

      // Open filters
      const filterButton = screen.getByRole('button', { name: '切换筛选器' });
      await user.click(filterButton);

      // Apply filter without setting dates
      const applyButton = screen.getByRole('button', { name: '应用筛选' });
      await user.click(applyButton);

      // Should show error
      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('请选择开始日期和结束日期')).toBeInTheDocument();
      });
    });

    it('should toggle filter visibility', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
      });

      // Filters should not be visible initially
      expect(screen.queryByLabelText('开始日期')).not.toBeInTheDocument();

      // Open filters
      const filterButton = screen.getByRole('button', { name: '切换筛选器' });
      await user.click(filterButton);

      // Filters should be visible
      expect(screen.getByLabelText('开始日期')).toBeInTheDocument();
      expect(screen.getByLabelText('结束日期')).toBeInTheDocument();

      // Close filters
      await user.click(filterButton);

      // Filters should be hidden again
      expect(screen.queryByLabelText('开始日期')).not.toBeInTheDocument();
    });
  });

  describe('Clear Filters', () => {
    it('should clear all filters and reload words', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);
      vi.mocked(storageService.searchWords).mockResolvedValue([mockWords[0]]);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
      });

      // Set search query
      const searchInput = screen.getByPlaceholderText('搜索单词...');
      await user.type(searchInput, 'hello');

      // Open filters and set dates
      const filterButton = screen.getByRole('button', { name: '切换筛选器' });
      await user.click(filterButton);

      const startDateInput = screen.getByLabelText('开始日期');
      const endDateInput = screen.getByLabelText('结束日期');
      
      await user.type(startDateInput, '2024-01-15');
      await user.type(endDateInput, '2024-01-16');

      // Clear filters using the X button
      const clearButton = screen.getByRole('button', { name: '清除筛选' });
      await user.click(clearButton);

      // Verify filters are cleared
      expect(searchInput).toHaveValue('');
      expect(startDateInput).toHaveValue('');
      expect(endDateInput).toHaveValue('');

      // Should reload all words
      await waitFor(() => {
        expect(storageService.getWordsByDateRange).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Word Display (Requirement 9.3)', () => {
    it('should display complete word information', async () => {
      vi.mocked(storageService.getWordsByDateRange).mockResolvedValue(mockWords);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
        expect(screen.getByText('hello')).toBeInTheDocument();
        expect(screen.getByTestId('word-2')).toBeInTheDocument();
        expect(screen.getByText('world')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should display error when initial load fails', async () => {
      vi.mocked(storageService.getWordsByDateRange).mockRejectedValue(
        new Error('Load failed')
      );

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
        expect(screen.getByText('无法加载历史单词，请稍后重试')).toBeInTheDocument();
      });
    });

    it('should retry loading words when retry button is clicked', async () => {
      const user = userEvent.setup();
      vi.mocked(storageService.getWordsByDateRange)
        .mockRejectedValueOnce(new Error('Load failed'))
        .mockResolvedValueOnce(mockWords);

      render(<ReviewPage />);

      await waitFor(() => {
        expect(screen.getByTestId('error-message')).toBeInTheDocument();
      });

      const retryButton = screen.getByRole('button', { name: 'Retry' });
      await user.click(retryButton);

      await waitFor(() => {
        expect(screen.getByTestId('word-1')).toBeInTheDocument();
        expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
      });
    });
  });
});
