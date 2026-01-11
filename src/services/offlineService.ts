/**
 * Serviço de Armazenamento Offline
 * Gerencia o salvamento e recuperação de documentos para acesso offline
 * Usa o sistema de arquivos local e AsyncStorage para metadados
 */

// Importa AsyncStorage para armazenar metadados
import AsyncStorage from '@react-native-async-storage/async-storage';

// Importa FileSystem para manipulação de arquivos
import * as FileSystem from 'expo-file-system/legacy';

// Importa tipo Document
import { Document } from '../types';

// ============================================
// CONSTANTES
// ============================================

/**
 * Chave usada para armazenar lista de documentos offline no AsyncStorage
 */
const OFFLINE_DOCS_KEY = '@proesc_offline_documents';

/**
 * Diretório onde os documentos offline são salvos
 */
const OFFLINE_DIR = `${FileSystem.documentDirectory}offline_docs/`;

// ============================================
// INTERFACES
// ============================================

/**
 * Interface para metadados de documento salvo offline
 */
export interface OfflineDocumentMeta {
    documentId: string;   // ID do documento original
    title: string;        // Título do documento
    type: string;         // Tipo do arquivo (pdf, docx, etc.)
    localPath: string;    // Caminho local do arquivo
    savedAt: string;      // Data/hora em que foi salvo
    size?: string;        // Tamanho do arquivo
}

// ============================================
// CLASSE DE SERVIÇO
// ============================================

/**
 * Classe que gerencia o armazenamento offline de documentos
 */
class OfflineService {
    /**
     * Flag que indica se o serviço foi inicializado
     * Evita criar o diretório múltiplas vezes
     */
    private initialized = false;

    // ========================================
    // INICIALIZAÇÃO
    // ========================================

    /**
     * Inicializa o serviço criando o diretório offline se não existir
     */
    async init(): Promise<void> {
        // Evita inicialização duplicada
        if (this.initialized) return;

        // Verifica se o diretório existe
        const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);

        // Cria o diretório se não existir
        if (!dirInfo.exists) {
            await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
        }

