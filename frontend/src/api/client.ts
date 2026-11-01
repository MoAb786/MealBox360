import { Platform } from 'react-native';

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

// For physical device testing, provide your machine's LAN IP via EXPO_PUBLIC_API_URL in .env
// Fallback defaults:
// - Android Emulator: 10.0.2.2:8001
// - Web / iOS Simulator: 127.0.0.1:8001
const getBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  if (Platform.OS === 'android') {
    // If not configured, common LAN IP placeholder or emulator IP
    return 'http://192.168.1.39:8001';
  }
  return 'http://127.0.0.1:8001';
};

export const API_BASE_URL = getBaseUrl();

let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = (): string | null => {
  return authToken;
};

interface FetchOptions extends RequestInit {
  requiresAuth?: boolean;
}

export async function apiRequest<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { requiresAuth = true, headers = {}, ...rest } = options;
  const url = `${API_BASE_URL}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth && authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  const response = await fetch(url, {
    ...rest,
    headers: requestHeaders,
  });

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errorJson = await response.json();
        if (errorJson.detail) {
          if (typeof errorJson.detail === 'string') {
            errorDetail = errorJson.detail;
          } else if (Array.isArray(errorJson.detail)) {
            errorDetail = errorJson.detail.map((d: any) => d.msg || JSON.stringify(d)).join('\n');
          } else {
            errorDetail = JSON.stringify(errorJson.detail);
          }
        }
      } catch {
        // ignore json parse error on non-json error responses
      }
      throw new Error(errorDetail);
    }

  if (response.status === 204) {
    return null as unknown as T;
  }

  return response.json();
}
