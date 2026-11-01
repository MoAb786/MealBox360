import { apiRequest } from './client';
import { User, UserPreferences } from '../types';

export interface RegisterPayload {
  email: string;
  password: string;
  display_name: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
}

export const registerUser = async (data: RegisterPayload): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/api/v1/auth/register', {
    method: 'POST',
    body: JSON.stringify(data),
    requiresAuth: false,
  });
};

export const loginUser = async (data: LoginPayload): Promise<AuthResponse> => {
  return apiRequest<AuthResponse>('/api/v1/auth/login', {
    method: 'POST',
    body: JSON.stringify(data),
    requiresAuth: false,
  });
};

export const getMe = async (): Promise<User> => {
  return apiRequest<User>('/api/v1/auth/me');
};

export const updateProfile = async (data: { display_name: string }): Promise<User> => {
  return apiRequest<User>('/api/v1/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};

export const getPreferences = async (): Promise<UserPreferences> => {
  return apiRequest<UserPreferences>('/api/v1/preferences');
};

export const updatePreferences = async (data: Partial<UserPreferences>): Promise<UserPreferences> => {
  return apiRequest<UserPreferences>('/api/v1/preferences', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
};
