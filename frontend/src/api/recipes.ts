import { apiRequest } from './client';
import { Recipe, RecommendationItem } from '../types';

export interface RecommendationResponse {
  mode: string;
  items: RecommendationItem[];
  total: number;
}

export interface RecommendationFilters {
  mode?: 'cook_now' | 'almost_there';
  max_time?: number;
  cuisine?: string;
  diet?: string;
  limit?: number;
}

export const getRecommendations = async (filters: RecommendationFilters = {}): Promise<RecommendationResponse> => {
  const params = new URLSearchParams();
  if (filters.mode) params.append('mode', filters.mode);
  if (filters.max_time) params.append('max_time', filters.max_time.toString());
  if (filters.cuisine) params.append('cuisine', filters.cuisine);
  if (filters.diet) params.append('diet', filters.diet);
  if (filters.limit) params.append('limit', filters.limit.toString());

  return apiRequest<RecommendationResponse>(`/api/v1/recipes/recommendations?${params.toString()}`);
};

export const getRecipeDetail = async (recipeId: string): Promise<Recipe> => {
  return apiRequest<Recipe>(`/api/v1/recipes/${recipeId}`);
};

export const searchRecipes = async (query: string): Promise<{ results: Recipe[]; total: number }> => {
  return apiRequest<{ results: Recipe[]; total: number }>(`/api/v1/recipes/search?q=${encodeURIComponent(query)}`);
};

export const getFavourites = async (): Promise<Recipe[]> => {
  return apiRequest<Recipe[]>('/api/v1/recipes/favourites');
};

export const addFavourite = async (recipeId: string): Promise<{ message: string }> => {
  return apiRequest<{ message: string }>(`/api/v1/recipes/${recipeId}/favourite`, {
    method: 'POST',
  });
};

export const removeFavourite = async (recipeId: string): Promise<void> => {
  return apiRequest<void>(`/api/v1/recipes/${recipeId}/favourite`, {
    method: 'DELETE',
  });
};
