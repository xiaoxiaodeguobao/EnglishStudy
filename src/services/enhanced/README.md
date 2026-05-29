# Enhanced Example Sentence Services

This directory contains the enhanced example sentence generation system with AI-powered, context-aware, and quality-controlled sentence generation.

## Overview

The enhanced services provide:

- **AI-Powered Generation**: Uses OpenAI or Claude to generate natural, diverse example sentences
- **Context Awareness**: Identifies and generates examples for different application scenarios (daily conversation, business, academic, technical, literary)
- **Quality Control**: Assesses diversity and naturalness of generated content
- **Intelligent Caching**: Caches generated examples to minimize API calls
- **Dependency Injection**: Clean architecture with proper service wiring

## Architecture

```
ServiceFactory
├── AIService (OpenAI/Claude)
├── ContextAnalyzer
├── QualityAssessor
├── CacheManager
├── EnhancedExampleSentenceService
└── SentenceChainService
```

## Quick Start

### 1. Initialize the Service Factory

Initialize the service factory once at application startup:

```typescript
import { initializeServiceFactory } from './services/enhanced';

// In main.tsx or App.tsx
async function initializeApp() {
  await initializeServiceFactory();
  // ... rest of app initialization
}
```

### 2. Use the Enhanced Example Sentence Service

```typescript
import { getEnhancedExampleSentenceService } from './services/enhanced';

const service = getEnhancedExampleSentenceService();

// Get examples with cache
const examples = await service.getExamplesWithCache('hello', 10);

// Generate examples with custom options
const result = await service.generateEnhancedExamples('innovation', {
  count: 15,
  contexts: ['business-communication', 'technical-documentation'],
  minQualityScore: 0.8,
  maxRetries: 3,
});
```

### 3. Use the Sentence Chain Service

```typescript
import { getSentenceChainService } from './services/enhanced';

const service = getSentenceChainService();

// Generate sentence chains using multiple words
const chains = await service.getSentenceChainsWithCache(words, 5);
```

## Configuration

The service factory loads configuration from environment variables:

```env
# AI Provider Selection
VITE_AI_PROVIDER=openai  # or 'claude'

# OpenAI Configuration
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_MODEL=gpt-3.5-turbo
VITE_OPENAI_API_URL=https://api.openai.com/v1

# Claude Configuration
VITE_CLAUDE_API_KEY=sk-ant-...
VITE_CLAUDE_MODEL=claude-3-haiku-20240307
VITE_CLAUDE_API_URL=https://api.anthropic.com/v1

# API Configuration
VITE_MAX_API_RETRIES=3
VITE_API_TIMEOUT=30000
```

Default configuration is used when environment variables are not set. See `src/config/types.ts` for all configuration options.

## Services

### ServiceFactory

The central factory for creating and managing service instances.

```typescript
import { serviceFactory } from './services/enhanced';

// Initialize
await serviceFactory.initialize();

// Access services
const aiService = serviceFactory.getAIService();
const contextAnalyzer = serviceFactory.getContextAnalyzer();
const qualityAssessor = serviceFactory.getQualityAssessor();
const cacheManager = serviceFactory.getCacheManager();
const enhancedService = serviceFactory.getEnhancedExampleSentenceService();
const chainService = serviceFactory.getSentenceChainService();

// Get configuration
const config = serviceFactory.getConfig();
```

### EnhancedExampleSentenceService

Generates context-aware, quality-controlled example sentences.

**Key Methods:**

- `getExamplesWithCache(word, count)`: Get examples from cache or generate new ones
- `generateEnhancedExamples(word, options)`: Generate examples with custom options
- `getExamples(word, count)`: Legacy interface for backward compatibility
- `validateExamples(examples)`: Validate example format

**Example:**

```typescript
const service = getEnhancedExampleSentenceService();

const examples = await service.getExamplesWithCache('technology', 12);

examples.forEach(example => {
  console.log(`[${example.context}] ${example.sentence}`);
  console.log(`Translation: ${example.translation}`);
  console.log(`Diversity: ${example.diversityScore}, Naturalness: ${example.naturalnessScore}`);
});
```

