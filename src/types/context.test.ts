/**
 * Context Type Definitions Tests
 * 
 * **Validates: Requirements 1.1, 1.4**
 */

import { describe, it, expect } from 'vitest';
import {
  ApplicationContext,
  ContextLabels,
  ContextColors,
  ContextAnalysisResult,
} from './context';

describe('Context Type Definitions', () => {
  describe('ContextLabels', () => {
    it('should have Chinese labels for all context types', () => {
      const contexts: ApplicationContext[] = [
        'daily-conversation',
        'business-communication',
        'academic-writing',
        'technical-documentation',
        'literary-expression',
      ];

      contexts.forEach((context) => {
        expect(ContextLabels[context]).toBeDefined();
        expect(typeof ContextLabels[context]).toBe('string');
        expect(ContextLabels[context].length).toBeGreaterThan(0);
      });
    });

    it('should have correct Chinese translations', () => {
      expect(ContextLabels['daily-conversation']).toBe('日常对话');
      expect(ContextLabels['business-communication']).toBe('商务交流');
      expect(ContextLabels['academic-writing']).toBe('学术写作');
      expect(ContextLabels['technical-documentation']).toBe('技术文档');
      expect(ContextLabels['literary-expression']).toBe('文学表达');
    });
  });

  describe('ContextColors', () => {
    it('should have color classes for all context types', () => {
      const contexts: ApplicationContext[] = [
        'daily-conversation',
        'business-communication',
        'academic-writing',
        'technical-documentation',
        'literary-expression',
      ];

      contexts.forEach((context) => {
        expect(ContextColors[context]).toBeDefined();
        expect(typeof ContextColors[context]).toBe('string');
        expect(ContextColors[context]).toMatch(/bg-\w+-\d+/);
        expect(ContextColors[context]).toMatch(/text-\w+-\d+/);
      });
    });

    it('should have distinct colors for each context', () => {
      const colors = Object.values(ContextColors);
      const uniqueColors = new Set(colors);
      expect(uniqueColors.size).toBe(colors.length);
    });

    it('should use Tailwind CSS color classes', () => {
      expect(ContextColors['daily-conversation']).toBe('bg-blue-100 text-blue-800');
      expect(ContextColors['business-communication']).toBe('bg-purple-100 text-purple-800');
      expect(ContextColors['academic-writing']).toBe('bg-green-100 text-green-800');
      expect(ContextColors['technical-documentation']).toBe('bg-orange-100 text-orange-800');
      expect(ContextColors['literary-expression']).toBe('bg-pink-100 text-pink-800');
    });
  });

  describe('ContextAnalysisResult', () => {
    it('should accept valid context analysis results', () => {
      const result: ContextAnalysisResult = {
        contexts: ['daily-conversation', 'business-communication'],
        confidence: {
          'daily-conversation': 0.9,
          'business-communication': 0.7,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      };

      expect(result.contexts).toHaveLength(2);
      expect(result.primaryContext).toBe('daily-conversation');
      expect(result.confidence['daily-conversation']).toBe(0.9);
    });

    it('should support single context results', () => {
      const result: ContextAnalysisResult = {
        contexts: ['technical-documentation'],
        confidence: {
          'daily-conversation': 0.2,
          'business-communication': 0.3,
          'academic-writing': 0.4,
          'technical-documentation': 0.9,
          'literary-expression': 0.1,
        },
        primaryContext: 'technical-documentation',
      };

      expect(result.contexts).toHaveLength(1);
      expect(result.primaryContext).toBe('technical-documentation');
    });

    it('should support multiple context results', () => {
      const result: ContextAnalysisResult = {
        contexts: [
          'daily-conversation',
          'business-communication',
          'academic-writing',
        ],
        confidence: {
          'daily-conversation': 0.8,
          'business-communication': 0.7,
          'academic-writing': 0.6,
          'technical-documentation': 0.3,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      };

      expect(result.contexts).toHaveLength(3);
      expect(result.contexts).toContain('daily-conversation');
      expect(result.contexts).toContain('business-communication');
      expect(result.contexts).toContain('academic-writing');
    });

    it('should have confidence scores for all context types', () => {
      const result: ContextAnalysisResult = {
        contexts: ['daily-conversation'],
        confidence: {
          'daily-conversation': 0.9,
          'business-communication': 0.5,
          'academic-writing': 0.3,
          'technical-documentation': 0.2,
          'literary-expression': 0.4,
        },
        primaryContext: 'daily-conversation',
      };

      const allContexts: ApplicationContext[] = [
        'daily-conversation',
        'business-communication',
        'academic-writing',
        'technical-documentation',
        'literary-expression',
      ];

      allContexts.forEach((context) => {
        expect(result.confidence[context]).toBeDefined();
        expect(typeof result.confidence[context]).toBe('number');
        expect(result.confidence[context]).toBeGreaterThanOrEqual(0);
        expect(result.confidence[context]).toBeLessThanOrEqual(1);
      });
    });
  });
});
