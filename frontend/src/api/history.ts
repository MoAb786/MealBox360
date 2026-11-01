import { apiRequest } from './client';
import { MealHistoryEntry } from '../types';

export interface MarkCookedPayload {
  recipe_id: string;
  servings?: number;
  rating?: number | null;
  notes?: string | null;
  cooked_at?: string | null;
}

export interface HistorySummary {
  total_meals_cooked: number;
  most_cooked_recipes: {
    recipe_id: string;
    title: string;
    times_cooked: number;
  }[];
}

export const getMealHistory = async (skip: number = 0, limit: number = 50): Promise<MealHistoryEntry[]> => {
  return apiRequest<MealHistoryEntry[]>(`/api/v1/meals/history?skip=${skip}&limit=${limit}`);
};

export const markRecipeCooked = async (data: MarkCookedPayload): Promise<MealHistoryEntry> => {
  return apiRequest<MealHistoryEntry>('/api/v1/meals/history', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updateMealHistory = async (
  entryId: string,
  data: { rating?: number | null; notes?: string | null; servings?: number }
): Promise<MealHistoryEntry> => {
  return apiRequest<MealHistoryEntry>(`/api/v1/meals/history/${entryId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deleteMealHistory = async (entryId: string): Promise<void> => {
  return apiRequest<void>(`/api/v1/meals/history/${entryId}`, {
    method: 'DELETE',
  });
};

export const getMealHistorySummary = async (): Promise<HistorySummary> => {
  return apiRequest<HistorySummary>('/api/v1/meals/history/summary');
};
