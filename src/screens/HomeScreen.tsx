/**
 * Tela Principal (HomeScreen)
 * Exibe lista de documentos disponíveis e documentos enviados pelo aluno
 * Permite navegação para visualização e upload de documentos
 */

// Importações do React
import React, { useState, useCallback, useRef } from 'react';

// Importa componentes do React Native
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';

// Importa hook para ações ao focar na tela
import { useFocusEffect } from '@react-navigation/native';

// Importa tipo de navegação
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

// Importa referência do BottomSheet
import BottomSheet from '@gorhom/bottom-sheet';

// Importa container de área segura
import { SafeAreaView } from 'react-native-safe-area-context';

// Importa contexto de autenticação
import { useAuth } from '../contexts/AuthContext';

// Importa serviço de API
import { api } from '../services/api';

// Importa tipos
import { Document, UploadedDocument, DocumentCategory, RootStackParamList } from '../types';

// Importa constantes
import { DOCUMENT_CATEGORIES } from '../constants';

// Importa componentes
import { DocumentCard } from '../components/DocumentCard';
import { UploadBottomSheet } from '../components/UploadBottomSheet';

// Importa serviço offline
import { offlineService } from '../services/offlineService';

// ============================================
// TIPOS
// ============================================

/**
 * Props da tela HomeScreen
 * Recebe a navegação tipada do React Navigation
 */
type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

/**
 * Lista de categorias disponíveis para filtro
 * Inclui 'all' para mostrar todos os documentos
 */
const CATEGORIES: (DocumentCategory | 'all')[] = ['all', 'historico', 'boletim', 'declaracao', 'comunicado'];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Componente HomeScreen
 * 
 * Funcionalidades:
 * - Exibe header com informações do usuário
 * - Abas para alternar entre documentos disponíveis e enviados
 * - Filtro por categoria de documentos
 * - Lista de documentos com pull-to-refresh
 * - Botão flutuante para upload
 * - Bottom sheet para envio de documentos
 * 
 * @param navigation - Objeto de navegação do React Navigation
 */
