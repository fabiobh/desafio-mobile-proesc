/**
 * Componente UploadBottomSheet
 * Bottom sheet (painel deslizante inferior) para envio de documentos
 * Permite selecionar arquivo via câmera, galeria ou arquivos do dispositivo
 */

// Importações do React
import React, { forwardRef, useState, useCallback } from 'react';

// Importa componentes do React Native
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform,
} from 'react-native';

// Importa componentes do Bottom Sheet
import BottomSheet, { BottomSheetBackdrop, BottomSheetView } from '@gorhom/bottom-sheet';

// Importa seletor de imagens do Expo
import * as ImagePicker from 'expo-image-picker';

// Importa seletor de documentos do Expo
import * as DocumentPicker from 'expo-document-picker';

// Importa serviço de API
import { api } from '../services/api';

// Importa tipos
import { UploadCategory } from '../types';

// Importa constantes
import { UPLOAD_CATEGORIES, CATEGORY_ICONS } from '../constants';

// ============================================
// INTERFACES
// ============================================

/**
 * Props do componente UploadBottomSheet
 */
interface UploadBottomSheetProps {
    onUploadComplete: () => void; // Callback chamado após upload bem-sucedido
}

// ============================================
// CONSTANTES
// ============================================

/**
 * Lista ordenada de categorias de upload
 */
const UPLOAD_CATEGORY_LIST: UploadCategory[] = ['atestado', 'justificativa', 'requerimento', 'outros'];

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Componente UploadBottomSheet
 * 
 * Usa forwardRef para permitir controle externo (abrir/fechar)
 * 
 * Funcionalidades:
 * - Campo de título do documento
 * - Seleção de categoria
 * - Captura de foto pela câmera
 * - Seleção de imagem da galeria
 * - Seleção de arquivo do dispositivo
 * - Upload do documento selecionado
 */
