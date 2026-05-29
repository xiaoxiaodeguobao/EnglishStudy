/**
 * ProgressService Implementation
 * 
 * Tracks and manages learning progress.
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5
 */

import type { ProgressService, LearningProgress, DailyRecord, LearningPlan } from '../types';
import { storageService } from './StorageService';

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
}

/**
 * ProgressService implementation
 */
export class ProgressServiceImpl implements ProgressService {
  /**
   * Get learning progress for a plan
   * Requirements: 8.1, 8.2, 8.3, 8.4
   */
  async getProgress(planId: string): Promise<LearningProgress> {
    try {
      Logger.info('Getting progress', { planId });

      // Load existing progress or create new
      let progress = await storageService.loadProgress(planId);

      if (!progress) {
        // Create initial progress
        const plan = await storageService.loadPlan(planId);
        if (!plan) {
          throw new Error(`学习计划未找到: ${planId}`);
        }

        progress = this.createInitialProgress(plan);
        await storageService.saveProgress(progress);
      } else {
        // Recalculate statistics
        progress = await this.recalculateProgress(progress, planId);
      }

      Logger.info('Progress retrieved', {
        planId,
        completedDays: progress.completedDays,
        totalWords: progress.totalWords,
      });

      return progress;
    } catch (error) {
      Logger.error('Failed to get progress', {
        planId,
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Create initial progress for a new plan
   */
  private createInitialProgress(plan: LearningPlan): LearningProgress {
    return {
      planId: plan.id,
      completedDays: 0,
      totalWords: 0,
      completionPercentage: 0,
      remainingDays: plan.daysCount,
      dailyRecords: [],
    };
  }

  /**
   * Recalculate progress statistics
   */
  private async recalculateProgress(
    progress: LearningProgress,
    planId: string
  ): Promise<LearningProgress> {
    const plan = await storageService.loadPlan(planId);
    if (!plan) {
      return progress;
    }

    // Count completed days
    const completedDays = progress.dailyRecords.filter(r => r.completed).length;

    // Calculate total words learned
    const wordLists = await storageService.loadAllWordLists(planId);
    const completedWordLists = wordLists.filter(wl => {
      const record = progress.dailyRecords.find(
        r => r.wordListId === wl.id && r.completed
      );
      return !!record;
    });
    const totalWords = completedWordLists.reduce((sum, wl) => sum + wl.words.length, 0);

    // Calculate completion percentage
    const completionPercentage = plan.daysCount > 0
      ? (completedDays / plan.daysCount) * 100
      : 0;

    // Calculate remaining days
    const remainingDays = Math.max(0, plan.daysCount - completedDays);

    return {
      ...progress,
      completedDays,
      totalWords,
      completionPercentage: Math.round(completionPercentage * 100) / 100,
      remainingDays,
    };
  }

  /**
   * Mark a day as complete
   * Requirements: 8.5
   */
  async markDayComplete(planId: string, date: Date): Promise<void> {
    try {
      Logger.info('Marking day complete', { planId, date: date.toISOString() });

      // Get current progress
      let progress = await this.getProgress(planId);

      // Find the word list for this date
      const wordList = await storageService.loadDailyWordList(date);
      if (!wordList) {
        throw new Error(`未找到该日期的单词列表: ${date.toISOString()}`);
      }

      // Check if already marked complete
      const existingRecord = progress.dailyRecords.find(
        r => r.wordListId === wordList.id
      );

      if (existingRecord) {
        if (existingRecord.completed) {
          Logger.info('Day already marked complete', { planId, date: date.toISOString() });
          return;
        }

        // Update existing record
        existingRecord.completed = true;
        existingRecord.completedAt = new Date();
      } else {
        // Add new record
        const newRecord: DailyRecord = {
          date,
          wordListId: wordList.id,
          completed: true,
          completedAt: new Date(),
        };
        progress.dailyRecords.push(newRecord);
      }

      // Recalculate progress
      progress = await this.recalculateProgress(progress, planId);

      // Save updated progress
      await storageService.saveProgress(progress);

      Logger.info('Day marked complete successfully', {
        planId,
        date: date.toISOString(),
        completedDays: progress.completedDays,
      });
    } catch (error) {
      Logger.error('Failed to mark day complete', {
        planId,
        date: date.toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
      throw error;
    }
  }

  /**
   * Get daily record for a specific date
   * Requirements: 8.1
   */
  async getDailyRecord(planId: string, date: Date): Promise<DailyRecord | null> {
    try {
      Logger.info('Getting daily record', { planId, date: date.toISOString() });

      const progress = await this.getProgress(planId);

      // Find record for the date
      const wordList = await storageService.loadDailyWordList(date);
      if (!wordList) {
        return null;
      }

      const record = progress.dailyRecords.find(r => r.wordListId === wordList.id);

      Logger.info('Daily record retrieved', {
        planId,
        date: date.toISOString(),
        found: !!record,
      });

      return record || null;
    } catch (error) {
      Logger.error('Failed to get daily record', {
        planId,
        date: date.toISOString(),
        error: error instanceof Error ? error.message : String(error),
      });
      return null;
    }
  }
}

// Export singleton instance
export const progressService = new ProgressServiceImpl();
