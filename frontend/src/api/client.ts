import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

declare const process: {
  env: {
    EXPO_PUBLIC_API_URL?: string;
    [key: string]: string | undefined;
  };
};

// Production Render HTTPS URL fallback
const DEFAULT_SERVER_URL =
  process.env.EXPO_PUBLIC_API_URL || 'https://mealbox360.onrender.com';

let customBaseUrl: string | null = null;
const SERVER_URL_STORAGE_KEY = 'mealbox360_api_base_url';

// Eagerly try to read stored URL if configured
try {
  SecureStore.getItemAsync(SERVER_URL_STORAGE_KEY).then((saved) => {
    if (saved && saved.trim()) {
      customBaseUrl = saved.trim().replace(/\/+$/, '');
    }
  }).catch(() => {});
} catch {
  // ignore
}

export const getBaseUrl = (): string => {
  if (customBaseUrl) {
    return customBaseUrl;
  }
  return DEFAULT_SERVER_URL;
};

export const setCustomBaseUrl = async (url: string | null) => {
  if (!url || !url.trim()) {
    customBaseUrl = null;
    try {
      await SecureStore.deleteItemAsync(SERVER_URL_STORAGE_KEY);
    } catch {}
  } else {
    const formatted = url.trim().replace(/\/+$/, '');
    customBaseUrl = formatted;
    try {
      await SecureStore.setItemAsync(SERVER_URL_STORAGE_KEY, formatted);
    } catch {}
  }
};

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
  const baseUrl = getBaseUrl();
  const url = `${baseUrl}${endpoint}`;

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  if (requiresAuth && authToken) {
    requestHeaders['Authorization'] = `Bearer ${authToken}`;
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...rest,
      headers: requestHeaders,
    });
  } catch (networkErr: any) {
    const errMsg = networkErr?.message || '';
    if (errMsg.includes('CLEARTEXT') || errMsg.includes('Network request failed') || errMsg.includes('Failed to fetch')) {
      throw new Error(
        `Unable to reach backend at ${baseUrl}.\nCheck that FastAPI is running (uvicorn main:app --host 0.0.0.0 --port 8001) and your device is on Wi-Fi.`
      );
    }
    throw networkErr;
  }

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
