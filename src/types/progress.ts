/**
 * Learning Progress Types
 * 
 * Defines the structure for tracking user learning progress.
 * Requirements: 8.1
 */

export interface LearningProgress {
  planId: string;                   // Reference to the learning plan
  completedDays: number;            // Number of days completed
  totalWords: number;               // Total number of words learned
  completionPercentage: number;     // Percentage of plan completed (0-100)
  remainingDays: number;            // Number of days remaining
  dailyRecords: DailyRecord[];      // Record of each day's learning
}

export interface DailyRecord {
  date: Date;                // The date of this record
  wordListId: string;        // Reference to the daily word list
  completed: boolean;        // Whether this day was completed
  completedAt?: Date;        // When this day was completed (if completed)
}
