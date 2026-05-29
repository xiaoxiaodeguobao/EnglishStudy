/**
 * OpenAI Adapter Implementation
 * 
 * Implements the AIService interface for OpenAI API integration.
 * Provides natural, contextual example sentence generation using GPT models.
 * 
 * **Validates: Requirements 6.3, 3.1, 3.2**
 */

import { AIServiceConfig } from './types';
import { OpenAICompatibleAdapter } from './OpenAICompatibleAdapter';

/**
 * OpenAI Adapter
 * 
 * Extends OpenAICompatibleAdapter for OpenAI API.
 * All HTTP logic is inherited from the base class.
 * 
 * Requirement 6.3: OpenAI adapter implementation
 * Requirement 3.1: Use AI service for natural sentence generation
 * Requirement 3.2: Request natural and idiomatic examples in prompts
 */
export class OpenAIAdapter extends OpenAICompatibleAdapter {
  constructor(config: AIServiceConfig) {
    super(config, 'openai');
  }
}
