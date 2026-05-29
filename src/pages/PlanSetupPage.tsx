/**
 * Plan Setup Page
 * 
 * Page for creating and managing learning plans.
 * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6, 1.7, 2.1
 */

import { useState, useEffect } from 'react';
import { useLearningPlanStore } from '../stores';
import { validateDaysCount, validateWordsPerDay } from '../utils/validation';
import { ErrorMessage } from '../components/ErrorMessage';
import { Calendar, BookOpen, CheckCircle } from 'lucide-react';

export function PlanSetupPage() {
  const { currentPlan, loading, error, createPlan, updatePlan, loadCurrentPlan, clearError } = useLearningPlanStore();
  
  // Form state
  const [daysCount, setDaysCount] = useState('30');
  const [wordsPerDay, setWordsPerDay] = useState('10');
  
  // Validation state
  const [daysErrors, setDaysErrors] = useState<string[]>([]);
  const [wordsErrors, setWordsErrors] = useState<string[]>([]);
  const [touched, setTouched] = useState({ days: false, words: false });
  
  // Success state
  const [showSuccess, setShowSuccess] = useState(false);

  // Load current plan on mount
  useEffect(() => {
    loadCurrentPlan();
  }, [loadCurrentPlan]);

  // Update form when current plan loads
  useEffect(() => {
    if (currentPlan) {
      setDaysCount(currentPlan.daysCount.toString());
      setWordsPerDay(currentPlan.wordsPerDay.toString());
    }
  }, [currentPlan]);

  // Validate days count
  const handleDaysChange = (value: string) => {
    setDaysCount(value);
    if (touched.days) {
      const numValue = parseInt(value);
      const validation = validateDaysCount(numValue);
      setDaysErrors(validation.errors);
    }
  };

  // Validate words per day
  const handleWordsChange = (value: string) => {
    setWordsPerDay(value);
    if (touched.words) {
      const numValue = parseInt(value);
      const validation = validateWordsPerDay(numValue);
      setWordsErrors(validation.errors);
    }
  };

  // Handle blur events to trigger validation
  const handleDaysBlur = () => {
    setTouched(prev => ({ ...prev, days: true }));
    const numValue = parseInt(daysCount);
    const validation = validateDaysCount(numValue);
    setDaysErrors(validation.errors);
  };

  const handleWordsBlur = () => {
    setTouched(prev => ({ ...prev, words: true }));
    const numValue = parseInt(wordsPerDay);
    const validation = validateWordsPerDay(numValue);
    setWordsErrors(validation.errors);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ days: true, words: true });
    
    // Validate all fields
    const daysNum = parseInt(daysCount);
    const wordsNum = parseInt(wordsPerDay);
    
    const daysValidation = validateDaysCount(daysNum);
    const wordsValidation = validateWordsPerDay(wordsNum);
    
    setDaysErrors(daysValidation.errors);
    setWordsErrors(wordsValidation.errors);
    
    // Stop if validation fails
    if (!daysValidation.valid || !wordsValidation.valid) {
      return;
    }
    
    try {
      if (currentPlan) {
        // Update existing plan (Requirement 2.1)
        await updatePlan(currentPlan.id, {
          daysCount: daysNum,
          wordsPerDay: wordsNum,
        });
      } else {
        // Create new plan (Requirement 1.1)
        await createPlan(daysNum, wordsNum);
      }
      
      // Show success message
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (err) {
      // Error is handled by store
      console.error('Failed to save plan:', err);
    }
  };

  // Handle retry for errors
  const handleRetry = () => {
    clearError();
    handleSubmit(new Event('submit') as any);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">学习计划设置</h2>

      {/* Success message */}
      {showSuccess && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="text-green-900 font-semibold">
              {currentPlan ? '学习计划已更新' : '学习计划创建成功'}
            </h3>
            <p className="text-green-800 text-sm mt-1">
              您的学习计划已保存，可以开始学习了！
            </p>
          </div>
        </div>
      )}

      {/* Current plan display (Requirement 1.7) */}
      {currentPlan && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
          <h3 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            当前学习计划
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-blue-800">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>学习天数: <strong>{currentPlan.daysCount}</strong> 天</span>
            </div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              <span>每日单词数: <strong>{currentPlan.wordsPerDay}</strong> 个</span>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-blue-200 text-sm text-blue-700">
            <p>开始日期: {formatDate(currentPlan.startDate)}</p>
            <p className="mt-1">总单词数: <strong>{currentPlan.daysCount * currentPlan.wordsPerDay}</strong> 个</p>
          </div>
        </div>
      )}

      {/* Error display (Requirement 12.4) */}
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

      {/* Plan creation/update form (Requirements 1.2, 1.3) */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          {currentPlan ? '修改学习计划' : '创建学习计划'}
        </h3>

        {/* Days count input (Requirements 1.2, 1.4) */}
        <div className="mb-6">
          <label htmlFor="daysCount" className="block text-gray-700 font-medium mb-2">
            学习天数
          </label>
          <input
            id="daysCount"
            type="number"
            value={daysCount}
            onChange={(e) => handleDaysChange(e.target.value)}
            onBlur={handleDaysBlur}
            min="1"
            max="365"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
              daysErrors.length > 0
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
            aria-invalid={daysErrors.length > 0}
            aria-describedby={daysErrors.length > 0 ? 'days-error' : undefined}
          />
          <p className="mt-1 text-sm text-gray-500">请输入1到365之间的整数</p>
          {daysErrors.length > 0 && (
            <div id="days-error" className="mt-2 text-sm text-red-600" role="alert">
              {daysErrors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* Words per day input (Requirements 1.3, 1.5) */}
        <div className="mb-6">
          <label htmlFor="wordsPerDay" className="block text-gray-700 font-medium mb-2">
            每日学习单词数量
          </label>
          <input
            id="wordsPerDay"
            type="number"
            value={wordsPerDay}
            onChange={(e) => handleWordsChange(e.target.value)}
            onBlur={handleWordsBlur}
            min="1"
            max="100"
            className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition ${
              wordsErrors.length > 0
                ? 'border-red-300 focus:ring-red-500'
                : 'border-gray-300 focus:ring-blue-500'
            }`}
            required
            aria-invalid={wordsErrors.length > 0}
            aria-describedby={wordsErrors.length > 0 ? 'words-error' : undefined}
          />
          <p className="mt-1 text-sm text-gray-500">请输入1到100之间的整数</p>
          {wordsErrors.length > 0 && (
            <div id="words-error" className="mt-2 text-sm text-red-600" role="alert">
              {wordsErrors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}
        </div>

        {/* Submit button (Requirement 1.6) */}
        <button
          type="submit"
          disabled={loading || daysErrors.length > 0 || wordsErrors.length > 0}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          {loading ? '保存中...' : currentPlan ? '更新学习计划' : '创建学习计划'}
        </button>
      </form>
    </div>
  );
}

export default PlanSetupPage;
