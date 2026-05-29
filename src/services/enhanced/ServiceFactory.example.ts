/**
 * ServiceFactory Usage Examples
 * 
 * Demonstrates how to use the ServiceFactory for dependency injection
 * and service initialization.
 */

import {
  serviceFactory,
  initializeServiceFactory,
  getEnhancedExampleSentenceService,
  getSentenceChainService,
} from './ServiceFactory';

/**
 * Example 1: Initialize the service factory at application startup
 * 
 * This should be called once when the application starts, typically
 * in main.tsx or App.tsx.
 */
export async function example1_InitializeAtStartup() {
  try {
    console.log('Initializing service factory...');
    await initializeServiceFactory();
    console.log('Service factory initialized successfully!');
  } catch (error) {
    console.error('Failed to initialize service factory:', error);
    throw error;
  }
}

/**
 * Example 2: Use the enhanced example sentence service
 * 
 * After initialization, you can access services using convenience functions.
 */
export async function example2_UseEnhancedExampleService() {
  // Get the service instance
  const service = getEnhancedExampleSentenceService();
  
  // Generate examples with cache
  const examples = await service.getExamplesWithCache('hello', 10);
  
  console.log(`Generated ${examples.length} examples for "hello"`);
  examples.forEach((example, index) => {
    console.log(`${index + 1}. [${example.context}] ${example.sentence}`);
    console.log(`   Translation: ${example.translation}`);
    console.log(`   Diversity: ${example.diversityScore?.toFixed(2)}, Naturalness: ${example.naturalnessScore?.toFixed(2)}`);
  });
  
  return examples;
}

/**
 * Example 3: Use the sentence chain service
 * 
 * Generate sentence chains that use multiple words together.
 */
export async function example3_UseSentenceChainService() {
  const service = getSentenceChainService();
  
  // Example words
  const words = [
    {
      id: '1',
      word: 'hello',
      phonetic: '/həˈloʊ/',
      definitions: [],
      examples: [],
      associations: [],
      generatedAt: new Date(),
    },
    {
      id: '2',
      word: 'world',
      phonetic: '/wɜːrld/',
      definitions: [],
      examples: [],
      associations: [],
      generatedAt: new Date(),
    },
    {
      id: '3',
      word: 'beautiful',
      phonetic: '/ˈbjuːtɪfl/',
      definitions: [],
      examples: [],
      associations: [],
      generatedAt: new Date(),
    },
  ];
  
  // Generate sentence chains
  const chains = await service.getSentenceChainsWithCache(words, 5);
  
  console.log(`Generated ${chains.length} sentence chains`);
  chains.forEach((chain, index) => {
    console.log(`${index + 1}. [${chain.context}] ${chain.sentence}`);
    console.log(`   Translation: ${chain.translation}`);
    console.log(`   Used words: ${chain.usedWordIds.length}, Quality: ${chain.qualityScore.toFixed(2)}`);
  });
  
  return chains;
}

/**
 * Example 4: Access individual services through the factory
 * 
 * For advanced use cases, you can access individual services directly.
 */
export async function example4_AccessIndividualServices() {
  // Get AI service
  const aiService = serviceFactory.getAIService();
  console.log('AI Service:', aiService.constructor.name);
  
  // Get context analyzer
  const contextAnalyzer = serviceFactory.getContextAnalyzer();
  const analysis = await contextAnalyzer.analyzeContexts('technology');
  console.log('Context analysis for "technology":', analysis);
  
  // Get quality assessor
  const qualityAssessor = serviceFactory.getQualityAssessor();
  const diversityScore = qualityAssessor.calculateDiversityScore([
    {
      sentence: 'Hello, how are you?',
      translation: '你好，你好吗？',
      highlightWord: 'hello',
    },
    {
      sentence: 'Hello there, nice to meet you!',
      translation: '你好，很高兴见到你！',
      highlightWord: 'hello',
    },
  ]);
  console.log('Diversity score:', diversityScore);
  
  // Get cache manager
  const cacheManager = serviceFactory.getCacheManager();
  const stats = await cacheManager.getStats();
  console.log('Cache statistics:', stats);
  
  // Get configuration
  const config = serviceFactory.getConfig();
  console.log('Current configuration:', {
    aiProvider: config.aiProvider,
    cacheEnabled: config.cache.enabled,
    enabledContexts: config.contexts.enabled,
  });
}

