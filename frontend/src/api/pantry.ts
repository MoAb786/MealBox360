import { apiRequest } from './client';
import { PantryItem } from '../types';

export interface AddPantryItemPayload {
  display_name: string;
  quantity?: number | null;
  unit?: string | null;
  category?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
  source?: string;
}

export interface UpdatePantryItemPayload {
  display_name?: string;
  quantity?: number | null;
  unit?: string | null;
  category?: string | null;
  expiry_date?: string | null;
  notes?: string | null;
}

export const getPantryItems = async (category?: string): Promise<PantryItem[]> => {
  const query = category ? `?category=${encodeURIComponent(category)}` : '';
  return apiRequest<PantryItem[]>(`/api/v1/pantry${query}`);
};

export const addPantryItem = async (data: AddPantryItemPayload): Promise<PantryItem> => {
  return apiRequest<PantryItem>('/api/v1/pantry', {
    method: 'POST',
    body: JSON.stringify(data),
  });
};

export const updatePantryItem = async (itemId: string, data: UpdatePantryItemPayload): Promise<PantryItem> => {
  return apiRequest<PantryItem>(`/api/v1/pantry/${itemId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
};

export const deletePantryItem = async (itemId: string): Promise<void> => {
  return apiRequest<void>(`/api/v1/pantry/${itemId}`, {
    method: 'DELETE',
  });
};

export const getExpiringItems = async (withinDays: number = 7): Promise<PantryItem[]> => {
  return apiRequest<PantryItem[]>(`/api/v1/pantry/expiring?within_days=${withinDays}`);
};
