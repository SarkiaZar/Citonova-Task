import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';

export type UserRole = 'superadmin' | 'admin' | 'collaborator';

export interface User {
    email: string;
    role: UserRole;
    id: string;
}

interface AuthContextType {
    user: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    register: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => void;
    isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const token = await AsyncStorage.getItem('token');
            const userId = await AsyncStorage.getItem('userId');
            const userEmail = await AsyncStorage.getItem('userEmail');

            if (token && userId && userEmail) {
                // In a real app we might want to validate the token with an endpoint like /auth/me
                // For now we assume if token exists it's valid or will fail on first request
                setUser({
                    email: userEmail,
                    id: userId,
                    role: 'collaborator' // Default role as API doesn't seem to return role in login response
                });
            }
        } catch (error) {
            console.error('Failed to check auth', error);
        } finally {
            setIsInitialized(true);
        }
    };

    const getErrorMessage = (error: any): string => {
        if (typeof error === 'string') return error;
        if (typeof error === 'object' && error !== null) {
            // Si el objeto tiene una propiedad 'message' o 'error', úsala
            if (error.message) return String(error.message);
            if (error.error) return String(error.error);
            return JSON.stringify(error);
        }
        return String(error || 'Error desconocido');
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.auth.login(email, password);
            if (response.success && 'data' in response) {
                const { token, user } = response.data;
                const userId = user.id;

                await AsyncStorage.setItem('token', token);
                await AsyncStorage.setItem('userId', userId);
                await AsyncStorage.setItem('userEmail', email);

                setUser({
                    email,
                    id: userId,
                    role: 'collaborator'
                });
                return { success: true };
            }
            return { success: false, error: getErrorMessage('error' in response ? response.error : 'Error desconocido') };
        } catch (error) {
            console.error('Login error', error);
            return { success: false, error: 'Error de red' };
        } finally {
            setIsLoading(false);
        }
    };

    const register = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await api.auth.register(email, password);
            if (response.success && 'data' in response) {
                const { token, user } = response.data;
                const userId = user.id;

                await AsyncStorage.setItem('token', token);
                await AsyncStorage.setItem('userId', userId);
                await AsyncStorage.setItem('userEmail', email);

                setUser({
                    email,
                    id: userId,
                    role: 'collaborator'
                });
                return { success: true };
            }
            return { success: false, error: getErrorMessage('error' in response ? response.error : 'Error desconocido') };
        } catch (error) {
            console.error('Register error', error);
            return { success: false, error: 'Error de red' };
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('token');
            await AsyncStorage.removeItem('userId');
            await AsyncStorage.removeItem('userEmail');
            setUser(null);
        } catch (error) {
            console.error('Logout error', error);
        }
    };

    if (!isInitialized) {
        return null; // Or a loading spinner for initial app load
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated: !!user,
            login,
            register,
            logout,
            isLoading
        }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
