/**
 * Daily Learning Page
 * 
 * Main daily learning interface where users interact with their daily word list.
 * Displays current date, word list, sentence chains, and word associations.
 * Allows users to generate new words and mark the day as complete.
 * Requirements: 3.1, 3.2, 3.3, 3.4, 4.4, 5.1, 5.2, 5.3, 8.4, 8.5, 8.6
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useDailyWordsStore, useLearningPlanStore, useProgressStore } from '../stores';
import { WordList, SentenceChainSection, WordAssociationDisplay, ErrorMessage, ContextFilter } from '../components';
import { Calendar, CheckCircle, RefreshCw, Sparkles } from 'lucide-react';
import type { ApplicationContext } from '../services/ai/types';
import type { EnhancedSentenceChain } from '../services/enhanced/types';
import type { SentenceChain } from '../types/wordList';

export function DailyLearningPage() {
  const queryClient = useQueryClient();
  const { currentWordList, loading, isGenerating, error, loadDailyWords, generateNewWords, clearError, setQueryClient } = useDailyWordsStore();
  const { currentPlan, loadCurrentPlan } = useLearningPlanStore();
  const { progress, markComplete, loadProgress } = useProgressStore();
  
  // Current date state - normalized to midnight for consistent cache lookup
  const [currentDate] = useState(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });
  const [isCompleting, setIsCompleting] = useState(false);
  const [showCompleteSuccess, setShowCompleteSuccess] = useState(false);
  
  // Context filtering state for sentence chains (Requirement 8.6)
  const [selectedContexts, setSelectedContexts] = useState<ApplicationContext[]>([]);
  
  // Generation guard to prevent duplicate auto-generation calls
  const autoGenerationAttemptedRef = useRef(false);

  // Set queryClient in store for cache management
  useEffect(() => {
    setQueryClient(queryClient);
  }, [queryClient, setQueryClient]);

  // Load current plan and daily words on mount
  useEffect(() => {
    loadCurrentPlan();
  }, [loadCurrentPlan]);

  useEffect(() => {
    if (currentPlan) {
      loadDailyWords(currentDate);
      loadProgress(currentPlan.id);
    }
  }, [currentPlan, currentDate, loadDailyWords, loadProgress]);

  // Auto-generation effect: automatically generate words when conditions are met
  // This addresses the bug where words are not automatically generated on first visit
  useEffect(() => {
    // Conditions for auto-generation:
    // 1. currentPlan exists (user has a learning plan)
    // 2. currentWordList is null (no words in storage for this date)
    // 3. loading is false (not currently loading)
    // 4. isGenerating is false (not currently generating)
    // 5. no error present (previous operations succeeded)
    // 6. auto-generation hasn't been attempted yet (guard against duplicate calls)
    const shouldAutoGenerate = 
      currentPlan !== null &&
      currentWordList === null &&
      !loading &&
      !isGenerating &&
      !error &&
      !autoGenerationAttemptedRef.current;

    if (shouldAutoGenerate) {
      // Mark that we've attempted auto-generation to prevent duplicate calls
      autoGenerationAttemptedRef.current = true;

      // Automatically generate and persist words
      const autoGenerate = async () => {
        try {
          await generateNewWords(currentPlan.id, currentDate, currentPlan.wordsPerDay);
        } catch (err) {
          // Error is already handled by the store, just log for debugging
          console.error('Auto-generation failed:', err);
        }
      };

      autoGenerate();
    }
  }, [currentPlan, currentWordList, loading, isGenerating, error, currentDate, generateNewWords]);

  // Reset auto-generation guard when date changes
  useEffect(() => {
    autoGenerationAttemptedRef.current = false;
  }, [currentDate]);

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  // Handle generate new words
  const handleGenerateWords = async () => {
    if (!currentPlan) {
      return;
    }

    try {
      await generateNewWords(currentPlan.id, currentDate, currentPlan.wordsPerDay);
    } catch (err) {
      console.error('Failed to generate words:', err);
    }
  };

  // Handle mark day complete (Requirement 8.5)
  const handleMarkComplete = async () => {
    if (!currentPlan) {
      return;
    }

    setIsCompleting(true);
    try {
      await markComplete(currentPlan.id, currentDate);
      setShowCompleteSuccess(true);
      setTimeout(() => setShowCompleteSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to mark complete:', err);
    } finally {
      setIsCompleting(false);
    }
  };

  // Handle retry for errors
  const handleRetry = () => {
    clearError();
    if (currentWordList) {
      loadDailyWords(currentDate);
    } else {
      handleGenerateWords();
    }
  };

  // Check if today is already completed
  const isTodayCompleted = progress?.dailyRecords.some(
    record => 
      new Date(record.date).toDateString() === currentDate.toDateString() && 
      record.completed
  );

  /**
   * Type guard to check if a sentence chain is enhanced
   * Requirement 5.3: Support enhanced sentence chains with context
   */
  function isEnhancedSentenceChain(chain: SentenceChain | EnhancedSentenceChain): chain is EnhancedSentenceChain {
    return 'context' in chain && 'qualityScore' in chain;
  }

  /**
   * Convert regular sentence chains to enhanced format
   * This ensures backward compatibility while supporting enhanced features
   * Requirements: 5.1, 5.2, 5.3
   */
  const enhancedSentenceChains = useMemo<EnhancedSentenceChain[]>(() => {
    if (!currentWordList?.sentenceChains) {
      return [];
    }

    return currentWordList.sentenceChains.map((chain): EnhancedSentenceChain => {
      // If already enhanced, return as-is
      if (isEnhancedSentenceChain(chain)) {
        return chain;
      }

      // Convert regular chain to enhanced format
      // Default to 'daily-conversation' context for backward compatibility
      return {
        ...chain,
        context: 'daily-conversation' as ApplicationContext,
        qualityScore: 0.8, // Default quality score
        metadata: {
          generatedAt: new Date(),
          model: 'legacy',
          tokensUsed: 0,
        },
      };
    });
  }, [currentWordList?.sentenceChains]);

  /**
   * Get available contexts from enhanced sentence chains
   * Requirement 8.6: Context filtering support
   */
  const availableContexts = useMemo<ApplicationContext[]>(() => {
    const contexts = new Set<ApplicationContext>();
    enhancedSentenceChains.forEach(chain => {
      contexts.add(chain.context);
    });
    return Array.from(contexts);
  }, [enhancedSentenceChains]);

  /**
   * Handle context filter changes
   * Requirement 8.6: Allow users to filter by context
   */
  const handleContextFilterChange = (contexts: ApplicationContext[]) => {
    setSelectedContexts(contexts);
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header with current date (Requirement 3.1) */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">今日学习</h2>
            <div className="flex items-center gap-2 text-gray-600">
              <Calendar className="w-5 h-5" />
              <span className="text-lg">{formatDate(currentDate)}</span>
            </div>
          </div>

          {/* Complete button (Requirement 8.5) */}
          {currentWordList && (
            <button
              onClick={handleMarkComplete}
              disabled={isCompleting || isTodayCompleted}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isTodayCompleted
                  ? 'bg-green-100 text-green-700 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500'
              }`}
            >
              <CheckCircle className="w-5 h-5" />
              {isTodayCompleted ? '今日已完成' : isCompleting ? '标记中...' : '完成学习'}
            </button>
          )}
        </div>

        {/* Success message for completion */}
        {showCompleteSuccess && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3">
            <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-green-900 font-semibold">学习完成！</h3>
              <p className="text-green-800 text-sm mt-1">
                今天的学习任务已完成，继续保持！
              </p>
            </div>
          </div>
        )}
      </div>

      {/* No plan message */}
      {!currentPlan && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 text-5xl mb-4">📚</div>
          <h3 className="text-xl font-semibold text-yellow-900 mb-2">
            还没有学习计划
          </h3>
          <p className="text-yellow-800 mb-4">
            请先创建一个学习计划，然后开始学习单词。
          </p>
          <a
            href="/"
            className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition"
          >
            创建学习计划
          </a>
        </div>
      )}

      {/* Error display (Requirement 12.3) */}
      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            errorType="generation"
            onRetry={handleRetry}
            details="请检查您的网络连接或稍后重试"
          />
        </div>
      )}

      {/* Loading indicator - shows during both load and generation */}
      {currentPlan && !currentWordList && (loading || isGenerating) && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="text-blue-600 text-5xl mb-4">
            <RefreshCw className="w-16 h-16 mx-auto animate-spin" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            {isGenerating ? '正在生成今日单词...' : '正在加载...'}
          </h3>
          <p className="text-blue-800">
            {isGenerating 
              ? `正在为您生成 ${currentPlan.wordsPerDay} 个单词，请稍候` 
              : '正在从存储中加载单词列表'}
          </p>
        </div>
      )}

      {/* Generate words prompt - only shows when not loading/generating */}
      {currentPlan && !currentWordList && !loading && !isGenerating && !error && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <div className="text-blue-600 text-5xl mb-4">
            <Sparkles className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-semibold text-blue-900 mb-2">
            准备好开始今天的学习了吗？
          </h3>
          <p className="text-blue-800 mb-6">
            点击下方按钮生成今天的 {currentPlan.wordsPerDay} 个单词
          </p>
          <button
            onClick={handleGenerateWords}
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <RefreshCw className="w-5 h-5" />
            生成今日单词
          </button>
        </div>
      )}

      {/* Word list section (Requirements 3.2) */}
      {currentWordList && (
        <div className="space-y-8">
          {/* Word List */}
          <section>
            <div className="mb-4">
              <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                <span className="inline-block w-1 h-8 bg-blue-500 mr-3 rounded"></span>
                今日单词
                <span className="ml-3 text-base font-normal text-gray-600">
                  ({currentWordList.words.length} 个单词)
                </span>
              </h3>
            </div>
            <WordList words={currentWordList.words} loading={false} />
          </section>

          {/* Word Associations section (Requirements 3.3, 4.4) */}
          {currentWordList.associations && currentWordList.associations.length > 0 && (
            <section>
              <div className="mb-4">
                <h3 className="text-2xl font-semibold text-gray-800 flex items-center">
                  <span className="inline-block w-1 h-8 bg-purple-500 mr-3 rounded"></span>
                  单词关联
                </h3>
                <p className="text-sm text-gray-600 mt-2 ml-4">
                  理解单词之间的关联可以帮助你更好地记忆
                </p>
              </div>
              <WordAssociationDisplay
                associations={currentWordList.associations}
                words={currentWordList.words}
              />
            </section>
          )}

          {/* Sentence Chains section (Requirements 3.4, 5.1, 5.2, 5.3, 8.4, 8.5, 8.6) */}
          {enhancedSentenceChains && enhancedSentenceChains.length > 0 && (
            <section>
              {/* Context Filter (Requirement 8.6) */}
              {availableContexts.length > 1 && (
                <div className="mb-4">
                  <ContextFilter
                    contexts={availableContexts}
                    selectedContexts={selectedContexts}
                    onSelectionChange={handleContextFilterChange}
                  />
                </div>
              )}
              
              {/* Sentence Chain Display (Requirements 5.1, 5.2, 5.3, 8.4, 8.5) */}
              <SentenceChainSection
                sentenceChains={enhancedSentenceChains}
                words={currentWordList.words}
                showContextLabels={true}
                filterContexts={selectedContexts.length > 0 ? selectedContexts : undefined}
              />
            </section>
          )}

          {/* Bottom complete button for convenience */}
          {!isTodayCompleted && (
            <div className="flex justify-center pt-4">
              <button
                onClick={handleMarkComplete}
                disabled={isCompleting}
                className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700 transition focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                <CheckCircle className="w-5 h-5" />
                {isCompleting ? '标记中...' : '完成今日学习'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DailyLearningPage;