### SentenceChainService

Generates sentences that use multiple words together.

**Key Methods:**

- `getSentenceChainsWithCache(words, count)`: Get chains from cache or generate new ones
- `generateSentenceChains(words, options)`: Generate chains with custom options

**Example:**

```typescript
const service = getSentenceChainService();

const chains = await service.getSentenceChainsWithCache(words, 5);

chains.forEach(chain => {
  console.log(`[${chain.context}] ${chain.sentence}`);
  console.log(`Used ${chain.usedWordIds.length} words, Quality: ${chain.qualityScore}`);
});
```

### AIService

Abstract interface for AI providers with concrete implementations for OpenAI and Claude.

**Implementations:**

- `OpenAIAdapter`: OpenAI GPT models
- `ClaudeAdapter`: Anthropic Claude models

**Key Methods:**

- `generateExamples(request)`: Generate example sentences
- `generateSentenceChains(words, context, count)`: Generate sentence chains
- `validateConnection()`: Check API connectivity

### ContextAnalyzer

Analyzes words to identify applicable application contexts.

**Key Methods:**

- `analyzeContexts(word)`: Identify contexts for a word

**Example:**

```typescript
const analyzer = serviceFactory.getContextAnalyzer();
const analysis = await analyzer.analyzeContexts('technology');

console.log('Primary context:', analysis.primaryContext);
console.log('All contexts:', analysis.contexts);
console.log('Confidence scores:', analysis.confidence);
```

### QualityAssessor

Evaluates diversity and naturalness of generated examples.

**Key Methods:**

- `assessExamples(examples)`: Assess quality of example collection
- `calculateDiversityScore(examples)`: Calculate diversity metrics
- `calculateNaturalnessScore(example)`: Calculate naturalness metrics

**Example:**

```typescript
const assessor = serviceFactory.getQualityAssessor();

const diversityMetrics = assessor.calculateDiversityScore(examples);
console.log('Diversity score:', diversityMetrics.overallScore);
console.log('Sentence length variance:', diversityMetrics.sentenceLengthVariance);
console.log('Structural diversity:', diversityMetrics.structuralDiversity);
console.log('Vocabulary richness:', diversityMetrics.vocabularyRichness);
```

### CacheManager

Manages persistent caching of generated examples.

**Key Methods:**

- `get(word)`: Get cached examples
- `set(word, data)`: Save examples to cache
- `isExpired(cached)`: Check if cache is expired
- `clear(word)`: Clear cache for a word
- `clearAll()`: Clear all cached examples
- `getStats()`: Get cache statistics

**Example:**

```typescript
const cache = serviceFactory.getCacheManager();

// Get cache statistics
const stats = await cache.getStats();
console.log('Total entries:', stats.totalEntries);
console.log('Total size:', stats.totalSize);
console.log('Oldest entry:', stats.oldestEntry);
console.log('Newest entry:', stats.newestEntry);

// Clear cache for a specific word
await cache.clear('hello');

// Clear all cache
await cache.clearAll();
```

## Application Contexts

The system supports five application contexts:

1. **daily-conversation** (日常对话): Everyday informal speech
2. **business-communication** (商务交流): Professional workplace settings
3. **academic-writing** (学术写作): Scholarly and research contexts
4. **technical-documentation** (技术文档): Specialized technical fields
5. **literary-expression** (文学表达): Creative and artistic writing

Examples are automatically categorized and can be filtered by context in the UI.

## Quality Metrics

### Diversity Score

Measures variety in example sentences based on:

- **Sentence Length Variance**: Variation in sentence lengths
- **Structural Diversity**: Unique sentence beginnings and patterns
- **Vocabulary Richness**: Ratio of unique words to total words

### Naturalness Score

Measures how natural and idiomatic examples are based on:

