/**
 * OpenAI Adapter Usage Examples
 * 
 * Demonstrates how to use the OpenAI adapter for generating
 * example sentences and sentence chains.
 */

import { OpenAIAdapter } from './OpenAIAdapter';
import { AIServiceConfig } from './types';
import { getActiveAIConfig } from '../../utils/envConfig';

/**
 * Example 1: Basic example sentence generation
 */
async function basicExampleGeneration() {
  // Get configuration from environment
  const envConfig = getActiveAIConfig();
  
  const config: AIServiceConfig = {
    apiKey: envConfig.apiKey,
    model: envConfig.model,
    apiUrl: envConfig.apiUrl,
    maxRetries: 3,
    timeout: 30000,
  };

  const adapter = new OpenAIAdapter(config);

  try {
    // Generate examples for a word
    const response = await adapter.generateExamples({
      word: 'study',
      context: 'daily-conversation',
      count: 3,
    });

    console.log('Generated Examples:');
    response.examples.forEach((example, index) => {
      console.log(`${index + 1}. ${example.sentence}`);
      console.log(`   ${example.translation}`);
    });

    console.log('\nMetadata:');
    console.log(`Model: ${response.metadata.model}`);
    console.log(`Tokens Used: ${response.metadata.tokensUsed}`);
    console.log(`Generation Time: ${response.metadata.generationTime}ms`);
  } catch (error) {
    console.error('Failed to generate examples:', error);
  }
}

/**
 * Example 2: Generate examples with constraints
 */
async function examplesWithConstraints() {
  const envConfig = getActiveAIConfig();
  
  const config: AIServiceConfig = {
    apiKey: envConfig.apiKey,
    model: envConfig.model,
    apiUrl: envConfig.apiUrl,
    maxRetries: 3,
    timeout: 30000,
  };

  const adapter = new OpenAIAdapter(config);

  try {
    // Generate examples with specific constraints
    const response = await adapter.generateExamples({
      word: 'analyze',
      context: 'academic-writing',
      count: 5,
      constraints: {
        minLength: 12,
        maxLength: 18,
        avoidPatterns: ['simple', 'basic'],
      },
    });

    console.log('Academic Examples with Constraints:');
    response.examples.forEach((example, index) => {
      const wordCount = example.sentence.split(' ').length;
      console.log(`${index + 1}. [${wordCount} words] ${example.sentence}`);
      console.log(`   ${example.translation}`);
    });
  } catch (error) {
    console.error('Failed to generate examples:', error);
  }
}

/**
 * Example 3: Generate sentence chains
 */
async function sentenceChainGeneration() {
  const envConfig = getActiveAIConfig();
  
  const config: AIServiceConfig = {
    apiKey: envConfig.apiKey,
    model: envConfig.model,
    apiUrl: envConfig.apiUrl,
    maxRetries: 3,
    timeout: 30000,
  };

  const adapter = new OpenAIAdapter(config);

  try {
    // Generate sentence chains using multiple words
    const chains = await adapter.generateSentenceChains(
      ['study', 'practice', 'improve', 'achieve'],
      'daily-conversation',
      5
    );

    console.log('Sentence Chains:');
    chains.forEach((chain, index) => {
      console.log(`${index + 1}. ${chain.sentence}`);
      console.log(`   ${chain.translation}`);
      console.log(`   Used words: ${chain.usedWords.join(', ')}`);
    });
  } catch (error) {
    console.error('Failed to generate sentence chains:', error);
  }
}

/**
 * Example 4: Validate connection before use
 */
async function validateBeforeUse() {
  const envConfig = getActiveAIConfig();
  
  const config: AIServiceConfig = {
    apiKey: envConfig.apiKey,
    model: envConfig.model,
    apiUrl: envConfig.apiUrl,
    maxRetries: 3,
    timeout: 30000,
  };

  const adapter = new OpenAIAdapter(config);

  // Validate connection first
  const isValid = await adapter.validateConnection();
  
  if (!isValid) {
    console.error('OpenAI connection is not valid. Check your API key and configuration.');
    return;
  }

  console.log('✓ OpenAI connection validated successfully');

  // Proceed with generation
  const response = await adapter.generateExamples({
    word: 'example',
    context: 'daily-conversation',
    count: 2,
  });

  console.log('Generated examples:', response.examples);
}

/**
 * Example 5: Handle errors gracefully
 */
async function errorHandling() {
  // Intentionally use invalid configuration
  const config: AIServiceConfig = {
    apiKey: 'invalid-key',
    model: 'gpt-3.5-turbo',
    apiUrl: 'https://api.openai.com/v1',
    maxRetries: 1,
    timeout: 5000,
  };

  const adapter = new OpenAIAdapter(config);

  try {
    await adapter.generateExamples({
      word: 'test',
      context: 'daily-conversation',
      count: 1,
    });
  } catch (error: any) {
    console.error('Error occurred:');
    console.error(`Provider: ${error.provider}`);
    console.error(`Message: ${error.message}`);
    console.error(`Status Code: ${error.statusCode || 'N/A'}`);
  }
}

// Export examples for documentation
export {
  basicExampleGeneration,
  examplesWithConstraints,
  sentenceChainGeneration,
  validateBeforeUse,
  errorHandling,
};
