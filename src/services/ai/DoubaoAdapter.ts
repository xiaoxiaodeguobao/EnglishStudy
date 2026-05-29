/**
 * Doubao Adapter Implementation
 *
 * Implements the AIService interface for Doubao (ByteDance) API integration.
 * Doubao exposes an OpenAI-compatible chat completions endpoint, so all
 * HTTP logic is inherited from OpenAICompatibleAdapter.
 *
 * **Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**
 */

import { AIServiceConfig } from './types';
import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter';

/**
 * Doubao Adapter
 *
 * Extends OpenAICompatibleAdapter for the Doubao (ByteDance) API.
 * All HTTP logic (OpenAI-compatible POST to {apiUrl}/chat/completions with
 * Bearer token, 4xx/5xx error handling, and minimal validateConnection
 * request) is inherited from the base class.
 *
 * Requirement 2.1: Implements the same AIService interface as OpenAIAdapter
 * Requirement 2.2: Configured via VITE_DOUBAO_API_KEY, VITE_DOUBAO_MODEL,
 *                  VITE_DOUBAO_API_URL (passed in through AIServiceConfig)
 * Requirement 2.3: Sends OpenAI-compatible POST to {apiUrl}/chat/completions
 *                  with Bearer token authentication
 * Requirement 2.4: HTTP 4xx/5xx errors are thrown as AIServiceError with
 *                  provider='doubao', statusCode, and original error message
 * Requirement 2.5: validateConnection sends a max_tokens: 1 minimal request
 */
export class DoubaoAdapter extends OpenAICompatibleAdapter {
  constructor(config: AIServiceConfig) {
    super(config, 'doubao');
  }
}
