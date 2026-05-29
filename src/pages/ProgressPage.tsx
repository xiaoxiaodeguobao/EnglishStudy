/**
 * Progress Page
 * 
 * Displays learning progress statistics and daily learning records.
 * Shows total words learned, completion percentage, remaining days, and daily records.
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { useEffect } from 'react';
import { useProgressStore, useLearningPlanStore } from '../stores';
import { ErrorMessage } from '../components/ErrorMessage';
import { 
  TrendingUp, 
  BookOpen, 
  Calendar, 
  Target, 
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';

export function ProgressPage() {
  const { progress, loading, error, loadProgress, clearError } = useProgressStore();
  const { currentPlan, loadCurrentPlan } = useLearningPlanStore();

  // Load current plan and progress on mount
  useEffect(() => {
    loadCurrentPlan();
  }, [loadCurrentPlan]);

  useEffect(() => {
    if (currentPlan) {
      loadProgress(currentPlan.id);
    }
  }, [currentPlan, loadProgress]);

  // Handle retry for errors
  const handleRetry = () => {
    clearError();
    if (currentPlan) {
      loadProgress(currentPlan.id);
    }
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Format date with weekday
  const formatDateWithWeekday = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
      weekday: 'short',
    });
  };

  // Calculate progress bar width
  const getProgressBarWidth = (percentage: number) => {
    return Math.min(Math.max(percentage, 0), 100);
  };

  // Get progress bar color based on percentage
  const getProgressBarColor = (percentage: number) => {
    if (percentage >= 75) return 'bg-green-500';
    if (percentage >= 50) return 'bg-blue-500';
    if (percentage >= 25) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">学习进度</h2>
        <p className="text-gray-600">查看您的学习统计和每日记录</p>
      </div>

      {/* No plan message */}
      {!currentPlan && !loading && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-yellow-600 text-5xl mb-4">📊</div>
          <h3 className="text-xl font-semibold text-yellow-900 mb-2">
            还没有学习计划
          </h3>
          <p className="text-yellow-800 mb-4">
            请先创建一个学习计划，然后开始学习单词。
          </p>
          <a
            href="/plan-setup"
            className="inline-block bg-yellow-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-yellow-700 transition"
          >
            创建学习计划
          </a>
        </div>
      )}

      {/* Error display */}
      {error && (
        <div className="mb-6">
          <ErrorMessage
            message={error}
            errorType="storage"
            onRetry={handleRetry}
            details="请检查您的网络连接或稍后重试"
          />
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Progress content */}
      {currentPlan && progress && !loading && (
        <div className="space-y-6">
          {/* Statistics Cards (Requirements 8.2, 8.3, 8.4) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Words Card (Requirement 8.2) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">总单词数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {progress.totalWords}
                </p>
              </div>
            </div>

            {/* Completion Percentage Card (Requirement 8.3) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Target className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">完成百分比</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {progress.completionPercentage.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Remaining Days Card (Requirement 8.4) */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Clock className="w-6 h-6 text-orange-600" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">剩余天数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {progress.remainingDays}
                </p>
              </div>
            </div>

            {/* Completed Days Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm text-gray-600">已完成天数</p>
                <p className="text-3xl font-bold text-gray-900 mt-1">
                  {progress.completedDays}
                </p>
              </div>
            </div>
          </div>

          {/* Progress Bar Visualization (Requirement 8.3) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">学习进度</h3>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>已完成 {progress.completedDays} / {currentPlan.daysCount} 天</span>
                <span>{progress.completionPercentage.toFixed(1)}%</span>
              </div>
              
              {/* Progress bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor(progress.completionPercentage)}`}
                  style={{ width: `${getProgressBarWidth(progress.completionPercentage)}%` }}
                />
              </div>

              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>开始日期: {formatDate(currentPlan.startDate)}</span>
                <span>
                  预计完成: {formatDate(
                    new Date(
                      new Date(currentPlan.startDate).getTime() + 
                      currentPlan.daysCount * 24 * 60 * 60 * 1000
                    )
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Daily Records Section (Requirement 8.1) */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-gray-700" />
              <h3 className="text-lg font-semibold text-gray-900">每日学习记录</h3>
            </div>

            {progress.dailyRecords.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p>还没有学习记录</p>
                <p className="text-sm mt-1">开始学习后，这里会显示您的每日记录</p>
              </div>
            ) : (
              <div className="space-y-2">
                {/* Sort records by date (most recent first) */}
                {[...progress.dailyRecords]
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((record, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-4 rounded-lg border transition ${
                        record.completed
                          ? 'bg-green-50 border-green-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          record.completed ? 'bg-green-100' : 'bg-gray-200'
                        }`}>
                          {record.completed ? (
                            <CheckCircle className="w-5 h-5 text-green-600" />
                          ) : (
                            <Calendar className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        <div>
                          <p className={`font-medium ${
                            record.completed ? 'text-green-900' : 'text-gray-700'
                          }`}>
                            {formatDateWithWeekday(record.date)}
                          </p>
                          {record.completed && record.completedAt && (
                            <p className="text-xs text-green-700 mt-0.5">
                              完成于 {new Date(record.completedAt).toLocaleTimeString('zh-CN', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </p>
                          )}
                        </div>
                      </div>
                      <div>
                        {record.completed ? (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            已完成
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-200 text-gray-700">
                            未完成
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>

          {/* Summary Section */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">学习总结</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-600">学习计划</p>
                <p className="font-medium text-gray-900 mt-1">
                  {currentPlan.daysCount} 天 × {currentPlan.wordsPerDay} 词/天
                </p>
              </div>
              <div>
                <p className="text-gray-600">计划总单词数</p>
                <p className="font-medium text-gray-900 mt-1">
                  {currentPlan.daysCount * currentPlan.wordsPerDay} 个
                </p>
              </div>
              <div>
                <p className="text-gray-600">已学习单词数</p>
                <p className="font-medium text-gray-900 mt-1">
                  {progress.totalWords} 个
                </p>
              </div>
              <div>
                <p className="text-gray-600">平均每日完成率</p>
                <p className="font-medium text-gray-900 mt-1">
                  {currentPlan.daysCount > 0 
                    ? ((progress.completedDays / currentPlan.daysCount) * 100).toFixed(1)
                    : 0}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ProgressPage;
