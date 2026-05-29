import { describe, it, expect } from 'vitest';
import { QualityAssessorImpl } from './QualityAssessor';
import { ExampleSentence } from '../../types';

describe('QualityAssessorImpl', () => {
  const assessor = new QualityAssessorImpl();

  describe('calculateDiversityScore', () => {
    it('should return zero scores for empty array', () => {
      const result = assessor.calculateDiversityScore([]);

      expect(result.sentenceLengthVariance).toBe(0);
      expect(result.structuralDiversity).toBe(0);
      expect(result.vocabularyRichness).toBe(0);
      expect(result.overallScore).toBe(0);
    });

    it('should calculate sentence length variance correctly', () => {
      const examples: ExampleSentence[] = [
        {
          sentence: 'Short sentence here.',
          translation: '短句子。',
          highlightWord: 'sentence',
        },
        {
          sentence:
            'This is a much longer sentence with many more words in it.',
          translation: '这是一个更长的句子。',
          highlightWord: 'longer',
        },
        {
          sentence: 'Medium length sentence with some words.',
          translation: '中等长度的句子。',
          highlightWord: 'medium',
        },
      ];

      const result = assessor.calculateDiversityScore(examples);

      // Should have non-zero variance due to different lengths (3, 12, 6 words)
      expect(result.sentenceLengthVariance).toBeGreaterThan(0);
      expect(result.sentenceLengthVariance).toBeLessThanOrEqual(1);
    });

    it('should calculate structural diversity based on unique beginnings', () => {
      const examples: ExampleSentence[] = [
        {
          sentence: 'The cat sat on the mat.',
          translation: '猫坐在垫子上。',
          highlightWord: 'cat',
        },
        {
          sentence: 'The dog ran in the park.',
          translation: '狗在公园里跑。',
          highlightWord: 'dog',
        },
        {
          sentence: 'A bird flew over the house.',
          translation: '一只鸟飞过房子。',
          highlightWord: 'bird',
        },
      ];

      const result = assessor.calculateDiversityScore(examples);

      // Two sentences start with "The", one with "A"
      // Unique beginnings: "the cat sat", "the dog ran", "a bird flew"
      expect(result.structuralDiversity).toBe(1); // All 3 beginnings are unique
    });

    it('should detect low structural diversity with repeated beginnings', () => {
      const examples: ExampleSentence[] = [
        {
          sentence: 'I like to eat apples every day.',
          translation: '我喜欢每天吃苹果。',
          highlightWord: 'apples',
        },
        {
          sentence: 'I like to eat oranges every day.',
          translation: '我喜欢每天吃橙子。',
          highlightWord: 'oranges',
        },
        {
          sentence: 'I like to eat bananas every day.',
          translation: '我喜欢每天吃香蕉。',
          highlightWord: 'bananas',
        },
      ];

      const result = assessor.calculateDiversityScore(examples);

      // All sentences start with "I like to" - only 1 unique beginning
      expect(result.structuralDiversity).toBe(1 / 3);
    });

    it('should calculate vocabulary richness correctly', () => {
      const examples: ExampleSentence[] = [
        {
          sentence: 'The quick brown fox jumps over lazy dogs.',
          translation: '快速的棕色狐狸跳过懒狗。',
          highlightWord: 'quick',
        },
        {
          sentence: 'Fast rabbits leap across slow turtles.',
          translation: '快速的兔子跳过慢乌龟。',
          highlightWord: 'fast',
        },
      ];

      const result = assessor.calculateDiversityScore(examples);

      // All words are unique (except short words filtered out)
      expect(result.vocabularyRichness).toBeGreaterThan(0.8);
    });

    it('should detect low vocabulary richness with repeated words', () => {
      const examples: ExampleSentence[] = [
        {
          sentence: 'Good morning good people.',
          translation: '早上好，好人们。',
          highlightWord: 'good',
        },
        {
          sentence: 'Good evening good friends.',
          translation: '晚上好，好朋友们。',
          highlightWord: 'good',
        },
      ];

      const result = assessor.calculateDiversityScore(examples);

      // "good" appears 4 times, other words appear once
      expect(result.vocabularyRichness).toBeLessThan(1);
    });

    it('should compute weighted overall diversity score', () => {
      const examples: ExampleSentence[] = [
        {
          sentence: 'The innovative technology revolutionizes modern communication.',
          translation: '创新技术革新了现代通信。',
          highlightWord: 'technology',
        },
        {
          sentence: 'Scientists discovered remarkable patterns in data.',
          translation: '科学家在数据中发现了显著的模式。',
          highlightWord: 'discovered',
        },
        {
          sentence: 'Creative solutions emerge from collaborative efforts.',
          translation: '创造性的解决方案来自协作努力。',
          highlightWord: 'creative',
        },
      ];

      const result = assessor.calculateDiversityScore(examples);

      // Overall score should be weighted average: 0.3*variance + 0.4*structural + 0.3*vocabulary
      const expectedScore =
        result.sentenceLengthVariance * 0.3 +
        result.structuralDiversity * 0.4 +
        result.vocabularyRichness * 0.3;

      expect(result.overallScore).toBeCloseTo(expectedScore, 5);
      expect(result.overallScore).toBeGreaterThan(0);
      expect(result.overallScore).toBeLessThanOrEqual(1);
    });
  });

  describe('calculateNaturalnessScore', () => {
    it('should score well-formed sentences highly', async () => {
      const example: ExampleSentence = {
        sentence:
          'The innovative approach significantly improved our results.',
        translation: '创新的方法显著改善了我们的结果。',
        highlightWord: 'innovative',
      };

      const result = await assessor.calculateNaturalnessScore(example);

      expect(result.grammarCorrectness).toBeGreaterThan(0.8);
      expect(result.overallScore).toBeGreaterThan(0.6);
    });

    it('should penalize sentences without proper capitalization', async () => {
      const example: ExampleSentence = {
        sentence: 'the cat sat on the mat.',
        translation: '猫坐在垫子上。',
        highlightWord: 'cat',
      };

      const result = await assessor.calculateNaturalnessScore(example);

      expect(result.grammarCorrectness).toBeLessThan(1.0);
    });

    it('should penalize sentences without proper punctuation', async () => {
      const example: ExampleSentence = {
        sentence: 'The cat sat on the mat',
        translation: '猫坐在垫子上。',
        highlightWord: 'cat',
      };

      const result = await assessor.calculateNaturalnessScore(example);

      expect(result.grammarCorrectness).toBeLessThan(1.0);
    });

    it('should detect template-like patterns', async () => {
      const example: ExampleSentence = {
        sentence: 'I walk every day.',
        translation: '我每天走路。',
        highlightWord: 'walk',
      };

      const result = await assessor.calculateNaturalnessScore(example);

      expect(result.idiomaticExpression).toBe(0.3);
    });

    it('should reward natural connectors', async () => {
      const example: ExampleSentence = {
        sentence:
          'Although it was raining, we decided to go for a walk.',
        translation: '虽然下雨了，我们还是决定去散步。',
        highlightWord: 'raining',
      };

      const result = await assessor.calculateNaturalnessScore(example);

      expect(result.idiomaticExpression).toBeGreaterThan(0.8);
    });

    it('should check word boundaries in context appropriateness', async () => {
      const example: ExampleSentence = {
        sentence: 'The walking path was beautiful.',
        translation: '步行道很美。',
        highlightWord: 'walk',
      };

      const result = await assessor.calculateNaturalnessScore(example);

      // "walk" is part of "walking", not a standalone word
      expect(result.contextAppropriate).toBe(0.5);
    });

    it('should validate highlight word appears in sentence', async () => {
      const example: ExampleSentence = {
        sentence: 'The cat sat on the mat.',
        translation: '猫坐在垫子上。',
        highlightWord: 'dog',
      };

      const result = await assessor.calculateNaturalnessScore(example);

      expect(result.contextAppropriate).toBe(0);
    });

    it('should prefer sentences with appropriate length', async () => {
      const goodLength: ExampleSentence = {
        sentence:
          'The innovative technology significantly improved our communication efficiency.',
        translation: '创新技术显著提高了我们的沟通效率。',
        highlightWord: 'technology',
      };

      const tooShort: ExampleSentence = {
        sentence: 'Technology helps.',
        translation: '技术有帮助。',
        highlightWord: 'technology',
      };

      const goodResult = await assessor.calculateNaturalnessScore(goodLength);
      const shortResult = await assessor.calculateNaturalnessScore(tooShort);

      expect(goodResult.contextAppropriate).toBeGreaterThan(
        shortResult.contextAppropriate
      );
    });

    it('should compute weighted overall naturalness score', async () => {
      const example: ExampleSentence = {
        sentence:
          'However, the remarkable discovery changed everything.',
        translation: '然而，这个显著的发现改变了一切。',
        highlightWord: 'discovery',
      };

      const result = await assessor.calculateNaturalnessScore(example);

      // Overall score should be weighted average: 0.4*grammar + 0.3*idiomatic + 0.3*context
      const expectedScore =
        result.grammarCorrectness * 0.4 +
        result.idiomaticExpression * 0.3 +
        result.contextAppropriate * 0.3;

      expect(result.overallScore).toBeCloseTo(expectedScore, 5);
    });
  });

  describe('assessExamples', () => {
    it('should assess both diversity and naturalness for all examples', async () => {
      const examples: ExampleSentence[] = [
        {
          sentence: 'The innovative approach significantly improved results.',
          translation: '创新的方法显著改善了结果。',
          highlightWord: 'innovative',
        },
        {
          sentence: 'Scientists discovered remarkable patterns in data.',
          translation: '科学家在数据中发现了显著的模式。',
          highlightWord: 'discovered',
        },
      ];

      const assessed = await assessor.assessExamples(examples);

      expect(assessed).toHaveLength(2);
      assessed.forEach((ex) => {
        expect(ex).toHaveProperty('diversityScore');
        expect(ex).toHaveProperty('naturalnessScore');
        expect(ex.diversityScore).toBeGreaterThan(0);
        expect(ex.naturalnessScore).toBeGreaterThan(0);
      });
    });

    it('should assign same diversity score to all examples in set', async () => {
      const examples: ExampleSentence[] = [
        {
          sentence: 'First example sentence here.',
          translation: '第一个例句。',
          highlightWord: 'first',
        },
        {
          sentence: 'Second example sentence here.',
          translation: '第二个例句。',
          highlightWord: 'second',
        },
      ];

      const assessed = await assessor.assessExamples(examples);

      // All examples should have the same diversity score (it's a set-level metric)
      expect(assessed[0].diversityScore).toBe(assessed[1].diversityScore);
    });

    it('should assign different naturalness scores to different examples', async () => {
      const examples: ExampleSentence[] = [
        {
          sentence:
            'Although it was challenging, we persevered and succeeded.',
          translation: '虽然很有挑战性，我们坚持并成功了。',
          highlightWord: 'challenging',
        },
        {
          sentence: 'I walk every day.',
          translation: '我每天走路。',
          highlightWord: 'walk',
        },
      ];

      const assessed = await assessor.assessExamples(examples);

      // First sentence should score higher (natural connectors, good structure)
      // Second sentence is a template pattern
      expect(assessed[0].naturalnessScore).toBeGreaterThan(
        assessed[1].naturalnessScore
      );
    });
  });
});
