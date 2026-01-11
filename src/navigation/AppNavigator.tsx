/**
 * Componente de Navegação Principal (AppNavigator)
 * Gerencia todas as rotas e navegação do aplicativo
 * Usa React Navigation com stack navigator
 */

// Importações do React
import React from 'react';

// Importa container de navegação do React Navigation
import { NavigationContainer } from '@react-navigation/native';

// Importa stack navigator nativo para melhor performance
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Importa componentes do React Native
import { ActivityIndicator, View } from 'react-native';

// Importa hook de autenticação
import { useAuth } from '../contexts/AuthContext';

// Importa telas do aplicativo
import { LoginScreen } from '../screens/LoginScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { DocumentViewerScreen } from '../screens/DocumentViewerScreen';

// Importa tipos de navegação
import { RootStackParamList } from '../types';

// ============================================
// CONFIGURAÇÃO DO NAVIGATOR
// ============================================

/**
 * Cria o stack navigator com tipagem forte
 * Usa RootStackParamList para definir as rotas e parâmetros disponíveis
 */
const Stack = createNativeStackNavigator<RootStackParamList>();

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Componente AppNavigator
 * 
 * Gerencia a navegação baseada no estado de autenticação:
 * - Se autenticado: mostra telas Home e DocumentViewer
 * - Se não autenticado: mostra tela de Login
 * - Se carregando: mostra indicador de loading
 * 
 * @returns Estrutura de navegação completa do app
 */
export function AppNavigator() {
    // Obtém estado de autenticação do contexto
    const { isAuthenticated, isLoading } = useAuth();

    // ============================================
    // ESTADO DE LOADING
    // ============================================

    /**
     * Enquanto carrega a sessão salva, mostra loading
     * Evita flash de tela de login antes de verificar autenticação
     */
    if (isLoading) {
        return (
            <View className="flex-1 items-center justify-center bg-primary-600">
                <ActivityIndicator size="large" color="white" />
            </View>
        );
    }

    // ============================================
    // RENDER DA NAVEGAÇÃO
    // ============================================

    return (
        <NavigationContainer>
            <Stack.Navigator
                screenOptions={{
                    headerShown: false,              // Oculta header padrão
                    animation: 'slide_from_right',   // Animação de transição
                }}
            >
                {isAuthenticated ? (
                    // ========================================
                    // TELAS PARA USUÁRIO AUTENTICADO
                    // ========================================
                    <>
                        {/* Tela principal com lista de documentos */}
                        <Stack.Screen name="Home" component={HomeScreen} />

                        {/* Tela de visualização de documento */}
                        <Stack.Screen
                            name="DocumentViewer"
                            component={DocumentViewerScreen}
                            options={{
                                animation: 'slide_from_bottom', // Abre de baixo para cima
                            }}
                        />
                    </>
                ) : (
                    // ========================================
                    // TELAS PARA USUÁRIO NÃO AUTENTICADO
                    // ========================================
                    <Stack.Screen name="Login" component={LoginScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
