import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Document, UploadedDocument } from '../types';
import { DOCUMENT_TYPE_ICONS, STATUS_CONFIG, CATEGORY_ICONS } from '../constants';

interface DocumentCardProps {
    document: Document | UploadedDocument;
    isUploaded?: boolean;
    onPress: () => void;
}

export function DocumentCard({ document, isUploaded = false, onPress }: DocumentCardProps) {
    // Type guard to check if it's an uploaded document
    const isUploadedDoc = (doc: Document | UploadedDocument): doc is UploadedDocument => {
        return 'status' in doc;
    };

    const uploadedDoc = isUploadedDoc(document) ? document : null;
    const availableDoc = !isUploadedDoc(document) ? document : null;

    // Get icon based on document type
    const getIcon = () => {
        if (uploadedDoc) {
            return CATEGORY_ICONS[uploadedDoc.category] || '📄';
        }
        if (availableDoc) {
            return DOCUMENT_TYPE_ICONS[availableDoc.type] || '📄';
        }
        return '📄';
    };

    // Format date for display
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <TouchableOpacity
            className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-gray-100 active:bg-gray-50"
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View className="flex-row items-center">
                {/* Icon */}
                <View className="w-14 h-14 bg-primary-100 rounded-xl items-center justify-center mr-4">
                    <Text className="text-2xl">{getIcon()}</Text>
                </View>

                {/* Content */}
                <View className="flex-1">
                    <Text className="text-gray-800 font-semibold text-base" numberOfLines={2}>
                        {document.title}
                    </Text>

                    <View className="flex-row items-center mt-1">
                        {/* Date */}
                        <Text className="text-gray-500 text-sm">
                            {formatDate(uploadedDoc?.uploadDate || availableDoc?.date || '')}
                        </Text>

                        {/* Size (for available docs) */}
                        {availableDoc?.size && (
                            <>
                                <Text className="text-gray-400 mx-2">•</Text>
                                <Text className="text-gray-500 text-sm">{availableDoc.size}</Text>
                            </>
                        )}

                        {/* Type badge (for available docs) */}
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

                        {/* Offline indicator */}
                        {availableDoc?.isOffline && (
                            <View className="bg-green-100 px-2 py-0.5 rounded ml-2">
                                <Text className="text-green-700 text-xs font-medium">📥 Offline</Text>
                            </View>
                        )}
                    </View>
                </View>

                {/* Status Badge (for uploaded docs) */}
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

                {/* Arrow indicator */}
                {!uploadedDoc && (
                    <Text className="text-gray-400 text-xl ml-2">›</Text>
                )}
            </View>

            {/* Description (for available docs) */}
            {availableDoc?.description && (
                <Text className="text-gray-500 text-sm mt-2" numberOfLines={2}>
                    {availableDoc.description}
                </Text>
            )}
        </TouchableOpacity>
    );
}
