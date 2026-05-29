/**
 * LearningPlanService Implementation
 * 
 * Manages learning plan creation, updates, and retrieval.
 * Uses validation functions and StorageService for data persistence.
 * 
 * Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 2.1
 */

import type { LearningPlanService, LearningPlan } from '../types';
import { validateDaysCount, validateWordsPerDay } from '../utils/validation';
import { storageService } from './StorageService';
import { ValidationError } from '../types/error';

/**
 * Generate a unique ID for learning plans
 */
function generatePlanId(): string {
  return `plan-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * LearningPlanService implementation
 */
export class LearningPlanServiceImpl implements LearningPlanService {
  /**
   * Create a new learning plan
   * 
   * Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 1.6
   * 
   * @param daysCount - Number of days in the learning plan (1-365)
   * @param wordsPerDay - Number of words to learn per day (1-100)
   * @returns The created learning plan
   * @throws ValidationError if parameters are invalid
   */
  async createPlan(daysCount: number, wordsPerDay: number): Promise<LearningPlan> {
    // Validate daysCount (Requirement 1.4)
    const daysValidation = validateDaysCount(daysCount);
    if (!daysValidation.valid) {
      throw new ValidationError(daysValidation.errors.join('; '));
    }

    // Validate wordsPerDay (Requirement 1.5)
    const wordsValidation = validateWordsPerDay(wordsPerDay);
    if (!wordsValidation.valid) {
      throw new ValidationError(wordsValidation.errors.join('; '));
    }

    // Create the learning plan
    const now = new Date();
    const plan: LearningPlan = {
      id: generatePlanId(),
      daysCount,
      wordsPerDay,
      startDate: now,
      createdAt: now,
      updatedAt: now,
    };

    // Save the plan (Requirement 1.6)
    await storageService.savePlan(plan);

    return plan;
  }

  /**
   * Update an existing learning plan
   * 
   * Requirements: 2.1, 2.2
   * 
   * @param id - The ID of the plan to update
   * @param updates - Partial plan data to update
   * @returns The updated learning plan
   * @throws ValidationError if updates are invalid
   * @throws Error if plan not found
   */
  async updatePlan(id: string, updates: Partial<LearningPlan>): Promise<LearningPlan> {
    // Load the existing plan
    const existingPlan = await storageService.loadPlan(id);
    if (!existingPlan) {
      throw new Error(`学习计划未找到: ${id}`);
    }

    // Validate updates if daysCount is being changed
    if (updates.daysCount !== undefined) {
      const daysValidation = validateDaysCount(updates.daysCount);
      if (!daysValidation.valid) {
        throw new ValidationError(daysValidation.errors.join('; '));
      }
    }

    // Validate updates if wordsPerDay is being changed
    if (updates.wordsPerDay !== undefined) {
      const wordsValidation = validateWordsPerDay(updates.wordsPerDay);
      if (!wordsValidation.valid) {
        throw new ValidationError(wordsValidation.errors.join('; '));
      }
    }

    // Create updated plan
    // Note: We preserve the original id, startDate, and createdAt
    // Only updatedAt is changed to reflect the modification time
    const updatedPlan: LearningPlan = {
      ...existingPlan,
      ...updates,
      id: existingPlan.id, // Ensure ID cannot be changed
      startDate: existingPlan.startDate, // Preserve original start date
      createdAt: existingPlan.createdAt, // Preserve creation time
      updatedAt: new Date(), // Update modification time
    };

    // Save the updated plan
    await storageService.savePlan(updatedPlan);

    return updatedPlan;
  }

  /**
   * Get the current active learning plan
   * 
   * Requirements: 1.7
   * 
   * @returns The current learning plan or null if none exists
   */
  async getCurrentPlan(): Promise<LearningPlan | null> {
    return await storageService.loadCurrentPlan();
  }

  /**
   * Delete a learning plan
   * 
   * Note: This is a basic implementation. In a production system, you might want to:
   * - Archive the plan instead of deleting
   * - Clean up associated data (word lists, progress)
   * - Prevent deletion if there's active progress
   * 
   * @param id - The ID of the plan to delete
   * @throws Error if plan not found
   */
  async deletePlan(id: string): Promise<void> {
    // Verify the plan exists
    const existingPlan = await storageService.loadPlan(id);
    if (!existingPlan) {
      throw new Error(`学习计划未找到: ${id}`);
    }

    // Note: The actual deletion logic would need to be implemented in StorageService
    // For now, this is a placeholder that demonstrates the interface
    // In a full implementation, you would:
    // 1. Delete the plan from storage
    // 2. Clean up associated word lists
    // 3. Clean up progress data
    // 4. Clear currentPlanId if this was the current plan
    
    throw new Error('删除功能尚未实现');
  }
}

// Export singleton instance
export const learningPlanService = new LearningPlanServiceImpl();
