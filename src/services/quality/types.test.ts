import { describe, it, expect } from 'vitest';
import type {
  DiversityMetrics,
  NaturalnessMetrics,
  QualityAssessment,
  QualityAssessor,
} from './types';
import type { ExampleSentence } from '../../types';

describe('Quality Assessment Types', () => {
  describe('DiversityMetrics', () => {
    it('should have all required properties', () => {
      const metrics: DiversityMetrics = {
        sentenceLengthVariance: 0.8,
        structuralDiversity: 0.7,
        vocabularyRichness: 0.9,
        overallScore: 0.8,
      };

      expect(metrics.sentenceLengthVariance).toBe(0.8);
      expect(metrics.structuralDiversity).toBe(0.7);
      expect(metrics.vocabularyRichness).toBe(0.9);
      expect(metrics.overallScore).toBe(0.8);
    });

    it('should accept values in 0-1 range', () => {
      const metrics: DiversityMetrics = {
        sentenceLengthVariance: 0,
        structuralDiversity: 0.5,
        vocabularyRichness: 1,
        overallScore: 0.5,
      };

      expect(metrics.sentenceLengthVariance).toBeGreaterThanOrEqual(0);
      expect(metrics.structuralDiversity).toBeLessThanOrEqual(1);
    });
  });

  describe('NaturalnessMetrics', () => {
    it('should have all required properties', () => {
      const metrics: NaturalnessMetrics = {
        grammarCorrectness: 0.9,
        idiomaticExpression: 0.8,
        contextAppropriate: 0.85,
        overallScore: 0.85,
      };

      expect(metrics.grammarCorrectness).toBe(0.9);
      expect(metrics.idiomaticExpression).toBe(0.8);
      expect(metrics.contextAppropriate).toBe(0.85);
      expect(metrics.overallScore).toBe(0.85);
    });
  });

  describe('QualityAssessment', () => {
    it('should combine diversity and naturalness metrics', () => {
      const assessment: QualityAssessment = {
        diversityScore: 0.8,
        naturalnessScore: 0.85,
        diversityMetrics: {
          sentenceLengthVariance: 0.8,
          structuralDiversity: 0.7,
          vocabularyRichness: 0.9,
          overallScore: 0.8,
        },
        naturalnessMetrics: {
          grammarCorrectness: 0.9,
          idiomaticExpression: 0.8,
          contextAppropriate: 0.85,
          overallScore: 0.85,
        },
      };

      expect(assessment.diversityScore).toBe(0.8);
      expect(assessment.naturalnessScore).toBe(0.85);
      expect(assessment.diversityMetrics).toBeDefined();
      expect(assessment.naturalnessMetrics).toBeDefined();
    });
  });

  describe('QualityAssessor Interface', () => {
    it('should define assessExamples method signature', () => {
      const mockExamples: ExampleSentence[] = [
        {
          sentence: 'The quick brown fox jumps over the lazy dog.',
          translation: '敏捷的棕色狐狸跳过懒狗。',
          highlightWord: 'quick',
        },
      ];

      // Mock implementation to verify interface contract
      const assessor: QualityAssessor = {
        assessExamples: async <T extends ExampleSentence>(
          examples: T[]
        ): Promise<T[]> => {
          return examples;
        },
        calculateDiversityScore: (examples: ExampleSentence[]) => ({
          sentenceLengthVariance: 0.8,
          structuralDiversity: 0.7,
          vocabularyRichness: 0.9,
          overallScore: 0.8,
        }),
        calculateNaturalnessScore: async () => ({
          grammarCorrectness: 0.9,
          idiomaticExpression: 0.8,
          contextAppropriate: 0.85,
          overallScore: 0.85,
        }),
      };

      expect(assessor.assessExamples).toBeDefined();
      expect(assessor.calculateDiversityScore).toBeDefined();
      expect(assessor.calculateNaturalnessScore).toBeDefined();
    });

    it('should support generic example types in assessExamples', async () => {
      interface EnhancedExample extends ExampleSentence {
        context: string;
        score?: number;
      }

      const mockEnhancedExamples: EnhancedExample[] = [
        {
          sentence: 'The weather is beautiful today.',
          translation: '今天天气很好。',
          highlightWord: 'weather',
          context: 'daily-conversation',
          score: 0.9,
        },
      ];

      const assessor: QualityAssessor = {
        assessExamples: async <T extends ExampleSentence>(
          examples: T[]
        ): Promise<T[]> => {
          return examples;
        },
        calculateDiversityScore: () => ({
          sentenceLengthVariance: 0.8,
          structuralDiversity: 0.7,
          vocabularyRichness: 0.9,
          overallScore: 0.8,
        }),
        calculateNaturalnessScore: async () => ({
          grammarCorrectness: 0.9,
          idiomaticExpression: 0.8,
          contextAppropriate: 0.85,
          overallScore: 0.85,
        }),
      };

      const result = await assessor.assessExamples(mockEnhancedExamples);
      expect(result).toHaveLength(1);
      expect(result[0].context).toBe('daily-conversation');
      expect(result[0].score).toBe(0.9);
    });

    it('should calculate diversity for multiple examples', () => {
      const mockExamples: ExampleSentence[] = [
        {
          sentence: 'The quick brown fox jumps.',
          translation: '敏捷的棕色狐狸跳跃。',
          highlightWord: 'quick',
        },
        {
          sentence: 'A lazy dog sleeps under the tree.',
          translation: '一只懒狗在树下睡觉。',
          highlightWord: 'lazy',
        },
      ];

      const assessor: QualityAssessor = {
        assessExamples: async <T extends ExampleSentence>(
          examples: T[]
        ): Promise<T[]> => {
          return examples;
        },
        calculateDiversityScore: (examples: ExampleSentence[]) => {
          const uniqueBeginnings = new Set(
            examples.map((ex) => ex.sentence.split(' ')[0])
          ).size;
          const structuralDiversity = uniqueBeginnings / examples.length;

          return {
            sentenceLengthVariance: 0.8,
            structuralDiversity,
            vocabularyRichness: 0.9,
            overallScore: 0.8,
          };
        },
        calculateNaturalnessScore: async () => ({
          grammarCorrectness: 0.9,
          idiomaticExpression: 0.8,
          contextAppropriate: 0.85,
          overallScore: 0.85,
        }),
      };

      const metrics = assessor.calculateDiversityScore(mockExamples);
      expect(metrics.structuralDiversity).toBe(1); // Both sentences start differently
    });

    it('should calculate naturalness for single example', async () => {
      const mockExample: ExampleSentence = {
        sentence: 'The weather is beautiful today.',
        translation: '今天天气很好。',
        highlightWord: 'weather',
      };

      const assessor: QualityAssessor = {
        assessExamples: async <T extends ExampleSentence>(
          examples: T[]
        ): Promise<T[]> => {
          return examples;
        },
        calculateDiversityScore: () => ({
          sentenceLengthVariance: 0.8,
          structuralDiversity: 0.7,
          vocabularyRichness: 0.9,
          overallScore: 0.8,
        }),
        calculateNaturalnessScore: async (example: ExampleSentence) => {
          const hasCapitalization = /^[A-Z]/.test(example.sentence);
          const hasPunctuation = /[.!?]$/.test(example.sentence);
          const grammarCorrectness =
            hasCapitalization && hasPunctuation ? 1.0 : 0.7;

          return {
            grammarCorrectness,
            idiomaticExpression: 0.8,
            contextAppropriate: 0.85,
            overallScore: 0.85,
          };
        },
      };

      const metrics = await assessor.calculateNaturalnessScore(mockExample);
      expect(metrics.grammarCorrectness).toBe(1.0); // Proper capitalization and punctuation
      expect(metrics.overallScore).toBeGreaterThan(0);
    });
  });
});