- **Grammar Correctness**: Proper capitalization, punctuation, structure
- **Idiomatic Expression**: Natural connectors, varied patterns
- **Context Appropriateness**: Proper word usage and sentence length

## Error Handling

The service factory and all services include comprehensive error handling:

```typescript
try {
  await initializeServiceFactory();
  const service = getEnhancedExampleSentenceService();
  const examples = await service.getExamplesWithCache('word', 10);
} catch (error) {
  if (error instanceof Error) {
    if (error.message.includes('not initialized')) {
      console.error('Service factory not initialized');
    } else if (error.message.includes('API')) {
      console.error('AI service error:', error);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}
```

## Testing

Unit tests are provided for all services:

```bash
# Run all enhanced service tests
npm test -- enhanced

# Run specific test file
npm test -- ServiceFactory.test.ts
npm test -- EnhancedExampleSentenceService.test.ts
npm test -- SentenceChainService.test.ts
```

## Examples

See `ServiceFactory.example.ts` for complete usage examples including:

1. Application initialization
2. Enhanced example service usage
3. Sentence chain service usage
4. Individual service access
5. Custom generation options
6. Error handling patterns
7. Complete initialization flow

## Requirements Validation

This implementation validates the following requirements:

- **Requirement 6.1**: Define AI service interface
- **Requirement 6.2**: Support passing parameters to AI service
- **Requirement 10.1**: Read all parameters from configuration
- **Requirement 10.2**: Support switching AI service implementations
- **Requirement 10.3**: Provide plugin interface for custom analyzers

## Migration Guide

### From Legacy ExampleSentenceService

The enhanced service maintains backward compatibility:

```typescript
// Old way (still works)
import { exampleSentenceService } from './services';
const examples = await exampleSentenceService.getExamples('word', 10);

// New way (recommended)
import { getEnhancedExampleSentenceService } from './services/enhanced';
const service = getEnhancedExampleSentenceService();
const examples = await service.getExamplesWithCache('word', 10);
```

### Accessing Enhanced Features

To access enhanced features like context grouping and quality scores:

```typescript
const service = getEnhancedExampleSentenceService();
const result = await service.generateEnhancedExamples('word', {
  count: 12,
  contexts: ['daily-conversation', 'business-communication'],
  minQualityScore: 0.7,
});

// Access enhanced properties
result.examples.forEach(example => {
  console.log('Context:', example.context);
  console.log('Diversity:', example.diversityScore);
  console.log('Naturalness:', example.naturalnessScore);
  console.log('Metadata:', example.metadata);
});
```

## Performance Considerations

- **Caching**: Examples are cached for 30 days by default to minimize API calls
- **Lazy Loading**: Services are created only when first accessed
- **Singleton Pattern**: All services are singletons to avoid duplicate instances
- **Retry Logic**: Automatic retry with exponential backoff for failed API calls
- **Quality Filtering**: Low-quality examples are filtered before caching

## Troubleshooting

### Service Factory Not Initialized

```
Error: ServiceFactory not initialized. Call initialize() first.
```

**Solution**: Call `initializeServiceFactory()` before accessing any services.

### Missing API Key

```
Error: AI API key is required
```

**Solution**: Set the appropriate environment variable (`VITE_OPENAI_API_KEY` or `VITE_CLAUDE_API_KEY`).

### Configuration Validation Failed

```
Error: Invalid configuration: [errors]
```

**Solution**: Check the configuration validation errors and fix the environment variables or configuration file.

### AI Service Connection Failed

```
Error: OpenAI API call failed: [error]
```

**Solution**: 
1. Verify API key is correct
2. Check network connectivity
3. Verify API URL is correct
4. Check API service status

## Contributing

When adding new services or modifying existing ones:

1. Update the `ServiceFactory` to include new dependencies
2. Add unit tests for new services
3. Update this README with new service documentation
4. Add examples to `ServiceFactory.example.ts`
5. Ensure backward compatibility is maintained

## License

See the main project LICENSE file.
