/**
 * Utilities Index
 * 
 * Central export point for utility functions.
 */

export { validateDaysCount, validateWordsPerDay } from './validation';
export {
  calculateAssociationRate,
  hasAssociation,
  shareCommonRoot,
  validateAssociationThreshold,
} from './wordAssociation';
export {
  getEnvConfig,
  validateEnvConfig,
  logEnvConfigStatus,
  getActiveAIConfig,
  envConfig,
  type EnvConfig,
  type ValidationResult,
} from './envConfig';
export {
  httpClient,
  HttpClient,
  type HttpRequestOptions,
  type HttpResponse,
} from './httpClient';