export const UploadBottomSheet = forwardRef<BottomSheet, UploadBottomSheetProps>(
    ({ onUploadComplete }, ref) => {
        // ========================================
        // ESTADOS
        // ========================================

        // Título do documento
        const [title, setTitle] = useState('');

        // Categoria selecionada (padrão: atestado)
        const [selectedCategory, setSelectedCategory] = useState<UploadCategory>('atestado');

        // Arquivo selecionado para upload
        const [selectedFile, setSelectedFile] = useState<{
            uri: string;     // URI do arquivo
            name: string;    // Nome do arquivo
            size?: number;   // Tamanho em bytes
        } | null>(null);

        // Estado de upload em andamento
        const [isUploading, setIsUploading] = useState(false);

        // ========================================
        // CALLBACKS
        // ========================================

        /**
         * Renderiza o backdrop (fundo escurecido) do bottom sheet
         * Desaparece quando o sheet está fechado
         */
        const renderBackdrop = useCallback(
            (props: any) => (
                <BottomSheetBackdrop
                    {...props}
                    disappearsOnIndex={-1}  // Desaparece quando fechado
                    appearsOnIndex={0}       // Aparece quando aberto
                    opacity={0.5}            // 50% de opacidade
                />
            ),
            []
        );

        // ========================================
        // FUNÇÕES DE SELEÇÃO DE ARQUIVO
        // ========================================

        /**
         * Captura foto usando a câmera do dispositivo
         * Requer permissão de câmera
         */
        async function handleCameraCapture() {
            // Solicita permissão de câmera
            const permission = await ImagePicker.requestCameraPermissionsAsync();

            if (!permission.granted) {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à câmera para capturar fotos.');
                return;
            }

            // Abre câmera para captura
            const result = await ImagePicker.launchCameraAsync({
                mediaTypes: ['images'],   // Apenas imagens
                allowsEditing: true,      // Permite edição/corte
                quality: 0.8,             // Qualidade 80%
            });

            // Se não cancelou e tem resultado, salva o arquivo
            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setSelectedFile({
                    uri: asset.uri,
                    name: `foto_${Date.now()}.jpg`, // Gera nome único
                    size: asset.fileSize,
                });
            }
        }

        /**
         * Seleciona imagem da galeria do dispositivo
         * Requer permissão de biblioteca de mídia
         */
        async function handleGalleryPick() {
            // Solicita permissão de galeria
            const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (!permission.granted) {
                Alert.alert('Permissão necessária', 'Precisamos de acesso à galeria para selecionar fotos.');
                return;
            }

            // Abre galeria para seleção
            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ['images'],   // Apenas imagens
                allowsEditing: true,      // Permite edição/corte
                quality: 0.8,             // Qualidade 80%
            });

            // Se não cancelou e tem resultado, salva o arquivo
            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                setSelectedFile({
                    uri: asset.uri,
                    name: asset.fileName || `imagem_${Date.now()}.jpg`,
                    size: asset.fileSize,
                });
            }
        }

        /**
         * Seleciona arquivo do sistema de arquivos do dispositivo
         * Suporta PDF, imagens e documentos Word
         */
        async function handleFilePick() {
            try {
                // Abre seletor de documentos
                const result = await DocumentPicker.getDocumentAsync({
                    type: [
                        'application/pdf',                                           // PDF
                        'image/*',                                                   // Todas as imagens
                        'application/msword',                                        // DOC
                        'application/vnd.openxmlformats-officedocument.wordprocessingml.document' // DOCX
                    ],
                    copyToCacheDirectory: true, // Copia para cache para acesso posterior
                });

                // Se não cancelou e tem resultado, salva o arquivo
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

        // ========================================
        // FUNÇÃO DE UPLOAD
        // ========================================

        /**
         * Realiza o upload do documento para o servidor
         * Valida campos obrigatórios antes de enviar
         */
        async function handleUpload() {
            // Validação: título obrigatório
            if (!title.trim()) {
                Alert.alert('Título obrigatório', 'Por favor, informe um título para o documento.');
                return;
            }

            // Validação: arquivo obrigatório
            if (!selectedFile) {
                Alert.alert('Arquivo obrigatório', 'Por favor, selecione um arquivo para enviar.');
                return;
            }

            // Inicia upload
            setIsUploading(true);

            try {
                // Chama API de upload
                const result = await api.uploadDocument(
                    title,
                    selectedCategory,
                    selectedFile.uri,
                    selectedFile.name,
                    selectedFile.size ? `${(selectedFile.size / 1024).toFixed(0)} KB` : undefined
                );

                if (result.success) {
                    // Upload bem-sucedido
                    Alert.alert('Sucesso!', 'Documento enviado com sucesso!');
                    resetForm();
                    onUploadComplete(); // Notifica componente pai
                } else {
                    // Erro no upload
                    Alert.alert('Erro', 'Não foi possível enviar o documento.');
                }
            } catch (error) {
                // Exceção durante upload
                Alert.alert('Erro', 'Ocorreu um erro ao enviar o documento.');
            } finally {
                setIsUploading(false);
            }
        }

        // ========================================
        // FUNÇÕES AUXILIARES
        // ========================================

        /**
         * Reseta o formulário para o estado inicial
         */
        function resetForm() {
            setTitle('');
            setSelectedCategory('atestado');
            setSelectedFile(null);
        }

        /**
         * Formata tamanho de arquivo para exibição legível
         * Exemplo: 1536 bytes → "1.5 KB" | 1572864 bytes → "1.5 MB"
         */
        function formatFileSize(bytes?: number) {
            if (!bytes) return '';
            const kb = bytes / 1024;
            if (kb < 1024) return `${kb.toFixed(0)} KB`;
            return `${(kb / 1024).toFixed(1)} MB`;
        }

        // ========================================
        // RENDER
        // ========================================

        return (
            <BottomSheet
                ref={ref}
                index={-1}                          // Inicia fechado
                snapPoints={['75%']}                // Ocupa 75% da tela quando aberto
                enablePanDownToClose               // Permite fechar arrastando para baixo
                backdropComponent={renderBackdrop}  // Fundo escurecido
                handleIndicatorStyle={{ backgroundColor: '#d1d5db', width: 40 }}
                backgroundStyle={{ borderRadius: 24 }}
            >
                <BottomSheetView style={{ flex: 1, paddingHorizontal: 24 }}>
                    {/* ======================================== */}
                    {/* TÍTULO DO PAINEL */}
                    {/* ======================================== */}
                    <Text className="text-2xl font-bold text-gray-800 mb-6">
                        Enviar Documento
                    </Text>

                    {/* ======================================== */}
                    {/* CAMPO DE TÍTULO */}
                    {/* ======================================== */}
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

                    {/* ======================================== */}
                    {/* SELEÇÃO DE CATEGORIA */}
                    {/* ======================================== */}
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

                    {/* ======================================== */}
                    {/* SELEÇÃO DE ARQUIVO */}
                    {/* ======================================== */}
                    <View className="mb-6">
                        <Text className="text-gray-600 mb-2 font-medium">Selecionar arquivo</Text>

                        {selectedFile ? (
                            /* Arquivo selecionado - mostra preview */
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
                                {/* Botão para remover arquivo selecionado */}
                                <TouchableOpacity onPress={() => setSelectedFile(null)}>
                                    <Text className="text-gray-400 text-xl">✕</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            /* Nenhum arquivo - mostra opções de seleção */
                            <View className="flex-row justify-between">
                                {/* Opção: Câmera */}
                                <TouchableOpacity
                                    className="flex-1 bg-gray-100 rounded-xl p-4 items-center mr-2"
                                    onPress={handleCameraCapture}
                                >
                                    <Text className="text-3xl mb-1">📷</Text>
                                    <Text className="text-gray-600 text-sm">Câmera</Text>
                                </TouchableOpacity>

                                {/* Opção: Galeria */}
                                <TouchableOpacity
                                    className="flex-1 bg-gray-100 rounded-xl p-4 items-center mr-2"
                                    onPress={handleGalleryPick}
                                >
                                    <Text className="text-3xl mb-1">🖼️</Text>
                                    <Text className="text-gray-600 text-sm">Galeria</Text>
                                </TouchableOpacity>

                                {/* Opção: Arquivos */}
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

                    {/* ======================================== */}
                    {/* BOTÃO DE ENVIO */}
                    {/* ======================================== */}
                    <TouchableOpacity
                        className={`rounded-xl py-4 ${isUploading ? 'bg-primary-400' : 'bg-primary-600'
                            }`}
                        onPress={handleUpload}
                        disabled={isUploading}
                    >
                        {isUploading ? (
                            /* Estado: Enviando */
                            <View className="flex-row items-center justify-center">
                                <ActivityIndicator color="white" size="small" />
                                <Text className="text-white font-bold text-lg ml-2">
                                    Enviando...
                                </Text>
                            </View>
                        ) : (
                            /* Estado: Pronto para enviar */
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
