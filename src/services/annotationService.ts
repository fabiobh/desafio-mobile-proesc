/**
 * Serviço de Anotações em Documentos
 * Gerencia anotações (destaques e notas) em documentos PDF
 * Persiste dados usando AsyncStorage
 */

// Importa AsyncStorage para persistência
import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// CONSTANTES
// ============================================

/**
 * Chave usada para armazenar anotações no AsyncStorage
 */
const ANNOTATIONS_KEY = '@proesc_annotations';

// ============================================
// TIPOS
// ============================================

/**
 * Tipos de anotações suportadas
 * - highlight: Destaque de texto
 * - note: Nota/comentário
 */
export type AnnotationType = 'highlight' | 'note';

/**
 * Interface para uma anotação individual
 */
export interface Annotation {
    id: string;               // Identificador único da anotação
    type: AnnotationType;     // Tipo: destaque ou nota
    page: number;             // Número da página
    x: number;                // Posição X (percentual da largura da página)
    y: number;                // Posição Y (percentual da altura da página)
    width?: number;           // Largura do destaque (percentual)
    height?: number;          // Altura do destaque (percentual)
    text?: string;            // Texto selecionado (para destaques)
    color: string;            // Cor da anotação (hex)
    content?: string;         // Conteúdo da nota (para notas)
    createdAt: string;        // Data de criação (ISO string)
}

/**
 * Interface para agrupar anotações por documento
 */
export interface DocumentAnnotations {
    documentId: string;       // ID do documento
    annotations: Annotation[]; // Lista de anotações do documento
    updatedAt: string;        // Data da última atualização
}

// ============================================
// CLASSE DE SERVIÇO
// ============================================

/**
 * Classe que gerencia anotações em documentos
 */
class AnnotationService {
    // ========================================
    // LEITURA
    // ========================================

    /**
     * Obtém todas as anotações de um documento
     * 
     * @param documentId - ID do documento
     * @returns Array com anotações do documento
     */
    async getAnnotations(documentId: string): Promise<Annotation[]> {
        try {
            const allAnnotations = await this.getAllDocumentAnnotations();
            const docAnnotations = allAnnotations.find(d => d.documentId === documentId);
            return docAnnotations?.annotations || [];
        } catch (error) {
            console.error('Erro ao obter anotações:', error);
            return [];
        }
    }

    // ========================================
    // SALVAMENTO
    // ========================================

