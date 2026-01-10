import React, { forwardRef, useState, useCallback } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { api } from '../services/api';
import { UploadCategory } from '../types';
import { UPLOAD_CATEGORIES, CATEGORY_ICONS } from '../constants';

interface UploadBottomSheetProps {
    onUploadComplete: () => void;
}

const UPLOAD_CATEGORY_LIST: UploadCategory[] = ['atestado', 'justificativa', 'requerimento', 'outros'];

export const UploadBottomSheet = forwardRef<BottomSheet, UploadBottomSheetProps>(
    ({ onUploadComplete }, ref) => {
        const [title, setTitle] = useState('');
        const [selectedCategory, setSelectedCategory] = useState<UploadCategory>('atestado');
        const [selectedFile, setSelectedFile] = useState<{
            uri: string;
            name: string;
            size?: number;
        } | null>(null);
        const [isUploading, setIsUploading] = useState(false);

        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}
                    appearsOnIndex={0}
                    opacity={0.5}
                />
            ),
            []
        );

        async function handleCameraCapture() {
            const permission = await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para capturar fotos.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setSelectedFile({
                    uri: asset.uri,
                    name: `foto_${Date.now()}.jpg`,
                    size: asset.fileSize,
                });
            }
        }

        async function handleGalleryPick() {
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar fotos.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],
                allowsEditing: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setSelectedFile({
                    uri: asset.uri,
                    name: asset.fileName || `imagem_${Date.now()}.jpg`,
                    size: asset.fileSize,
                });
            }
        }

        async function handleFilePick() {
            try {
                const result = await DocumentPicker.getDocumentAsync({
                    type: ['application/pdf', 'image/*', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                    copyToCacheDirectory: true,
                });

                if (!result.canceled && result.assets[0]) {
                    const asset = result.assets[0];
                    setSelectedFile({
                        uri: asset.uri,
                        name: asset.name,
                        size: asset.size,
                    });
                }
            } catch (error) {
                Alert.alert('Erro', 'Não foi possível selecionar o arquivo.');
            }
        }

        async function handleUpload() {
            if (!title.trim()) {
                Alert.alert('Título obrigatório', 'Por favor, informe um título para o documento.');
                return;
            }

            if (!selectedFile) {
                Alert.alert('Arquivo obrigatório', 'Por favor, selecione um arquivo para enviar.');
                return;
            }

            setIsUploading(true);

            try {
                const result = await api.uploadDocument(
                    title,
                    selectedCategory,
                    selectedFile.uri,
                    selectedFile.name,
                    selectedFile.size ? `${(selectedFile.size / 1024).toFixed(0)} KB` : undefined
                );

                if (result.success) {
                    Alert.alert('Sucesso!', 'Documento enviado com sucesso!');
                    resetForm();
                    onUploadComplete();
                } else {
                    Alert.alert('Erro', 'Não foi possível enviar o documento.');
                }
            } catch (error) {
                Alert.alert('Erro', 'Ocorreu um erro ao enviar o documento.');
            } finally {
                setIsUploading(false);
            }
        }

        function resetForm() {
            setTitle('');
            setSelectedCategory('atestado');
            setSelectedFile(null);
        }

        function formatFileSize(bytes?: number) {
            if (!bytes) return '';
            const kb = bytes / 1024;
            if (kb < 1024) return `${kb.toFixed(0)} KB`;
            return `${(kb / 1024).toFixed(1)} MB`;
        }

        return (
            <BottomSheet
                ref={ref}
                index={-1}
                snapPoints={['75%']}
                enablePanDownToClose
                backdropComponent={renderBackdrop}
                handleIndicatorStyle={{ backgroundColor: '#d1d5db', width: 40 }}
                backgroundStyle={{ borderRadius: 24 }}
            >
                <BottomSheetView style={{ flex: 1, paddingHorizontal: 24 }}>
                    <Text className="text-2xl font-bold text-gray-800 mb-6">
                        Enviar Documento
                    </Text>

                    {/* Title Input */}
                    <View className="mb-4">
                        <Text className="text-gray-600 mb-2 font-medium">Título do documento</Text>
                        <TextInput
                            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800"
                            placeholder="Ex: Atestado médico - Janeiro"
                            placeholderTextColor="#9ca3af"
                            value={title}
                            onChangeText={setTitle}
                        />
                    </View>

                    {/* Category Selection */}
                    <View className="mb-4">
                        <Text className="text-gray-600 mb-2 font-medium">Categoria</Text>
                        <View className="flex-row flex-wrap">
                            {UPLOAD_CATEGORY_LIST.map((cat) => (
                                <TouchableOpacity
                                    key={cat}
                                    className={`mr-2 mb-2 px-4 py-2 rounded-full flex-row items-center ${selectedCategory === cat
                                        ? 'bg-primary-600'
                                        : 'bg-gray-100'
                                        }`}
                                    onPress={() => setSelectedCategory(cat)}
                                >
                                    <Text className="mr-1">{CATEGORY_ICONS[cat]}</Text>
                                    <Text
                                        className={`font-medium ${selectedCategory === cat ? 'text-white' : 'text-gray-600'
                                            }`}
                                    >
                                        {UPLOAD_CATEGORIES[cat]}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* File Selection */}
                    <View className="mb-6">
                        <Text className="text-gray-600 mb-2 font-medium">Selecionar arquivo</Text>

                        {selectedFile ? (
                            <View className="bg-green-50 border border-green-200 rounded-xl p-4 flex-row items-center">
                                <Text className="text-2xl mr-3">✅</Text>
                                <View className="flex-1">
                                    <Text className="text-gray-800 font-medium" numberOfLines={1}>
                                        {selectedFile.name}
                                    </Text>
                                    {selectedFile.size && (
                                        <Text className="text-gray-500 text-sm">
                                            {formatFileSize(selectedFile.size)}
                                        </Text>
                                    )}
                                </View>
                                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                    <Text className="text-gray-400 text-xl">✕</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <View className="flex-row justify-between">
                                <TouchableOpacity
                                    className="flex-1 bg-gray-100 rounded-xl p-4 items-center mr-2"
                                    onPress={handleCameraCapture}
                                >
                                    <Text className="text-3xl mb-1">📷</Text>
                                    <Text className="text-gray-600 text-sm">Câmera</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 bg-gray-100 rounded-xl p-4 items-center mr-2"
                                    onPress={handleGalleryPick}
                                >
                                    <Text className="text-3xl mb-1">🖼️</Text>
                                    <Text className="text-gray-600 text-sm">Galeria</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    className="flex-1 bg-gray-100 rounded-xl p-4 items-center"
                                    onPress={handleFilePick}
                                >
                                    <Text className="text-3xl mb-1">📁</Text>
                                    <Text className="text-gray-600 text-sm">Arquivos</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>

                    {/* Upload Button */}
                    <TouchableOpacity
                        className={`rounded-xl py-4 ${isUploading ? 'bg-primary-400' : 'bg-primary-600'
                            }`}
                        onPress={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            <View className="flex-row items-center justify-center">
                                <ActivityIndicator color="white" size="small" />
                                <Text className="text-white font-bold text-lg ml-2">
                                    Enviando...
                                </Text>
                            </View>
                        ) : (
                            <Text className="text-white text-center font-bold text-lg">
                                Enviar Documento
                            </Text>
                        )}
                    </TouchableOpacity>
                </BottomSheetView>
            </BottomSheet>
        );
    }
);
