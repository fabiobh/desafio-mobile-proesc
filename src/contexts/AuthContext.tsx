/**
 * Contexto de Autenticação (AuthContext)
 * Gerencia o estado global de autenticação do usuário
 * Provê login, logout e persistência de sessão
 */

// Importações do React
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Importa AsyncStorage para persistência local de dados
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa tipos do projeto
import { User, AuthState } from '../types';

// Importa serviço de API
import { api } from '../services/api';

// ============================================
// CONSTANTES
// ============================================

/**
 * Chave usada para armazenar dados de autenticação no AsyncStorage
 */
const AUTH_STORAGE_KEY = '@proesc:auth';

// ============================================
// INTERFACE DO CONTEXTO
// ============================================

/**
 * Interface que define os dados e funções disponíveis no contexto de autenticação
 * Estende AuthState e adiciona as funções de login e logout
 */
interface AuthContextData extends AuthState {
    login: (matricula: string, senha: string) => Promise<{ success: boolean; error?: string }>;
    logout: () => Promise<void>;
}

// ============================================
// CRIAÇÃO DO CONTEXTO
// ============================================

/**
 * Cria o contexto de autenticação com valor inicial vazio
 * O valor real é fornecido pelo AuthProvider
 */
const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// ============================================
// INTERFACE DO PROVIDER
// ============================================

/**
 * Props do componente AuthProvider
 */
interface AuthProviderProps {
    children: ReactNode; // Componentes filhos que terão acesso ao contexto
}

// ============================================
// COMPONENTE PROVIDER
// ============================================

/**
 * Componente Provider que envolve a aplicação e fornece o contexto de autenticação
 * 
 * Responsabilidades:
 * - Gerenciar estado de autenticação (user, isAuthenticated, isLoading)
 * - Carregar sessão salva ao iniciar o app
 * - Prover funções de login e logout
 * 
 * @param children - Componentes filhos da aplicação
 */
export function AuthProvider({ children }: AuthProviderProps) {
    // Estado de autenticação
    const [state, setState] = useState<AuthState>({
        user: null,           // Usuário logado
        isAuthenticated: false, // Flag de autenticação
        isLoading: true,       // Loading inicial (carregando sessão)
    });

    // ============================================
    // EFEITOS
    // ============================================

    /**
     * Ao montar o componente, carrega sessão salva (se existir)
     */
    useEffect(() => {
        loadStoredSession();
    }, []);

    // ============================================
    // FUNÇÕES INTERNAS
    // ============================================

    /**
     * Carrega sessão salva no AsyncStorage
     * Se encontrar dados válidos, restaura o usuário autenticado
     */
    async function loadStoredSession() {
        try {
            // Busca dados salvos
            const storedData = await AsyncStorage.getItem(AUTH_STORAGE_KEY);

            if (storedData) {
                // Parse dos dados JSON
                const { user, token } = JSON.parse(storedData);

                // Se usuário e token existem, restaura a sessão
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
            console.error('Erro ao carregar sessão salva:', error);
        }

        // Se não encontrou sessão válida, apenas remove o loading
        setState(prev => ({ ...prev, isLoading: false }));
    }

    /**
     * Realiza login do usuário
     * 
     * @param matricula - Número de matrícula do aluno
     * @param senha - Senha do aluno
     * @returns Objeto com sucesso/erro
     */
    async function login(matricula: string, senha: string) {
        try {
            // Ativa loading durante a requisição
            setState(prev => ({ ...prev, isLoading: true }));

            // Chama API de login
            const response = await api.login(matricula, senha);

            if (response.success && response.user) {
                // Login bem-sucedido: salva sessão no AsyncStorage
                await AsyncStorage.setItem(
                    AUTH_STORAGE_KEY,
                    JSON.stringify({
                        user: response.user,
                        token: response.token,
                    })
                );

                // Atualiza estado com usuário autenticado
                setState({
                    user: response.user,
                    isAuthenticated: true,
                    isLoading: false,
                });

                return { success: true };
            }

            // Login falhou: retorna erro
            setState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: response.error };
        } catch (error) {
            // Erro na requisição
            setState(prev => ({ ...prev, isLoading: false }));
            return { success: false, error: 'Erro ao fazer login. Tente novamente.' };
        }
    }

    /**
     * Realiza logout do usuário
     * Remove dados salvos e limpa o estado
     */
    async function logout() {
        try {
            // Remove dados do AsyncStorage
            await AsyncStorage.removeItem(AUTH_STORAGE_KEY);

            // Limpa estado de autenticação
            setState({
                user: null,
                isAuthenticated: false,
                isLoading: false,
            });
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
        }
    }

    // ============================================
    // RENDER
    // ============================================

    return (
        <AuthContext.Provider
            value={{
                ...state,    // Espalha o estado (user, isAuthenticated, isLoading)
                login,       // Função de login
                logout,      // Função de logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

// ============================================
// HOOK CUSTOMIZADO
// ============================================

/**
 * Hook para acessar o contexto de autenticação
 * Deve ser usado apenas dentro de componentes filhos do AuthProvider
 * 
 * @returns Dados e funções do contexto de autenticação
 * @throws Erro se usado fora do AuthProvider
 * 
 * @example
 * const { user, login, logout, isAuthenticated } = useAuth();
 */
export function useAuth() {
    const context = useContext(AuthContext);

    // Verifica se está dentro do Provider
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }

    return context;
}
