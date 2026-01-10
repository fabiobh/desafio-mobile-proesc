import React, { useState, useCallback, useRef } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import BottomSheet from '@gorhom/bottom-sheet';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../services/api';
import { Document, UploadedDocument, DocumentCategory, RootStackParamList } from '../types';
import { DOCUMENT_CATEGORIES } from '../constants';
import { DocumentCard } from '../components/DocumentCard';
import { UploadBottomSheet } from '../components/UploadBottomSheet';

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const CATEGORIES: (DocumentCategory | 'all')[] = ['all', 'historico', 'boletim', 'declaracao', 'comunicado'];

export function HomeScreen({ navigation }: HomeScreenProps) {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'available' | 'uploaded'>('available');
    const [selectedCategory, setSelectedCategory] = useState<DocumentCategory | 'all'>('all');
    const [documents, setDocuments] = useState<Document[]>([]);
    const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const uploadSheetRef = useRef<BottomSheet>(null);

    // Fetch documents on screen focus
    useFocusEffect(
        useCallback(() => {
            fetchDocuments();
        }, [selectedCategory])
    );

    async function fetchDocuments() {
        setIsLoading(true);
        try {
            const [availableRes, uploadedRes] = await Promise.all([
                api.getDocuments(selectedCategory === 'all' ? undefined : selectedCategory),
                api.getUploadedDocuments(),
            ]);

            if (availableRes.success) {
                setDocuments(availableRes.documents);
            }
            if (uploadedRes.success) {
                setUploadedDocuments(uploadedRes.documents);
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
        } finally {
            setIsLoading(false);
        }
    }

    async function handleRefresh() {
        setIsRefreshing(true);
        await fetchDocuments();
        setIsRefreshing(false);
    }

    function handleDocumentPress(document: Document) {
        navigation.navigate('DocumentViewer', { document });
    }

    function handleUploadPress() {
        uploadSheetRef.current?.expand();
    }

    function handleUploadComplete() {
        uploadSheetRef.current?.close();
        fetchDocuments();
    }

    function getCategoryLabel(category: DocumentCategory | 'all') {
        if (category === 'all') return 'Todos';
        return DOCUMENT_CATEGORIES[category];
    }

    const currentDocuments = activeTab === 'available' ? documents : uploadedDocuments;

    return (
        <SafeAreaView className="flex-1 bg-gray-50" edges={['top']}>
            {/* Header */}
            <View className="bg-primary-600 px-5 pt-4 pb-6 rounded-b-3xl">
                <View className="flex-row justify-between items-center mb-4">
                    <View>
                        <Text className="text-white/80 text-sm">Bem-vindo(a)</Text>
                        <Text className="text-white text-xl font-bold">{user?.name}</Text>
                        <Text className="text-white/60 text-sm">{user?.turma}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={logout}
                        className="bg-white/20 px-4 py-2 rounded-full"
                    >
                        <Text className="text-white font-medium">Sair</Text>
                    </TouchableOpacity>
                </View>

                {/* Tab Switcher */}
                <View className="flex-row bg-white/20 rounded-xl p-1">
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

            {/* Category Filter (only for available docs) */}
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

            {/* Document List */}
            <View className="flex-1 px-4">
                {isLoading && !isRefreshing ? (
                    <View className="flex-1 items-center justify-center">
                        <ActivityIndicator size="large" color="#4f46e5" />
                        <Text className="text-gray-500 mt-3">Carregando documentos...</Text>
                    </View>
                ) : currentDocuments.length === 0 ? (
                    <View className="flex-1 items-center justify-center">
                        <Text className="text-5xl mb-4">
                            {activeTab === 'available' ? '📭' : '📤'}
                        </Text>
                        <Text className="text-gray-500 text-lg">
                            {activeTab === 'available'
                                ? 'Nenhum documento encontrado'
                                : 'Nenhum documento enviado'}
                        </Text>
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
                    <FlatList
                        data={currentDocuments as (Document | UploadedDocument)[]}
                        keyExtractor={(item) => item.id}
                        renderItem={({ item }) => (
                            <DocumentCard
                                document={item}
                                isUploaded={activeTab === 'uploaded'}
                                onPress={() => {
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

            {/* FAB for Upload */}
            <TouchableOpacity
                className="absolute bottom-6 right-6 w-14 h-14 bg-primary-600 rounded-full items-center justify-center shadow-lg"
                onPress={handleUploadPress}
                activeOpacity={0.8}
            >
                <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>

            {/* Upload Bottom Sheet */}
            <UploadBottomSheet
                ref={uploadSheetRef}
                onUploadComplete={handleUploadComplete}
            />
        </SafeAreaView>
    );
}