        this.initialized = true;
    }

    // ========================================
    // LEITURA DE METADADOS
    // ========================================

    /**
     * Obtém a lista de metadados de todos os documentos offline
     * 
     * @returns Array com metadados dos documentos salvos
     */
    async getOfflineDocumentsList(): Promise<OfflineDocumentMeta[]> {
        try {
            const data = await AsyncStorage.getItem(OFFLINE_DOCS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao obter lista de documentos offline:', error);
            return [];
        }
    }

    /**
     * Salva a lista de metadados no AsyncStorage
     * Função privada usada internamente
     * 
     * @param docs - Lista de metadados para salvar
     */
    private async saveOfflineDocumentsList(docs: OfflineDocumentMeta[]): Promise<void> {
        try {
            await AsyncStorage.setItem(OFFLINE_DOCS_KEY, JSON.stringify(docs));
        } catch (error) {
            console.error('Erro ao salvar lista de documentos offline:', error);
        }
    }

    // ========================================
    // VERIFICAÇÕES
    // ========================================

    /**
     * Verifica se um documento está disponível offline
     * 
     * @param documentId - ID do documento a verificar
     * @returns true se o documento está salvo offline
     */
    async isDocumentOffline(documentId: string): Promise<boolean> {
        const docs = await this.getOfflineDocumentsList();
        return docs.some(doc => doc.documentId === documentId);
    }

    /**
     * Obtém os metadados de um documento offline específico
     * 
     * @param documentId - ID do documento
     * @returns Metadados do documento ou null se não encontrado
     */
    async getOfflineDocumentMeta(documentId: string): Promise<OfflineDocumentMeta | null> {
        const docs = await this.getOfflineDocumentsList();
        return docs.find(doc => doc.documentId === documentId) || null;
    }

    // ========================================
    // SALVAMENTO
    // ========================================

    /**
     * Salva um documento para acesso offline
     * 
     * @param document - Documento a ser salvo
     * @param content - Conteúdo do documento (string)
     * @param contentType - Tipo do conteúdo ('base64' ou 'text')
     * @returns true se salvou com sucesso
     */
    async saveDocumentOffline(
        document: Document,
        content: string,
        contentType: 'base64' | 'text' = 'base64'
    ): Promise<boolean> {
        try {
            // Garante que o diretório existe
            await this.init();

            // Gera nome único para o arquivo
            const fileName = `${document.id}_${Date.now()}.${document.type}`;
            const localPath = `${OFFLINE_DIR}${fileName}`;

            // Salva o conteúdo no sistema de arquivos
            if (contentType === 'base64') {
                // Salva como base64 (para binários como PDF)
                await FileSystem.writeAsStringAsync(localPath, content, {
                    encoding: 'base64',
                });
            } else {
                // Salva como texto UTF-8 (para HTML, etc.)
                await FileSystem.writeAsStringAsync(localPath, content, {
                    encoding: 'utf8',
                });
            }

            // Atualiza lista de metadados
            const docs = await this.getOfflineDocumentsList();

            // Remove entrada anterior se existir (para atualização)
            const filteredDocs = docs.filter(d => d.documentId !== document.id);

            // Cria novos metadados
            const meta: OfflineDocumentMeta = {
                documentId: document.id,
                title: document.title,
                type: document.type,
                localPath,
                savedAt: new Date().toISOString(),
                size: document.size,
            };

            // Salva lista atualizada
            await this.saveOfflineDocumentsList([...filteredDocs, meta]);

            return true;
        } catch (error) {
            console.error('Erro ao salvar documento offline:', error);
            return false;
        }
    }

    // ========================================
    // LEITURA DE CONTEÚDO
    // ========================================

    /**
     * Obtém o conteúdo de um documento salvo offline
     * 
     * @param documentId - ID do documento
     * @param encoding - Encoding para leitura ('base64' ou 'utf8')
     * @returns Conteúdo do documento ou null se não encontrado
     */
    async getOfflineDocumentContent(
        documentId: string,
        encoding: 'base64' | 'utf8' = 'base64'
    ): Promise<string | null> {
        try {
            // Busca metadados do documento
            const meta = await this.getOfflineDocumentMeta(documentId);
            if (!meta) return null;

            // Verifica se o arquivo ainda existe
            const fileInfo = await FileSystem.getInfoAsync(meta.localPath);
            if (!fileInfo.exists) {
                // Arquivo foi deletado, limpa metadados obsoletos
                await this.removeOfflineDocument(documentId);
                return null;
            }

            // Lê o conteúdo do arquivo
            const content = await FileSystem.readAsStringAsync(meta.localPath, {
                encoding: encoding === 'base64' ? 'base64' : 'utf8',
            });

            return content;
        } catch (error) {
            console.error('Erro ao ler documento offline:', error);
            return null;
        }
    }

    // ========================================
    // REMOÇÃO
    // ========================================

    /**
     * Remove um documento do armazenamento offline
     * 
     * @param documentId - ID do documento a remover
     * @returns true se removeu com sucesso
     */
    async removeOfflineDocument(documentId: string): Promise<boolean> {
        try {
            // Busca metadados para obter caminho do arquivo
            const meta = await this.getOfflineDocumentMeta(documentId);

            if (meta) {
                // Verifica e deleta o arquivo se existir
                const fileInfo = await FileSystem.getInfoAsync(meta.localPath);
                if (fileInfo.exists) {
                    await FileSystem.deleteAsync(meta.localPath);
                }
            }

            // Remove dos metadados
            const docs = await this.getOfflineDocumentsList();
            const filteredDocs = docs.filter(d => d.documentId !== documentId);
            await this.saveOfflineDocumentsList(filteredDocs);

            return true;
        } catch (error) {
            console.error('Erro ao remover documento offline:', error);
            return false;
        }
    }

    /**
     * Remove todos os documentos offline
     * Útil para liberar espaço ou fazer reset
     * 
     * @returns true se limpou com sucesso
     */
    async clearAllOfflineDocuments(): Promise<boolean> {
        try {
            await this.init();

            // Deleta todo o diretório offline
            const dirInfo = await FileSystem.getInfoAsync(OFFLINE_DIR);
            if (dirInfo.exists) {
                await FileSystem.deleteAsync(OFFLINE_DIR, { idempotent: true });
                // Recria o diretório vazio
                await FileSystem.makeDirectoryAsync(OFFLINE_DIR, { intermediates: true });
            }

            // Limpa metadados
            await AsyncStorage.removeItem(OFFLINE_DOCS_KEY);

            return true;
        } catch (error) {
            console.error('Erro ao limpar documentos offline:', error);
            return false;
        }
    }
}

// ============================================
// EXPORTAÇÃO
// ============================================

/**
 * Instância única do serviço offline (singleton)
 * Usar esta instância em todo o aplicativo
 */
export const offlineService = new OfflineService();