/**
 * Example 5: Generate examples with custom options
 * 
 * Use the enhanced service with custom generation options.
 */
export async function example5_CustomGenerationOptions() {
  const service = getEnhancedExampleSentenceService();
  
  // Generate examples with custom options
  const result = await service.generateEnhancedExamples('innovation', {
    count: 15,
    contexts: ['business-communication', 'technical-documentation'],
    minQualityScore: 0.8,
    maxRetries: 3,
  });
  
  console.log('Generation statistics:');
  console.log(`- Total generated: ${result.statistics.totalGenerated}`);
  console.log(`- Filtered: ${result.statistics.filtered}`);
  console.log(`- Average diversity: ${result.statistics.averageDiversityScore.toFixed(2)}`);
  console.log(`- Average naturalness: ${result.statistics.averageNaturalnessScore.toFixed(2)}`);
  console.log(`- Generation time: ${result.statistics.generationTime}ms`);
  
  console.log(`\nReturned ${result.examples.length} high-quality examples`);
  
  return result;
}

/**
 * Example 6: Error handling
 * 
 * Proper error handling when using the service factory.
 */
export async function example6_ErrorHandling() {
  try {
    // Attempt to use service before initialization (will throw error)
    const service = getEnhancedExampleSentenceService();
    await service.getExamplesWithCache('test', 5);
  } catch (error) {
    if (error instanceof Error && error.message.includes('not initialized')) {
      console.error('Service factory not initialized. Call initializeServiceFactory() first.');
      
      // Initialize and retry
      await initializeServiceFactory();
      const service = getEnhancedExampleSentenceService();
      const examples = await service.getExamplesWithCache('test', 5);
      console.log('Successfully generated examples after initialization');
      return examples;
    }
    
    throw error;
  }
}

/**
 * Example 7: Complete application initialization flow
 * 
 * Recommended pattern for initializing services in your application.
 */
export async function example7_ApplicationInitialization() {
  console.log('Starting application initialization...');
  
  try {
    // Step 1: Initialize service factory
    console.log('1. Initializing service factory...');
    await initializeServiceFactory();
    
    // Step 2: Verify configuration
    console.log('2. Verifying configuration...');
    const config = serviceFactory.getConfig();
    console.log(`   - AI Provider: ${config.aiProvider}`);
    console.log(`   - Cache enabled: ${config.cache.enabled}`);
    console.log(`   - Enabled contexts: ${config.contexts.enabled.length}`);
    
    // Step 3: Validate AI service connection (optional)
    console.log('3. Validating AI service connection...');
    const aiService = serviceFactory.getAIService();
    const isConnected = await aiService.validateConnection();
    console.log(`   - Connection status: ${isConnected ? 'OK' : 'Failed'}`);
    
    // Step 4: Load cache statistics (optional)
    console.log('4. Loading cache statistics...');
    const cacheManager = serviceFactory.getCacheManager();
    const stats = await cacheManager.getStats();
    console.log(`   - Cached entries: ${stats.totalEntries}`);
    console.log(`   - Cache size: ${(stats.totalSize / 1024).toFixed(2)} KB`);
    
    console.log('Application initialization complete!');
    return true;
  } catch (error) {
    console.error('Application initialization failed:', error);
    throw error;
  }
}

/**
 * Run all examples
 */
export async function runAllExamples() {
  console.log('=== ServiceFactory Examples ===\n');
  
  // Example 1: Initialize
  await example1_InitializeAtStartup();
  console.log('\n---\n');
  
  // Example 2: Enhanced example service
  await example2_UseEnhancedExampleService();
  console.log('\n---\n');
  
  // Example 3: Sentence chain service
  await example3_UseSentenceChainService();
  console.log('\n---\n');
  
  // Example 4: Individual services
  await example4_AccessIndividualServices();
  console.log('\n---\n');
  
  // Example 5: Custom options
  await example5_CustomGenerationOptions();
  console.log('\n---\n');
  
  // Example 7: Complete initialization
  await example7_ApplicationInitialization();
  
  console.log('\n=== All examples completed ===');
}
