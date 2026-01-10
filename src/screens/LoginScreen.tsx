import React, { useState } from 'react';
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
import { useAuth } from '../contexts/AuthContext';

export function LoginScreen() {
    const { login, isLoading } = useAuth();
    const [matricula, setMatricula] = useState('');
    const [senha, setSenha] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [errors, setErrors] = useState<{ matricula?: string; senha?: string }>({});

    function validateFields() {
        const newErrors: { matricula?: string; senha?: string } = {};

        if (!matricula.trim()) {
            newErrors.matricula = 'Matrícula é obrigatória';
        } else if (matricula.length < 6) {
            newErrors.matricula = 'Matrícula deve ter no mínimo 6 caracteres';
        }

        if (!senha.trim()) {
            newErrors.senha = 'Senha é obrigatória';
        } else if (senha.length < 6) {
            newErrors.senha = 'Senha deve ter no mínimo 6 caracteres';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }

    async function handleLogin() {
        setError('');

        if (!validateFields()) {
            return;
        }

        const result = await login(matricula, senha);

        if (!result.success) {
            setError(result.error || 'Erro ao fazer login');
        }
    }

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            className="flex-1 bg-primary-600"
        >
            <View className="flex-1 justify-center px-8">
                {/* Logo/Header */}
                <View className="items-center mb-12">
                    <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-4 shadow-lg">
                        <Text className="text-5xl">📚</Text>
                    </View>
                    <Text className="text-3xl font-bold text-white">Proesc</Text>
                    <Text className="text-white/80 text-base mt-1">Portal do Aluno</Text>
                </View>

                {/* Login Form */}
                <View className="bg-white rounded-3xl p-6 shadow-xl">
                    <Text className="text-2xl font-bold text-gray-800 mb-6 text-center">
                        Entrar
                    </Text>

                    {/* Matrícula Input */}
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
                                setErrors(prev => ({ ...prev, matricula: undefined }));
                                setError('');
                            }}
                            keyboardType="numeric"
                            autoCapitalize="none"
                        />
                        {errors.matricula && (
                            <Text className="text-red-500 text-sm mt-1">{errors.matricula}</Text>
                        )}
                    </View>

                    {/* Password Input */}
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
                                    setErrors(prev => ({ ...prev, senha: undefined }));
                                    setError('');
                                }}
                                secureTextEntry={!showPassword}
                                autoCapitalize="none"
                            />
                            <TouchableOpacity
                                className="absolute right-4 top-4"
                                onPress={() => setShowPassword(!showPassword)}
                            >
                                <Text className="text-xl">{showPassword ? '🙈' : '👁️'}</Text>
                            </TouchableOpacity>
                        </View>
                        {errors.senha && (
                            <Text className="text-red-500 text-sm mt-1">{errors.senha}</Text>
                        )}
                    </View>

                    {/* Error Message */}
                    {error ? (
                        <View className="bg-red-100 rounded-xl p-3 mb-4">
                            <Text className="text-red-600 text-center">{error}</Text>
                        </View>
                    ) : null}

                    {/* Login Button */}
                    <TouchableOpacity
                        className={`rounded-xl py-4 ${isLoading ? 'bg-primary-400' : 'bg-primary-600'
                            }`}
                        onPress={handleLogin}
                        disabled={isLoading}
                        activeOpacity={0.8}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="white" />
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">
                                Entrar
                            </Text>
                        )}
                    </TouchableOpacity>

                    {/* Test Credentials Hint */}
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
