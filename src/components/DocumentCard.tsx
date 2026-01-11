/**
 * Componente DocumentCard
 * Card reutilizável para exibir informações de documentos
 * Usado tanto para documentos disponíveis quanto para documentos enviados
 */

// Importações do React
import React from 'react';

// Importa componentes do React Native
import { View, Text, TouchableOpacity } from 'react-native';

// Importa tipos do projeto
import { Document, UploadedDocument } from '../types';

// Importa constantes para ícones e configurações de status
import { DOCUMENT_TYPE_ICONS, STATUS_CONFIG, CATEGORY_ICONS } from '../constants';

// ============================================
// INTERFACE DE PROPS
// ============================================

/**
 * Props do componente DocumentCard
 */
interface DocumentCardProps {
    document: Document | UploadedDocument;  // Documento a exibir (pode ser disponível ou enviado)
    isUploaded?: boolean;                   // Se é um documento enviado pelo aluno
    onPress: () => void;                    // Callback ao pressionar o card
}

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Componente DocumentCard
 * Renderiza um card com informações do documento
 * 
 * Funcionalidades:
 * - Exibe ícone baseado no tipo/categoria do documento
 * - Mostra título, data e tamanho
 * - Para documentos disponíveis: mostra tipo e indicador offline
 * - Para documentos enviados: mostra badge de status
 * 
 * @param document - Documento a ser exibido
 * @param isUploaded - Flag indicando se é documento enviado
 * @param onPress - Função chamada ao pressionar
 */
export function DocumentCard({ document, isUploaded = false, onPress }: DocumentCardProps) {
    // ========================================
    // TYPE GUARDS
    // ========================================

    /**
     * Type guard para verificar se é um documento enviado
     * Documentos enviados possuem a propriedade 'status'
     */
    const isUploadedDoc = (doc: Document | UploadedDocument): doc is UploadedDocument => {
        return 'status' in doc;
    };

    // Separa referências tipadas para cada tipo de documento
    const uploadedDoc = isUploadedDoc(document) ? document : null;
    const availableDoc = !isUploadedDoc(document) ? document : null;

    // ========================================
    // FUNÇÕES AUXILIARES
    // ========================================

    /**
     * Obtém o ícone apropriado para o documento
     * - Documentos enviados: usa ícone da categoria
     * - Documentos disponíveis: usa ícone do tipo de arquivo
     */
    const getIcon = () => {
        if (uploadedDoc) {
            // Ícone baseado na categoria (atestado, justificativa, etc.)
            return CATEGORY_ICONS[uploadedDoc.category] || '📄';
        }
        if (availableDoc) {
            // Ícone baseado no tipo de arquivo (pdf, docx, etc.)
            return DOCUMENT_TYPE_ICONS[availableDoc.type] || '📄';
        }
        return '📄'; // Ícone padrão
    };

    /**
     * Formata data para exibição no padrão brasileiro
     * Exemplo: "15 fev. 2024"
     */
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    // ========================================
    // RENDER
    // ========================================

    return (
        <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50"
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                {/* ======================================== */}
                {/* ÍCONE DO DOCUMENTO */}
                {/* ======================================== */}
                <View className="w-14 h-14 bg-primary-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-2xl">{getIcon()}</Text>
                </View>

                {/* ======================================== */}
                {/* CONTEÚDO PRINCIPAL */}
                {/* ======================================== */}
                <View className="flex-1">
                    {/* Título do documento */}
                    <Text className="text-gray-800 font-semibold text-base" numberOfLines={2}>
                        {document.title}
                    </Text>

                    {/* Linha de informações secundárias */}
                    <View className="flex-row items-center mt-1">
                        {/* Data do documento */}
                        <Text className="text-gray-500 text-sm">
                            {formatDate(uploadedDoc?.uploadDate || availableDoc?.date || '')}
                        </Text>

                        {/* Tamanho do arquivo (apenas para documentos disponíveis) */}
                        {availableDoc?.size && (
                            <>
                                <Text className="text-gray-400 mx-2">•</Text>
                                <Text className="text-gray-500 text-sm">{availableDoc.size}</Text>
                            </>
                        )}

                        {/* Badge de tipo de arquivo (apenas para documentos disponíveis) */}
                        {availableDoc && (
                            <>
                                <Text className="text-gray-400 mx-2">•</Text>
                                <View className="bg-primary-100 px-2 py-0.5 rounded">
                                    <Text className="text-primary-700 text-xs font-medium uppercase">
                                        {availableDoc.type}
                                    </Text>
                                </View>
                            </>
                        )}

                        {/* Indicador de documento salvo offline */}
                        {availableDoc?.isOffline && (
                            <View className="bg-green-100 px-2 py-0.5 rounded ml-2">
                                <Text className="text-green-700 text-xs font-medium">📥 Offline</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* ======================================== */}
                {/* BADGE DE STATUS (documentos enviados) */}
                {/* ======================================== */}
                {uploadedDoc && (
                    <View
                        className="px-3 py-1.5 rounded-full ml-2"
                        style={{ backgroundColor: STATUS_CONFIG[uploadedDoc.status].bgColor }}
                    >
                        <Text
                            className="text-xs font-medium"
                            style={{ color: STATUS_CONFIG[uploadedDoc.status].color }}
                        >
                            {STATUS_CONFIG[uploadedDoc.status].label}
                        </Text>
                    </View>
                )}

                {/* ======================================== */}
                {/* SETA DE NAVEGAÇÃO (documentos disponíveis) */}
                {/* ======================================== */}
                {!uploadedDoc && (
                    <Text className="text-gray-400 text-xl ml-2">›</Text>
                )}
            </View>

            {/* ======================================== */}
            {/* DESCRIÇÃO (documentos disponíveis) */}
            {/* ======================================== */}
            {availableDoc?.description && (
                <Text className="text-gray-500 text-sm mt-2" numberOfLines={2}>
                    {availableDoc.description}
                </Text>
            )}
        </TouchableOpacity>
    );
}