    /**
     * Salva a lista completa de anotações de um documento
     * Substitui todas as anotações existentes
     * 
     * @param documentId - ID do documento
     * @param annotations - Lista de anotações para salvar
     * @returns true se salvou com sucesso
     */
    async saveAnnotations(documentId: string, annotations: Annotation[]): Promise<boolean> {
        try {
            const allAnnotations = await this.getAllDocumentAnnotations();

            // Cria ou atualiza entrada do documento
            const existingIndex = allAnnotations.findIndex(d => d.documentId === documentId);
            const docAnnotations: DocumentAnnotations = {
                documentId,
                annotations,
                updatedAt: new Date().toISOString(),
            };

            if (existingIndex >= 0) {
                // Atualiza entrada existente
                allAnnotations[existingIndex] = docAnnotations;
            } else {
                // Adiciona nova entrada
                allAnnotations.push(docAnnotations);
            }

            // Persiste no AsyncStorage
            await AsyncStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(allAnnotations));
            return true;
        } catch (error) {
            console.error('Erro ao salvar anotações:', error);
            return false;
        }
    }

    // ========================================
    // ADICIONAR ANOTAÇÃO
    // ========================================

    /**
     * Adiciona uma nova anotação a um documento
     * Gera ID e data automaticamente
     * 
     * @param documentId - ID do documento
     * @param annotation - Dados da anotação (sem id e createdAt)
     * @returns Anotação criada ou null em caso de erro
     */
    async addAnnotation(documentId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>): Promise<Annotation | null> {
        try {
            // Obtém anotações existentes
            const annotations = await this.getAnnotations(documentId);

            // Cria nova anotação com ID único e data de criação
            const newAnnotation: Annotation = {
                ...annotation,
                id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
            };

            // Adiciona à lista e salva
            annotations.push(newAnnotation);
            await this.saveAnnotations(documentId, annotations);

            return newAnnotation;
        } catch (error) {
            console.error('Erro ao adicionar anotação:', error);
            return null;
        }
    }

    // ========================================
    // REMOVER ANOTAÇÃO
    // ========================================

    /**
     * Remove uma anotação específica de um documento
     * 
     * @param documentId - ID do documento
     * @param annotationId - ID da anotação a remover
     * @returns true se removeu com sucesso
     */
    async removeAnnotation(documentId: string, annotationId: string): Promise<boolean> {
        try {
            const annotations = await this.getAnnotations(documentId);
            const filteredAnnotations = annotations.filter(a => a.id !== annotationId);

            // Verifica se a anotação existia
            if (filteredAnnotations.length === annotations.length) {
                return false; // Anotação não encontrada
            }

            await this.saveAnnotations(documentId, filteredAnnotations);
            return true;
        } catch (error) {
            console.error('Erro ao remover anotação:', error);
            return false;
        }
    }

    // ========================================
    // ATUALIZAR ANOTAÇÃO
    // ========================================

    /**
     * Atualiza uma anotação existente
     * 
     * @param documentId - ID do documento
     * @param annotationId - ID da anotação a atualizar
     * @param updates - Campos a atualizar (parcial)
     * @returns true se atualizou com sucesso
     */
    async updateAnnotation(
        documentId: string,
        annotationId: string,
        updates: Partial<Annotation>
    ): Promise<boolean> {
        try {
            const annotations = await this.getAnnotations(documentId);
            const index = annotations.findIndex(a => a.id === annotationId);

            // Verifica se a anotação existe
            if (index < 0) return false;

            // Mescla atualizações
            annotations[index] = {
                ...annotations[index],
                ...updates,
            };

            await this.saveAnnotations(documentId, annotations);
            return true;
        } catch (error) {
            console.error('Erro ao atualizar anotação:', error);
            return false;
        }
    }

    // ========================================
    // DELETAR ANOTAÇÕES DO DOCUMENTO
    // ========================================

    /**
     * Remove todas as anotações de um documento
     * 
     * @param documentId - ID do documento
     * @returns true se deletou com sucesso
     */
    async deleteDocumentAnnotations(documentId: string): Promise<boolean> {
        try {
            const allAnnotations = await this.getAllDocumentAnnotations();
            const filteredAnnotations = allAnnotations.filter(d => d.documentId !== documentId);
            await AsyncStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(filteredAnnotations));
            return true;
        } catch (error) {
            console.error('Erro ao deletar anotações do documento:', error);
            return false;
        }
    }

    // ========================================
    // FUNÇÃO AUXILIAR PRIVADA
    // ========================================

    /**
     * Obtém todas as anotações de todos os documentos
     * Função interna para manipulação de dados
     * 
     * @returns Array com anotações agrupadas por documento
     */
    private async getAllDocumentAnnotations(): Promise<DocumentAnnotations[]> {
        try {
            const data = await AsyncStorage.getItem(ANNOTATIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Erro ao obter todas as anotações:', error);
            return [];
        }
    }

    // ========================================
    // LIMPEZA TOTAL
    // ========================================

    /**
     * Remove todas as anotações de todos os documentos
     * Útil para reset ou limpeza de dados
     * 
     * @returns true se limpou com sucesso
     */
    async clearAllAnnotations(): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(ANNOTATIONS_KEY);
            return true;
        } catch (error) {
            console.error('Erro ao limpar todas as anotações:', error);
            return false;
        }
    }
}

// ============================================
// EXPORTAÇÃO
// ============================================

/**
 * Instância única do serviço de anotações (singleton)
 * Usar esta instância em todo o aplicativo
 */
export const annotationService = new AnnotationService();
