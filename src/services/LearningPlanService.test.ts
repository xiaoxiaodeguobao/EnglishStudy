/**
 * Unit Tests for LearningPlanService
 * 
 * Tests the learning plan service implementation.
 * Requirements: 1.1, 1.2, 1.3, 1.6, 1.7, 2.1
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LearningPlanServiceImpl } from './LearningPlanService';
import { storageService } from './StorageService';
import { ValidationError } from '../types/error';
import type { LearningPlan } from '../types';

// Mock the storage service
vi.mock('./StorageService', () => ({
  storageService: {
    savePlan: vi.fn(),
    loadPlan: vi.fn(),
    loadCurrentPlan: vi.fn(),
  },
}));

describe('LearningPlanService', () => {
  let service: LearningPlanServiceImpl;

  beforeEach(() => {
    service = new LearningPlanServiceImpl();
    vi.clearAllMocks();
  });

  describe('createPlan', () => {
    describe('valid inputs', () => {
      it('should create a plan with valid parameters', async () => {
        // Requirement 1.1, 1.2, 1.3
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const plan = await service.createPlan(30, 10);

        expect(plan).toBeDefined();
        expect(plan.id).toMatch(/^plan-/);
        expect(plan.daysCount).toBe(30);
        expect(plan.wordsPerDay).toBe(10);
        expect(plan.startDate).toBeInstanceOf(Date);
        expect(plan.createdAt).toBeInstanceOf(Date);
        expect(plan.updatedAt).toBeInstanceOf(Date);
      });

      it('should save the plan to storage', async () => {
        // Requirement 1.6
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const plan = await service.createPlan(30, 10);

        expect(storageService.savePlan).toHaveBeenCalledWith(plan);
        expect(storageService.savePlan).toHaveBeenCalledTimes(1);
      });

      it('should create a plan with minimum valid values', async () => {
        // Requirement 1.4, 1.5
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const plan = await service.createPlan(1, 1);

        expect(plan.daysCount).toBe(1);
        expect(plan.wordsPerDay).toBe(1);
      });

      it('should create a plan with maximum valid values', async () => {
        // Requirement 1.4, 1.5
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const plan = await service.createPlan(365, 100);

        expect(plan.daysCount).toBe(365);
        expect(plan.wordsPerDay).toBe(100);
      });

      it('should generate unique IDs for different plans', async () => {
        // Requirement 1.1
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const plan1 = await service.createPlan(30, 10);
        const plan2 = await service.createPlan(30, 10);

        expect(plan1.id).not.toBe(plan2.id);
      });
    });

    describe('invalid inputs - daysCount', () => {
      it('should reject daysCount of 0', async () => {
        // Requirement 1.4
        await expect(service.createPlan(0, 10)).rejects.toThrow(ValidationError);
        await expect(service.createPlan(0, 10)).rejects.toThrow('学习天数必须在1到365之间');
      });

      it('should reject negative daysCount', async () => {
        // Requirement 1.4
        await expect(service.createPlan(-5, 10)).rejects.toThrow(ValidationError);
      });

      it('should reject daysCount above 365', async () => {
        // Requirement 1.4
        await expect(service.createPlan(366, 10)).rejects.toThrow(ValidationError);
        await expect(service.createPlan(366, 10)).rejects.toThrow('学习天数必须在1到365之间');
      });

      it('should reject non-integer daysCount', async () => {
        // Requirement 1.4
        await expect(service.createPlan(30.5, 10)).rejects.toThrow(ValidationError);
        await expect(service.createPlan(30.5, 10)).rejects.toThrow('学习天数必须是整数');
      });

      it('should reject NaN daysCount', async () => {
        // Requirement 1.4
        await expect(service.createPlan(NaN, 10)).rejects.toThrow(ValidationError);
      });
    });

    describe('invalid inputs - wordsPerDay', () => {
      it('should reject wordsPerDay of 0', async () => {
        // Requirement 1.5
        await expect(service.createPlan(30, 0)).rejects.toThrow(ValidationError);
        await expect(service.createPlan(30, 0)).rejects.toThrow('每天学习单词数量必须在1到100之间');
      });

      it('should reject negative wordsPerDay', async () => {
        // Requirement 1.5
        await expect(service.createPlan(30, -10)).rejects.toThrow(ValidationError);
      });

      it('should reject wordsPerDay above 100', async () => {
        // Requirement 1.5
        await expect(service.createPlan(30, 101)).rejects.toThrow(ValidationError);
        await expect(service.createPlan(30, 101)).rejects.toThrow('每天学习单词数量必须在1到100之间');
      });

      it('should reject non-integer wordsPerDay', async () => {
        // Requirement 1.5
        await expect(service.createPlan(30, 10.5)).rejects.toThrow(ValidationError);
        await expect(service.createPlan(30, 10.5)).rejects.toThrow('每天学习单词数量必须是整数');
      });

      it('should reject NaN wordsPerDay', async () => {
        // Requirement 1.5
        await expect(service.createPlan(30, NaN)).rejects.toThrow(ValidationError);
      });
    });

    describe('storage errors', () => {
      it('should propagate storage errors', async () => {
        // Requirement 1.6
        const storageError = new Error('Storage failed');
        vi.mocked(storageService.savePlan).mockRejectedValue(storageError);

        await expect(service.createPlan(30, 10)).rejects.toThrow('Storage failed');
      });
    });
  });

  describe('updatePlan', () => {
    const existingPlan: LearningPlan = {
      id: 'plan-123',
      daysCount: 30,
      wordsPerDay: 10,
      startDate: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-01'),
    };

    describe('valid updates', () => {
      it('should update daysCount', async () => {
        // Requirement 2.1
        vi.mocked(storageService.loadPlan).mockResolvedValue(existingPlan);
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const updated = await service.updatePlan('plan-123', { daysCount: 60 });

        expect(updated.daysCount).toBe(60);
        expect(updated.wordsPerDay).toBe(10); // Unchanged
        expect(storageService.savePlan).toHaveBeenCalledWith(updated);
      });

      it('should update wordsPerDay', async () => {
        // Requirement 2.1
        vi.mocked(storageService.loadPlan).mockResolvedValue(existingPlan);
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const updated = await service.updatePlan('plan-123', { wordsPerDay: 20 });

        expect(updated.wordsPerDay).toBe(20);
        expect(updated.daysCount).toBe(30); // Unchanged
      });

      it('should update both daysCount and wordsPerDay', async () => {
        // Requirement 2.1
        vi.mocked(storageService.loadPlan).mockResolvedValue(existingPlan);
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const updated = await service.updatePlan('plan-123', {
          daysCount: 60,
          wordsPerDay: 20,
        });

        expect(updated.daysCount).toBe(60);
        expect(updated.wordsPerDay).toBe(20);
      });

      it('should preserve id, startDate, and createdAt', async () => {
        // Requirement 2.2
        vi.mocked(storageService.loadPlan).mockResolvedValue(existingPlan);
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const updated = await service.updatePlan('plan-123', { daysCount: 60 });

        expect(updated.id).toBe(existingPlan.id);
        expect(updated.startDate).toEqual(existingPlan.startDate);
        expect(updated.createdAt).toEqual(existingPlan.createdAt);
      });

      it('should update the updatedAt timestamp', async () => {
        // Requirement 2.1
        vi.mocked(storageService.loadPlan).mockResolvedValue(existingPlan);
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const beforeUpdate = new Date();
        const updated = await service.updatePlan('plan-123', { daysCount: 60 });
        const afterUpdate = new Date();

        expect(updated.updatedAt.getTime()).toBeGreaterThanOrEqual(beforeUpdate.getTime());
        expect(updated.updatedAt.getTime()).toBeLessThanOrEqual(afterUpdate.getTime());
        expect(updated.updatedAt).not.toEqual(existingPlan.updatedAt);
      });

      it('should not allow changing the plan ID', async () => {
        // Requirement 2.1
        vi.mocked(storageService.loadPlan).mockResolvedValue(existingPlan);
        vi.mocked(storageService.savePlan).mockResolvedValue(undefined);

        const updated = await service.updatePlan('plan-123', {
          id: 'plan-456', // Attempt to change ID
          daysCount: 60,
        } as any);

        expect(updated.id).toBe('plan-123'); // ID should remain unchanged
      });
    });

    describe('invalid updates', () => {
      it('should reject invalid daysCount', async () => {
        // Requirement 2.1
        vi.mocked(storageService.loadPlan).mockResolvedValue(existingPlan);

        await expect(service.updatePlan('plan-123', { daysCount: 0 })).rejects.toThrow(
          ValidationError
        );
        await expect(service.updatePlan('plan-123', { daysCount: 366 })).rejects.toThrow(
          ValidationError
        );
        await expect(service.updatePlan('plan-123', { daysCount: 30.5 })).rejects.toThrow(
          ValidationError
        );
      });

      it('should reject invalid wordsPerDay', async () => {
        // Requirement 2.1
        vi.mocked(storageService.loadPlan).mockResolvedValue(existingPlan);

        await expect(service.updatePlan('plan-123', { wordsPerDay: 0 })).rejects.toThrow(
          ValidationError
        );
        await expect(service.updatePlan('plan-123', { wordsPerDay: 101 })).rejects.toThrow(
          ValidationError
        );
        await expect(service.updatePlan('plan-123', { wordsPerDay: 10.5 })).rejects.toThrow(
          ValidationError
        );
      });

      it('should throw error if plan not found', async () => {
        // Requirement 2.1
        vi.mocked(storageService.loadPlan).mockResolvedValue(null);

        await expect(service.updatePlan('nonexistent', { daysCount: 60 })).rejects.toThrow(
          '学习计划未找到'
        );
      });
    });
  });

  describe('getCurrentPlan', () => {
    it('should return the current plan if it exists', async () => {
      // Requirement 1.7
      const currentPlan: LearningPlan = {
        id: 'plan-123',
        daysCount: 30,
        wordsPerDay: 10,
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      vi.mocked(storageService.loadCurrentPlan).mockResolvedValue(currentPlan);

      const result = await service.getCurrentPlan();

      expect(result).toEqual(currentPlan);
      expect(storageService.loadCurrentPlan).toHaveBeenCalledTimes(1);
    });

    it('should return null if no current plan exists', async () => {
      // Requirement 1.7
      vi.mocked(storageService.loadCurrentPlan).mockResolvedValue(null);

      const result = await service.getCurrentPlan();

      expect(result).toBeNull();
      expect(storageService.loadCurrentPlan).toHaveBeenCalledTimes(1);
    });

    it('should propagate storage errors', async () => {
      // Requirement 1.7
      const storageError = new Error('Storage failed');
      vi.mocked(storageService.loadCurrentPlan).mockRejectedValue(storageError);

      await expect(service.getCurrentPlan()).rejects.toThrow('Storage failed');
    });
  });

  describe('deletePlan', () => {
    it('should throw error for non-existent plan', async () => {
      vi.mocked(storageService.loadPlan).mockResolvedValue(null);

      await expect(service.deletePlan('nonexistent')).rejects.toThrow('学习计划未找到');
    });

    it('should throw not implemented error for existing plan', async () => {
      const existingPlan: LearningPlan = {
        id: 'plan-123',
        daysCount: 30,
        wordsPerDay: 10,
        startDate: new Date('2024-01-01'),
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };

      vi.mocked(storageService.loadPlan).mockResolvedValue(existingPlan);

      await expect(service.deletePlan('plan-123')).rejects.toThrow('删除功能尚未实现');
    });
  });
});
