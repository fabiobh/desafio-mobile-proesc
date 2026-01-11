import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system/legacy';
import { Document } from '../types';

const OFFLINE_DOCS_KEY = '@proesc_offline_documents';
const OFFLINE_DIR = `${FileSystem.documentDirectory}offline_docs/`;

export interface OfflineDocumentMeta {
    documentId: string;
    title: string;
    type: string;
    localPath: string;
    savedAt: string;
    size?: string;
}

class OfflineService {
    private initialized = false;

    // Ensure offline directory exists
    async init(): Promise<void> {
        if (this.initialized) return;

        const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
        }
        this.initialized = true;
    }

    // Get list of offline documents metadata
    async getOfflineDocumentsList(): Promise<OfflineDocumentMeta[]> {
        try {
            const data = await AsyncStorage.getItem(OFFLINE_DOCS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting offline documents list:', error);
            return [];
        }
    }

    // Save offline documents metadata
    private async saveOfflineDocumentsList(docs: OfflineDocumentMeta[]): Promise<void> {
        try {
            await AsyncStorage.setItem(OFFLINE_DOCS_KEY, JSON.stringify(docs));
        } catch (error) {
            console.error('Error saving offline documents list:', error);
        }
    }

    // Check if document is available offline
    async isDocumentOffline(documentId: string): Promise<boolean> {
        const docs = await this.getOfflineDocumentsList();
        return docs.some(doc => doc.documentId === documentId);
    }

    // Get offline document metadata
    async getOfflineDocumentMeta(documentId: string): Promise<OfflineDocumentMeta | null> {
        const docs = await this.getOfflineDocumentsList();
        return docs.find(doc => doc.documentId === documentId) || null;
    }

    // Save document content for offline access
    async saveDocumentOffline(
        document: Document,
        content: string,
        contentType: 'base64' | 'text' = 'base64'
    ): Promise<boolean> {
        try {
            await this.init();

            const fileName = `${document.id}_${Date.now()}.${document.type}`;
            const localPath = `${OFFLINE_DIR}${fileName}`;

            // Write content to file
            if (contentType === 'base64') {
                await FileSystem.writeAsStringAsync(localPath, content, {
                    encoding: 'base64',
                });
            } else {
                await FileSystem.writeAsStringAsync(localPath, content, {
                    encoding: 'utf8',
                });
            }

            // Update metadata list
            const docs = await this.getOfflineDocumentsList();

            // Remove existing entry if any
            const filteredDocs = docs.filter(d => d.documentId !== document.id);

            // Add new entry
            const meta: OfflineDocumentMeta = {
                documentId: document.id,
                title: document.title,
                type: document.type,
                localPath,
                savedAt: new Date().toISOString(),
                size: document.size,
            };

            await this.saveOfflineDocumentsList([...filteredDocs, meta]);

            return true;
        } catch (error) {
            console.error('Error saving document offline:', error);
            return false;
        }
    }

    // Get offline document content
    async getOfflineDocumentContent(
        documentId: string,
        encoding: 'base64' | 'utf8' = 'base64'
    ): Promise<string | null> {
        try {
            const meta = await this.getOfflineDocumentMeta(documentId);
            if (!meta) return null;

            const fileInfo = await FileSystem.getInfoAsync(meta.localPath);
            if (!fileInfo.exists) {
                // Clean up stale metadata
                await this.removeOfflineDocument(documentId);
                return null;
            }

            const content = await FileSystem.readAsStringAsync(meta.localPath, {
                encoding: encoding === 'base64' ? 'base64' : 'utf8',
            });

            return content;
        } catch (error) {
            console.error('Error reading offline document:', error);
            return null;
        }
    }

    // Remove document from offline storage
    async removeOfflineDocument(documentId: string): Promise<boolean> {
        try {
            const meta = await this.getOfflineDocumentMeta(documentId);

            if (meta) {
                // Delete file
                const fileInfo = await FileSystem.getInfoAsync(meta.localPath);
                if (fileInfo.exists) {
                    await FileSystem.deleteAsync(meta.localPath);
                }
            }

            // Update metadata list
            const docs = await this.getOfflineDocumentsList();
            const filteredDocs = docs.filter(d => d.documentId !== documentId);
            await this.saveOfflineDocumentsList(filteredDocs);

            return true;
        } catch (error) {
            console.error('Error removing offline document:', error);
            return false;
        }
    }

    // Clear all offline documents
    async clearAllOfflineDocuments(): Promise<boolean> {
        try {
            await this.init();

            // Delete all files in offline directory
            const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
            if (dirInfo.exists) {
                await FileSystem.deleteAsync(OFFLINE_DIR, { idempotent: true });
                await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
            }

            // Clear metadata
            await AsyncStorage.removeItem(OFFLINE_DOCS_KEY);

            return true;
        } catch (error) {
            console.error('Error clearing offline documents:', error);
            return false;
        }
    }
}

export const offlineService = new OfflineService();
