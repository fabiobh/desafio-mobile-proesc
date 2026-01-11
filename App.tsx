/**
 * Componente principal do aplicativo (App)
 * Define a estrutura raiz da aplicação com todos os providers necessários
 */

// Importações do React
import React from 'react';

// Importa o componente de barra de status do Expo
import { StatusBar } from 'expo-status-bar';

// Importa o componente que habilita gestos no aplicativo
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Importa o provider de área segura para lidar com notches e barras do sistema
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Importa o contexto de autenticação customizado
import { AuthProvider } from './src/contexts/AuthContext';

// Importa o componente de navegação principal
import { AppNavigator } from './src/navigation/AppNavigator';

/**
 * Componente App - Ponto de entrada visual do aplicativo
 * 
 * Estrutura hierárquica dos providers:
 * 1. GestureHandlerRootView - Necessário para gestos (swipe, etc.)
 * 2. SafeAreaProvider - Gerencia áreas seguras da tela
 * 3. AuthProvider - Gerencia estado de autenticação global
 * 4. StatusBar - Configura a aparência da barra de status
 * 5. AppNavigator - Gerencia toda a navegação do app
 * 
 * @returns Componente React com toda a estrutura do aplicativo
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
