/**
 * Type Definitions Index
 * 
 * Central export point for all type definitions used in the Vocabulary Learning App.
 */

// Learning Plan types
export type { LearningPlan, LearningPlanValidation } from './learningPlan';

// Word types
export type { Word, WordDefinition, ExampleSentence } from './word';

// Word List types
export type { 
  DailyWordList, 
  WordAssociation, 
  SentenceChain,
  AssociationType 
} from './wordList';

// Progress types
export type { LearningProgress, DailyRecord } from './progress';

// Error types
export type { 
  ErrorLog, 
  ErrorType, 
  ErrorSeverity, 
  ErrorContext 
} from './error';

export { 
  StorageError, 
  ValidationError, 
  NetworkError, 
  GenerationError 
} from './error';

// Context types
export type { 
  ApplicationContext, 
  ContextAnalysisResult 
} from './context';

export { 
  ContextLabels, 
  ContextColors 
} from './context';

// Service interfaces
export type {
  LearningPlanService,
  WordGeneratorService,
  DictionaryService,
  ExampleSentenceService,
  ProgressService,
  StorageService
} from './services';
