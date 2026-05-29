/**
 * Progress Store
 * 
 * Zustand store for managing learning progress.
 * Requirements: 8.1, 8.5
 */

import { create } from 'zustand';
import type { LearningProgress } from '../types';
import { progressService } from '../services';

interface ProgressState {
  progress: LearningProgress | null;
  loading: boolean;
  error: string | null;

  // Actions
  loadProgress: (planId: string) => Promise<void>;
  markComplete: (planId: string, date: Date) => Promise<void>;
  clearError: () => void;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  progress: null,
  loading: false,
  error: null,

  loadProgress: async (planId: string) => {
    set({ loading: true, error: null });
    try {
      const progress = await progressService.getProgress(planId);
      set({ progress, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '加载学习进度失败',
        loading: false,
      });
    }
  },

  markComplete: async (planId: string, date: Date) => {
    set({ loading: true, error: null });
    try {
      await progressService.markDayComplete(planId, date);
      // Reload progress after marking complete
      const progress = await progressService.getProgress(planId);
      set({ progress, loading: false });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : '标记完成失败',
        loading: false,
      });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
