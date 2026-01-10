import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState } from '../types';
import { api } from '../services/api';

const AUTH_STORAGE_KEY = '@proesc:auth';

interface AuthContextData extends AuthState {
    login: (matricula: string, senha: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

interface AuthProviderProps {
    children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
    const [state, setState] = useState<AuthState>({
        user: null,
        isAuthenticated: false,
        isLoading: true,
    });

    // Load saved session on app start
    useEffect(() => {
        loadStoredSession();
    }, []);

    async function loadStoredSession() {
        try {
            const storedData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

            if (storedData) {
                const { user, token } = JSON.parse(storedData);

                if (user && token) {
                    setState({
                        user,
                        isAuthenticated: true,
                        isLoading: false,
                    });
                    return;
                }
            }
        } catch (error) {
            console.error('Error loading stored session:', error);
        }

        setState(prev => ({ ...prev, isLoading: false }));
    }

    async function login(matricula: string, senha: string) {
        try {
            setState(prev => ({ ...prev, isLoading: true }));

            const response = await api.login(matricula, senha);

            if (response.success && response.user) {
                // Save session to storage
                await AsyncStorage.setItem(
                    AUTH_STORAGE_KEY,
                    JSON.stringify({
                        user: response.user,
                        token: response.token,
                    })
                );

                setState({
                    user: response.user,
                    isAuthenticated: true,
                    isLoading: false,
                });

                return { success: true };
            }

            setState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: response.error };
        } catch (error) {
            setState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
        }
    }

    async function logout() {
        try {
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (error) {
            console.error('Error during logout:', error);
        }
    }

    return (
        <AuthContext.Provider
            value={{
                ...state,
                login,
                logout,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);

    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }

    return context;
}
