/**
 * Review Page
 * 
 * Allows users to review previously learned words with filtering and search capabilities.
 * Displays historical word lists with date range filtering and search functionality.
 * Requirements: 9.1, 9.2, 9.3, 9.4
 */

import { useState, useEffect } from 'react';
import { WordList } from '../components/WordList';
import { storageService } from '../services/StorageService';
import { ErrorMessage } from '../components/ErrorMessage';
import { Word } from '../types/word';
import { Search, Calendar, Filter, X } from 'lucide-react';

export function ReviewPage() {
  // State for words and UI
  const [words, setWords] = useState<Word[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Load all words on mount (Requirement 9.1)
  useEffect(() => {
    loadAllWords();
  }, []);

  // Load all words from storage
  const loadAllWords = async () => {
    setLoading(true);
    setError(null);

    try {
      // Get words from a very wide date range to get all words
      const now = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(now.getFullYear() - 1);

      const allWords = await storageService.getWordsByDateRange(oneYearAgo, now);
      setWords(allWords);
    } catch (err) {
      console.error('Failed to load words:', err);
      setError('无法加载历史单词，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Handle search (Requirement 9.4)
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadAllWords();
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const searchResults = await storageService.searchWords(searchQuery);
      setWords(searchResults);
    } catch (err) {
      console.error('Failed to search words:', err);
      setError('搜索失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Handle date range filter (Requirement 9.2)
  const handleDateRangeFilter = async () => {
    if (!startDate || !endDate) {
      setError('请选择开始日期和结束日期');
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);

    // Validate date range
    if (start > end) {
      setError('开始日期不能晚于结束日期');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const filteredWords = await storageService.getWordsByDateRange(start, end);
      setWords(filteredWords);
    } catch (err) {
      console.error('Failed to filter by date range:', err);
      setError('日期筛选失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  // Clear all filters
  const handleClearFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    setError(null);
    loadAllWords();
  };

  // Handle retry for errors
  const handleRetry = () => {
    setError(null);
    loadAllWords();
  };

  // Handle search input key press
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">单词复习</h2>
        <p className="text-gray-600">查看和复习之前学习过的单词</p>
      </div>

      {/* Search and Filter Section (Requirements 9.2, 9.4) */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        {/* Search Bar (Requirement 9.4) */}
        <div className="flex gap-3 mb-4">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearchKeyPress}
              placeholder="搜索单词..."
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              aria-label="搜索单词"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            搜索
          </button>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2"
            aria-label="切换筛选器"
          >
            <Filter className="h-5 w-5" />
            筛选
          </button>
        </div>

        {/* Date Range Filter (Requirement 9.2) */}
        {showFilters && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-5 w-5 text-gray-600" />
              <h3 className="text-sm font-semibold text-gray-700">日期范围筛选</h3>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                  开始日期
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                  结束日期
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                />
              </div>
              
              <div className="flex items-end gap-2">
                <button
                  onClick={handleDateRangeFilter}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  应用筛选
                </button>
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                  aria-label="清除筛选"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Active filters display */}
        {(searchQuery || startDate || endDate) && (
          <div className="border-t border-gray-200 pt-4 mt-4">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-gray-700">当前筛选:</span>
              
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                  搜索: {searchQuery}
                </span>
              )}
              
              {startDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  开始: {startDate}
                </span>
              )}
              
              {endDate && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">
                  结束: {endDate}
                </span>
              )}
              
              <button
                onClick={handleClearFilters}
                className="text-sm text-gray-600 hover:text-gray-900 underline"
              >
                清除所有筛选
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Error display */}
      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            errorType="storage"
            onRetry={handleRetry}
            details="请检查您的筛选条件或稍后重试"
          />
        </div>
      )}

      {/* Results count */}
      {!loading && !error && (
        <div className="mb-4">
          <p className="text-sm text-gray-600">
            找到 <span className="font-semibold text-gray-900">{words.length}</span> 个单词
          </p>
        </div>
      )}

      {/* Word List Display (Requirement 9.3) */}
      <WordList words={words} loading={loading} />
    </div>
  );
}

export default ReviewPage;