export function HomeScreen({ navigation }: HomeScreenProps) {
    // ========================================
    // HOOKS E ESTADOS
    // ========================================

    // Obtém usuário e função de logout do contexto
    const { user, logout } = useAuth();

    // Aba ativa: documentos disponíveis ou enviados
    const [activeTab, setActiveTab] = useState<'available' | 'uploaded'>('available');

    // Categoria selecionada para filtro
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');

    // Listas de documentos
    const [documents, setDocuments] = useState<Document[]>([]);
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);

    // Estados de loading
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    // Referência para controlar o bottom sheet de upload
    const uploadSheetRef = useRef<BottomSheet>(null);

    // ========================================
    // EFEITOS
    // ========================================

    /**
     * Recarrega documentos toda vez que a tela recebe foco
     * ou quando a categoria selecionada muda
     */
    useFocusEffect(
        useCallback(() => {
            fetchDocuments();
        }, [selectedCategory])
    );

    // ========================================
    // FUNÇÕES DE DADOS
    // ========================================

    /**
     * Busca documentos da API
     * Carrega tanto documentos disponíveis quanto enviados
     * Também verifica status offline de cada documento
     */
    async function fetchDocuments() {
        setIsLoading(true);
        try {
            // Busca ambas as listas em paralelo
            const [availableRes, uploadedRes] = await Promise.all([
                api.getDocuments(selectedCategory === 'all' ? undefined : selectedCategory),
                api.getUploadedDocuments(),
            ]);

            if (availableRes.success) {
                // Verifica status offline para cada documento disponível
                const docsWithOfflineStatus = await Promise.all(
                    availableRes.documents.map(async (doc) => {
                        const isOffline = await offlineService.isDocumentOffline(doc.id);
                        return { ...doc, isOffline };
                    })
                );
                setDocuments(docsWithOfflineStatus);
            }

            if (uploadedRes.success) {
                setUploadedDocuments(uploadedRes.documents);
            }
        } catch (error) {
            console.error('Erro ao buscar documentos:', error);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Handler para pull-to-refresh
     * Recarrega os documentos quando o usuário puxa a lista para baixo
     */
    async function handleRefresh() {
        setIsRefreshing(true);
        await fetchDocuments();
        setIsRefreshing(false);
    }

    // ========================================
    // HANDLERS DE NAVEGAÇÃO
    // ========================================

    /**
     * Navega para a tela de visualização de documento
     * @param document - Documento a ser visualizado
     */
    function handleDocumentPress(document: Document) {
        navigation.navigate('DocumentViewer', { document });
    }

    /**
     * Abre o bottom sheet de upload
     */
    function handleUploadPress() {
        uploadSheetRef.current?.expand();
    }

    /**
     * Callback chamado após upload bem-sucedido
     * Fecha o bottom sheet e recarrega a lista
     */
    function handleUploadComplete() {
        uploadSheetRef.current?.close();
        fetchDocuments();
    }

    // ========================================
    // FUNÇÕES AUXILIARES
    // ========================================

    /**
     * Retorna o label traduzido de uma categoria
     * @param category - Código da categoria
     * @returns Label em português
     */
    function getCategoryLabel(category: DocumentCategory | 'all') {
        if (category === 'all') return 'Todos';
        return DOCUMENT_CATEGORIES[category];
    }

    // Seleciona a lista correta baseado na aba ativa
    const currentDocuments = activeTab === 'available' ? documents : uploadedDocuments;

    // ========================================
    // RENDER
    // ========================================

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* ======================================== */}
            {/* HEADER */}
            {/* ======================================== */}
            <View className="bg-primary-600 px-5 pt-4 pb-6 rounded-b-3xl">
                {/* Linha superior: Saudação + Botão Sair */}
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-white/80 text-sm">Bem-vindo(a)</Text>
                        <Text className="text-white text-xl font-bold">{user?.name}</Text>
                        <Text className="text-white/60 text-sm">{user?.turma}</Text>
                    </View>
                    {/* Botão de logout */}
                    <TouchableOpacity
                        onPress={logout}
                        className="bg-white/20 px-4 py-2 rounded-full"
                    >
                        <Text className="text-white font-medium">Sair</Text>
                    </TouchableOpacity>
                </View>

                {/* ------------------------------------ */}
                {/* ABAS: Documentos / Enviados */}
                {/* ------------------------------------ */}
                <View className="flex-row bg-white/20 rounded-xl p-1">
                    {/* Aba: Documentos Disponíveis */}
                    <TouchableOpacity
                        className={`flex-1 py-2.5 rounded-lg ${activeTab === 'available' ? 'bg-white' : ''
                            }`}
                        onPress={() => setActiveTab('available')}
                    >
                        <Text
                            className={`text-center font-medium ${activeTab === 'available' ? 'text-primary-600' : 'text-white'
                                }`}
                        >
                            📄 Documentos
                        </Text>
                    </TouchableOpacity>

                    {/* Aba: Documentos Enviados */}
                    <TouchableOpacity
                        className={`flex-1 py-2.5 rounded-lg ${activeTab === 'uploaded' ? 'bg-white' : ''
                            }`}
                        onPress={() => setActiveTab('uploaded')}
                    >
                        <Text
                            className={`text-center font-medium ${activeTab === 'uploaded' ? 'text-primary-600' : 'text-white'
                                }`}
                        >
                            📤 Enviados ({uploadedDocuments.length})
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* ======================================== */}
            {/* FILTRO DE CATEGORIAS */}
            {/* Exibido apenas na aba de documentos disponíveis */}
            {/* ======================================== */}
            {activeTab === 'available' && (
                <View className="px-4 py-3">
                    <FlatList
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        data={CATEGORIES}
                        keyExtractor={(item) => item}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                className={`px-4 py-2 rounded-full mr-2 ${selectedCategory === item
                                    ? 'bg-primary-600'
                                    : 'bg-white border border-gray-200'
                                    }`}
                                onPress={() => setSelectedCategory(item)}
                            >
                                <Text
                                    className={`font-medium ${selectedCategory === item ? 'text-white' : 'text-gray-600'
                                        }`}
                                >
                                    {getCategoryLabel(item)}
                                </Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            )}

            {/* ======================================== */}
            {/* LISTA DE DOCUMENTOS */}
            {/* ======================================== */}
            <View className="flex-1 px-4">
                {/* Estado: Carregando */}
                {isLoading && !isRefreshing ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#4f46e5" />
                        <Text className="text-gray-500 mt-3">Carregando documentos...</Text>
                    </View>
                ) : currentDocuments.length === 0 ? (
                    /* Estado: Lista vazia */
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-5xl mb-4">
                            {activeTab === 'available' ? '📭' : '📤'}
                        </Text>
                        <Text className="text-gray-500 text-lg">
                            {activeTab === 'available'
                                ? 'Nenhum documento encontrado'
                                : 'Nenhum documento enviado'}
                        </Text>
                        {/* Botão para enviar documento (apenas na aba de enviados) */}
                        {activeTab === 'uploaded' && (
                            <TouchableOpacity
                                className="mt-4 bg-primary-600 px-6 py-3 rounded-xl"
                                onPress={handleUploadPress}
                            >
                                <Text className="text-white font-medium">Enviar documento</Text>
                            </TouchableOpacity>
                        )}
                    </View>
                ) : (
                    /* Estado: Lista com documentos */
                    <FlatList
                        data={currentDocuments as (Document | UploadedDocument)[]}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <DocumentCard
                                document={item}
                                isUploaded={activeTab === 'uploaded'}
                                onPress={() => {
                                    // Só navega para visualização em documentos disponíveis
                                    if (activeTab === 'available') {
                                        handleDocumentPress(item as Document);
                                    }
                                }}
                            />
                        )}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingVertical: 8 }}
                        refreshControl={
                            <RefreshControl
                                refreshing={isRefreshing}
                                onRefresh={handleRefresh}
                                colors={['#4f46e5']}
                                tintColor="#4f46e5"
                            />
                        }
                    />
                )}
            </View>

            {/* ======================================== */}
            {/* BOTÃO FLUTUANTE (FAB) PARA UPLOAD */}
            {/* ======================================== */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
                onPress={handleUploadPress}
                activeOpacity={0.8}
            >
                <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>

            {/* ======================================== */}
            {/* BOTTOM SHEET DE UPLOAD */}
            {/* ======================================== */}
            <UploadBottomSheet
                ref={uploadSheetRef}
                onUploadComplete={handleUploadComplete}
            />
        </SafeAreaView>
    );
}
