/**
 * Tests for Environment Configuration Utility
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getEnvConfig, validateEnvConfig, getActiveAIConfig } from './envConfig';

describe('envConfig', () => {
  beforeEach(() => {
    // Reset environment variables before each test
    vi.unstubAllEnvs();
  });

  describe('getEnvConfig', () => {
    it('should return default configuration when no env vars are set', () => {
      // Stub VITE_AI_PROVIDER to ensure default 'openai' is used regardless of .env file
      vi.stubEnv('VITE_AI_PROVIDER', '');
      const config = getEnvConfig();
      
      expect(config).toBeDefined();
      expect(config.aiProvider).toBe('openai');
      expect(config.dictionaryApiUrl).toBe('https://api.dictionaryapi.dev/api/v2');
      expect(config.maxApiRetries).toBe(3);
      expect(config.apiTimeout).toBe(30000);
      expect(config.debugMode).toBe(false);
      expect(config.aiModel).toBeUndefined();
      expect(config.aiApiUrl).toBeUndefined();
    });

    it('should use default values for OpenAI configuration', () => {
      const config = getEnvConfig();
      
      expect(config.openai.model).toBe('gpt-3.5-turbo');
      expect(config.openai.apiUrl).toBe('https://api.openai.com/v1');
    });

    it('should use default values for Claude configuration', () => {
      const config = getEnvConfig();
      
      expect(config.claude.model).toBe('claude-3-haiku-20240307');
      expect(config.claude.apiUrl).toBe('https://api.anthropic.com/v1');
    });

    it('should read generic AI model override from environment', () => {
      vi.stubEnv('VITE_AI_MODEL', 'gpt-4');
      
      const config = getEnvConfig();
      
      expect(config.aiModel).toBe('gpt-4');
    });

    it('should read generic AI API URL override from environment', () => {
      vi.stubEnv('VITE_AI_API_URL', 'https://custom-api.com/v1');
      
      const config = getEnvConfig();
      
      expect(config.aiApiUrl).toBe('https://custom-api.com/v1');
    });
  });

  describe('validateEnvConfig', () => {
    it('should return errors when OpenAI provider is selected but API key is missing', () => {
      // Mock environment with OpenAI provider but no key
      vi.stubEnv('VITE_AI_PROVIDER', 'openai');
      vi.stubEnv('VITE_OPENAI_API_KEY', '');
      
      const result = validateEnvConfig();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('OpenAI API key is required when using OpenAI provider.');
    });

    it('should return warnings when OpenAI API key does not start with sk-', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'openai');
      vi.stubEnv('VITE_OPENAI_API_KEY', 'invalid-key');
      
      const result = validateEnvConfig();
      
      expect(result.warnings).toContain('OpenAI API key should start with "sk-". Please verify your key.');
    });

    it('should return errors when Claude provider is selected but API key is missing', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'claude');
      vi.stubEnv('VITE_CLAUDE_API_KEY', '');
      
      const result = validateEnvConfig();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Claude API key is required when using Claude provider.');
    });

    it('should return warnings when Claude API key does not start with sk-ant-', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'claude');
      vi.stubEnv('VITE_CLAUDE_API_KEY', 'invalid-key');
      
      const result = validateEnvConfig();
      
      expect(result.warnings).toContain('Claude API key should start with "sk-ant-". Please verify your key.');
    });

    it('should return errors for invalid AI provider', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'invalid');
      
      const result = validateEnvConfig();
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid AI provider: "invalid". Must be "openai", "claude", "doubao", or "deepseek".');
    });

    it('should return warnings for out-of-range retry count', () => {
      vi.stubEnv('VITE_MAX_API_RETRIES', '20');
      
      const result = validateEnvConfig();
      
      expect(result.warnings).toContain('Max API retries should be between 0 and 10.');
    });

    it('should return warnings for out-of-range timeout', () => {
      vi.stubEnv('VITE_API_TIMEOUT', '200000');
      
      const result = validateEnvConfig();
      
      expect(result.warnings).toContain('API timeout should be between 1000ms and 120000ms.');
    });

    it('should validate successfully with proper OpenAI configuration', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'openai');
      vi.stubEnv('VITE_OPENAI_API_KEY', 'sk-test-key-123');
      vi.stubEnv('VITE_DICTIONARY_API_URL', 'https://api.dictionaryapi.dev/api/v2');
      
      const result = validateEnvConfig();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should validate successfully with proper Claude configuration', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'claude');
      vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key-123');
      vi.stubEnv('VITE_DICTIONARY_API_URL', 'https://api.dictionaryapi.dev/api/v2');
      
      const result = validateEnvConfig();
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe('getActiveAIConfig', () => {
    it('should return OpenAI config when OpenAI provider is selected', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'openai');
      vi.stubEnv('VITE_OPENAI_API_KEY', 'sk-test-key');
      vi.stubEnv('VITE_OPENAI_MODEL', 'gpt-4');
      
      const config = getActiveAIConfig();
      
      expect(config.provider).toBe('openai');
      expect(config.apiKey).toBe('sk-test-key');
      expect(config.model).toBe('gpt-4');
    });

    it('should return Claude config when Claude provider is selected', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'claude');
      vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');
      vi.stubEnv('VITE_CLAUDE_MODEL', 'claude-3-opus-20240229');
      
      const config = getActiveAIConfig();
      
      expect(config.provider).toBe('claude');
      expect(config.apiKey).toBe('sk-ant-test-key');
      expect(config.model).toBe('claude-3-opus-20240229');
    });

    it('should use generic AI model override for OpenAI provider', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'openai');
      vi.stubEnv('VITE_OPENAI_API_KEY', 'sk-test-key');
      vi.stubEnv('VITE_OPENAI_MODEL', 'gpt-3.5-turbo');
      vi.stubEnv('VITE_AI_MODEL', 'gpt-4-turbo');
      
      const config = getActiveAIConfig();
      
      expect(config.provider).toBe('openai');
      expect(config.model).toBe('gpt-4-turbo');
    });

    it('should use generic AI model override for Claude provider', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'claude');
      vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');
      vi.stubEnv('VITE_CLAUDE_MODEL', 'claude-3-haiku-20240307');
      vi.stubEnv('VITE_AI_MODEL', 'claude-3-opus-20240229');
      
      const config = getActiveAIConfig();
      
      expect(config.provider).toBe('claude');
      expect(config.model).toBe('claude-3-opus-20240229');
    });

    it('should use generic AI API URL override for OpenAI provider', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'openai');
      vi.stubEnv('VITE_OPENAI_API_KEY', 'sk-test-key');
      vi.stubEnv('VITE_OPENAI_API_URL', 'https://api.openai.com/v1');
      vi.stubEnv('VITE_AI_API_URL', 'https://custom-openai.com/v1');
      
      const config = getActiveAIConfig();
      
      expect(config.provider).toBe('openai');
      expect(config.apiUrl).toBe('https://custom-openai.com/v1');
    });

    it('should use generic AI API URL override for Claude provider', () => {
      vi.stubEnv('VITE_AI_PROVIDER', 'claude');
      vi.stubEnv('VITE_CLAUDE_API_KEY', 'sk-ant-test-key');
      vi.stubEnv('VITE_CLAUDE_API_URL', 'https://api.anthropic.com/v1');
      vi.stubEnv('VITE_AI_API_URL', 'https://custom-claude.com/v1');
      
      const config = getActiveAIConfig();
      
      expect(config.provider).toBe('claude');
      expect(config.apiUrl).toBe('https://custom-claude.com/v1');
    });
  });
});
