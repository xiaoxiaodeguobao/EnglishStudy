/**
 * Learning Plan Types
 * 
 * Defines the structure for learning plans that users create to organize their vocabulary learning.
 * Requirements: 1.1, 1.2
 */

export interface LearningPlan {
  id: string;
  daysCount: number;        // 1-365: Total number of days in the learning plan
  wordsPerDay: number;      // 1-100: Number of words to learn each day
  startDate: Date;          // When the learning plan starts
  createdAt: Date;          // When the plan was created
  updatedAt: Date;          // When the plan was last updated
}

export interface LearningPlanValidation {
  valid: boolean;
  errors: string[];
}
