/**
 * Learning Plan Store
 * 
 * Zustand store for managing learning plan state.
 * Requirements: 1.1, 1.7, 2.1
 */

import { create } from 'zustand';
import type { LearningPlan } from '../types';
import { learningPlanService } from '../services';

interface LearningPlanState {
  currentPlan: LearningPlan | null;
  loading: boolean;
  error: string | null;

  // Actions
  createPlan: (daysCount: number, wordsPerDay: number) => Promise<void>;
  updatePlan: (id: string, updates: Partial<LearningPlan>) => Promise<void>;
  loadCurrentPlan: () => Promise<void>;
  clearError: () => void;
}

export const useLearningPlanStore = create<LearningPlanState>((set) => ({
  currentPlan: null,
  loading: false,
  error: null,

  createPlan: async (daysCount: number, wordsPerDay: number) => {
    set({ loading: true, error: null });
    try {
      const plan = await learningPlanService.createPlan(daysCount, wordsPerDay);
      set({ currentPlan: plan, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '创建学习计划失败',
        loading: false,
      });
      throw error;
    }
  },

  updatePlan: async (id: string, updates: Partial<LearningPlan>) => {
    set({ loading: true, error: null });
    try {
      const plan = await learningPlanService.updatePlan(id, updates);
      set({ currentPlan: plan, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '更新学习计划失败',
        loading: false,
      });
      throw error;
    }
  },

  loadCurrentPlan: async () => {
    set({ loading: true, error: null });
    try {
      const plan = await learningPlanService.getCurrentPlan();
      set({ currentPlan: plan, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载学习计划失败',
        loading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
