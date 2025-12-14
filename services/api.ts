import AsyncStorage from '@react-native-async-storage/async-storage';

export const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://basic-hono-api.borisbelmarm.workers.dev';

export interface ApiError {
    success: boolean;
    error: string;
}

export interface AuthResponse {
    success: boolean;
    data: {
        token: string;
        user: {
            id: string;
            email: string;
        };
    };
}

export interface Task {
    id: string;
    userId: string;
    title: string;
    completed: boolean;
    location: {
        latitude: number;
        longitude: number;
    };
    photoUri?: string;
    createdAt: string;
    updatedAt: string;
}

export interface TaskResponse {
    success: boolean;
    data: Task;
}

export interface TaskListResponse {
    success: boolean;
    data: Task[];
    count: number;
}

const getHeaders = async () => {
    const token = await AsyncStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
    };
};

const fetchWithTimeout = async (url: string, options: RequestInit, timeout = 30000) => {
    console.log(`API Request: ${options.method} ${url}`);
    try {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(url, { ...options, signal: controller.signal });
        clearTimeout(id);
        console.log(`API Response: ${response.status} ${url}`);
        return response;
    } catch (error) {
        console.error(`API Error ${url}:`, error);
        throw error;
    }
};

export const api = {
    auth: {
        login: async (email: string, password: string): Promise<AuthResponse | ApiError> => {
            try {
                const response = await fetchWithTimeout(`${API_URL}/auth/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                return await response.json();
            } catch (error) {
                return { success: false, error: 'Network error or timeout' };
            }
        },
        register: async (email: string, password: string): Promise<AuthResponse | ApiError> => {
            try {
                const response = await fetchWithTimeout(`${API_URL}/auth/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password }),
                });
                return await response.json();
            } catch (error) {
                return { success: false, error: 'Network error or timeout' };
            }
        },
    },
    todos: {
        list: async (): Promise<TaskListResponse | ApiError> => {
            try {
                const headers = await getHeaders();
                const response = await fetchWithTimeout(`${API_URL}/todos`, {
                    method: 'GET',
                    headers,
                });
                return await response.json();
            } catch (error) {
                return { success: false, error: 'Network error or timeout' };
            }
        },
        create: async (title: string, location: { latitude: number; longitude: number }, photoUri?: string): Promise<TaskResponse | ApiError> => {
            try {
                const headers = await getHeaders();
                const body: any = {
                    title,
                    location,
                };
                if (photoUri) {
                    body.photoUri = photoUri;
                }

                const response = await fetchWithTimeout(`${API_URL}/todos`, {
                    method: 'POST',
                    headers,
                    body: JSON.stringify(body),
                });
                return await response.json();
            } catch (error) {
                return { success: false, error: 'Network error or timeout' };
            }
        },
        update: async (id: string, updates: Partial<Task>): Promise<TaskResponse | ApiError> => {
            try {
                const headers = await getHeaders();
                const response = await fetchWithTimeout(`${API_URL}/todos/${id}`, {
                    method: 'PATCH',
                    headers,
                    body: JSON.stringify(updates),
                });
                return await response.json();
            } catch (error) {
                return { success: false, error: 'Network error or timeout' };
            }
        },
        delete: async (id: string): Promise<{ success: boolean; message?: string; error?: string }> => {
            try {
                const headers = await getHeaders();
                const response = await fetchWithTimeout(`${API_URL}/todos/${id}`, {
                    method: 'DELETE',
                    headers,
                });
                return await response.json();
            } catch (error) {
                return { success: false, error: 'Network error or timeout' };
            }
        },
    },
};
