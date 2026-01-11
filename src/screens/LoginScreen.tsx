/**
 * Tela de Login (LoginScreen)
 * Primeira tela exibida para usuários não autenticados
 * Permite entrada com matrícula e senha
 */

// Importações do React
import React, { useState } from 'react';

// Importa componentes do React Native
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
    Image,
} from 'react-native';

// Importa hook de autenticação
import { useAuth } from '../contexts/AuthContext';

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Componente LoginScreen
 * 
 * Funcionalidades:
 * - Validação de campos (matrícula e senha)
 * - Exibição de erros de validação inline
 * - Login via contexto de autenticação
 * - Exibição de credenciais de teste para desenvolvimento
 * 
 * @returns Tela de login completa
 */
export function LoginScreen() {
    // ========================================
    // HOOKS E ESTADOS
    // ========================================

    // Obtém funções e estado do contexto de autenticação
    const { login, isLoading } = useAuth();

    // Estados do formulário
    const [matricula, setMatricula] = useState('');          // Valor do campo matrícula
    const [senha, setSenha] = useState('');                   // Valor do campo senha
    const [showPassword, setShowPassword] = useState(false);  // Controla visibilidade da senha
    const [error, setError] = useState('');                   // Erro geral do login
    const [errors, setErrors] = useState<{ matricula?: string; senha?: string }>({}); // Erros por campo

    // ========================================
    // VALIDAÇÃO DE CAMPOS
    // ========================================

    /**
     * Valida os campos do formulário
     * Verifica se matrícula e senha estão preenchidos corretamente
     * 
     * @returns true se todos os campos são válidos
     */
    function validateFields() {
        const newErrors: { matricula?: string; senha?: string } = {};

        // Validação de matrícula
        if (!matricula.trim()) {
            newErrors.matricula = 'Matrícula é obrigatória';
        } else if (matricula.length < 6) {
            newErrors.matricula = 'Matrícula deve ter no mínimo 6 caracteres';
        }

        // Validação de senha
        if (!senha.trim()) {
            newErrors.senha = 'Senha é obrigatória';
        } else if (senha.length < 6) {
            newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
        }

        // Atualiza estado de erros
        setErrors(newErrors);

        // Retorna true se não há erros
        return Object.keys(newErrors).length === 0;
    }

    // ========================================
    // HANDLER DE LOGIN
    // ========================================

    /**
     * Processa o login do usuário
     * Valida campos e chama a API de autenticação
     */
    async function handleLogin() {
        // Limpa erro anterior
        setError('');

        // Valida campos antes de prosseguir
        if (!validateFields()) {
            return;
        }

        // Tenta fazer login
        const result = await login(matricula, senha);

        // Se falhou, exibe mensagem de erro
        if (!result.success) {
            setError(result.error || 'Erro ao fazer login');
        }
        // Se sucesso, a navegação é automática via AuthContext
    }

    // ========================================
    // RENDER
    // ========================================

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-primary-600"
        >
            <View className="flex-1 justify-center px-8">
                {/* ======================================== */}
                {/* CABEÇALHO COM LOGO */}
                {/* ======================================== */}
                <View className="items-center mb-12">
                    {/* Círculo com ícone do app */}
                    <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
                        <Text className="text-5xl">📚</Text>
                    </View>
                    {/* Nome do app */}
                    <Text className="text-3xl font-bold text-white">Proesc</Text>
                    {/* Subtítulo */}
                    <Text className="text-white/80 text-base mt-1">Portal do Aluno</Text>
                </View>

                {/* ======================================== */}
                {/* FORMULÁRIO DE LOGIN */}
                {/* ======================================== */}
                <View className="bg-white rounded-3xl p-6 shadow-xl">
                    <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Entrar
                    </Text>

                    {/* ------------------------------------ */}
                    {/* CAMPO: MATRÍCULA */}
                    {/* ------------------------------------ */}
                    <View className="mb-4">
                        <Text className="text-gray-600 mb-2 font-medium">Matrícula</Text>
                        <TextInput
                            className={`bg-gray-100 rounded-xl px-4 py-4 text-gray-800 text-base ${errors.matricula ? 'border-2 border-red-500' : ''
                                }`}
                            placeholder="Digite sua matrícula"
                            placeholderTextColor="#9ca3af"
                            value={matricula}
                            onChangeText={(text) => {
                                setMatricula(text);
                                // Limpa erro do campo ao digitar
                                setErrors(prev => ({ ...prev, matricula: undefined }));
                                setError('');
                            }}
                            keyboardType="numeric"      // Teclado numérico
                            autoCapitalize="none"       // Sem capitalização automática
                        />
                        {/* Mensagem de erro inline */}
                        {errors.matricula && (
                            <Text className="text-red-500 text-sm mt-1">{errors.matricula}</Text>
                        )}
                    </View>

                    {/* ------------------------------------ */}
                    {/* CAMPO: SENHA */}
                    {/* ------------------------------------ */}
                    <View className="mb-6">
                        <Text className="text-gray-600 mb-2 font-medium">Senha</Text>
                        <View className="relative">
                            <TextInput
                                className={`bg-gray-100 rounded-xl px-4 py-4 text-gray-800 text-base pr-12 ${errors.senha ? 'border-2 border-red-500' : ''
                                    }`}
                                placeholder="Digite sua senha"
                                placeholderTextColor="#9ca3af"
                                value={senha}
                                onChangeText={(text) => {
                                    setSenha(text);
                                    // Limpa erro do campo ao digitar
                                    setErrors(prev => ({ ...prev, senha: undefined }));
                                    setError('');
                                }}
                                secureTextEntry={!showPassword}  // Oculta texto se showPassword é false
                                autoCapitalize="none"
                            />
                            {/* Botão para mostrar/ocultar senha */}
                            <TouchableOpacity
                                className="absolute right-4 top-4"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text className="text-xl">{showPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                        {/* Mensagem de erro inline */}
                        {errors.senha && (
                            <Text className="text-red-500 text-sm mt-1">{errors.senha}</Text>
                        )}
                    </View>

                    {/* ------------------------------------ */}
                    {/* MENSAGEM DE ERRO GERAL */}
                    {/* ------------------------------------ */}
                    {error ? (
                        <View className="bg-red-100 rounded-xl p-3 mb-4">
                            <Text className="text-red-600 text-center">{error}</Text>
                        </View>
                    ) : null}

                    {/* ------------------------------------ */}
                    {/* BOTÃO DE LOGIN */}
                    {/* ------------------------------------ */}
                    <TouchableOpacity
                        className={`rounded-xl py-4 ${isLoading ? 'bg-primary-400' : 'bg-primary-600'
                            }`}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            // Estado: Carregando
                            <ActivityIndicator color="white" />
                        ) : (
                            // Estado: Normal
                            <Text className="text-white text-center font-bold text-lg">
                                Entrar
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* ------------------------------------ */}
                    {/* CREDENCIAIS DE TESTE */}
                    {/* ------------------------------------ */}
                    <View className="mt-6 pt-4 border-t border-gray-200">
                        <Text className="text-gray-400 text-center text-sm">
                            Credenciais de teste:
                        </Text>
                        <Text className="text-gray-500 text-center text-sm mt-1">
                            Matrícula: 123456 | Senha: aluno123
                        </Text>
                    </View>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
