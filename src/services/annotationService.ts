import AsyncStorage from '@react-native-async-storage/async-storage';

const ANNOTATIONS_KEY = '@proesc_annotations';

export type AnnotationType = 'highlight' | 'note';

export interface Annotation {
    id: string;
    type: AnnotationType;
    page: number;
    // Position as percentage of page dimensions
    x: number;
    y: number;
    width?: number;
    height?: number;
    // For highlights
    text?: string;
    color: string;
    // For notes
    content?: string;
    createdAt: string;
}

export interface DocumentAnnotations {
    documentId: string;
    annotations: Annotation[];
    updatedAt: string;
}

class AnnotationService {
    // Get all annotations for a document
    async getAnnotations(documentId: string): Promise<Annotation[]> {
        try {
            const allAnnotations = await this.getAllDocumentAnnotations();
            const docAnnotations = allAnnotations.find(d => d.documentId === documentId);
            return docAnnotations?.annotations || [];
        } catch (error) {
            console.error('Error getting annotations:', error);
            return [];
        }
    }

    // Save annotations for a document
    async saveAnnotations(documentId: string, annotations: Annotation[]): Promise<boolean> {
        try {
            const allAnnotations = await this.getAllDocumentAnnotations();

            // Update or add document annotations
            const existingIndex = allAnnotations.findIndex(d => d.documentId === documentId);
            const docAnnotations: DocumentAnnotations = {
                documentId,
                annotations,
                updatedAt: new Date().toISOString(),
            };

            if (existingIndex >= 0) {
                allAnnotations[existingIndex] = docAnnotations;
            } else {
                allAnnotations.push(docAnnotations);
            }

            await AsyncStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(allAnnotations));
            return true;
        } catch (error) {
            console.error('Error saving annotations:', error);
            return false;
        }
    }

    // Add a single annotation
    async addAnnotation(documentId: string, annotation: Omit<Annotation, 'id' | 'createdAt'>): Promise<Annotation | null> {
        try {
            const annotations = await this.getAnnotations(documentId);

            const newAnnotation: Annotation = {
                ...annotation,
                id: `ann_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                createdAt: new Date().toISOString(),
            };

            annotations.push(newAnnotation);
            await this.saveAnnotations(documentId, annotations);

            return newAnnotation;
        } catch (error) {
            console.error('Error adding annotation:', error);
            return null;
        }
    }

    // Remove a single annotation
    async removeAnnotation(documentId: string, annotationId: string): Promise<boolean> {
        try {
            const annotations = await this.getAnnotations(documentId);
            const filteredAnnotations = annotations.filter(a => a.id !== annotationId);

            if (filteredAnnotations.length === annotations.length) {
                return false; // Annotation not found
            }

            await this.saveAnnotations(documentId, filteredAnnotations);
            return true;
        } catch (error) {
            console.error('Error removing annotation:', error);
            return false;
        }
    }

    // Update an annotation
    async updateAnnotation(
        documentId: string,
        annotationId: string,
        updates: Partial<Annotation>
    ): Promise<boolean> {
        try {
            const annotations = await this.getAnnotations(documentId);
            const index = annotations.findIndex(a => a.id === annotationId);

            if (index < 0) return false;

            annotations[index] = {
                ...annotations[index],
                ...updates,
            };

            await this.saveAnnotations(documentId, annotations);
            return true;
        } catch (error) {
            console.error('Error updating annotation:', error);
            return false;
        }
    }

    // Delete all annotations for a document
    async deleteDocumentAnnotations(documentId: string): Promise<boolean> {
        try {
            const allAnnotations = await this.getAllDocumentAnnotations();
            const filteredAnnotations = allAnnotations.filter(d => d.documentId !== documentId);
            await AsyncStorage.setItem(ANNOTATIONS_KEY, JSON.stringify(filteredAnnotations));
            return true;
        } catch (error) {
            console.error('Error deleting document annotations:', error);
            return false;
        }
    }

    // Get all document annotations (internal helper)
    private async getAllDocumentAnnotations(): Promise<DocumentAnnotations[]> {
        try {
            const data = await AsyncStorage.getItem(ANNOTATIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Error getting all annotations:', error);
            return [];
        }
    }

    // Clear all annotations
    async clearAllAnnotations(): Promise<boolean> {
        try {
            await AsyncStorage.removeItem(ANNOTATIONS_KEY);
            return true;
        } catch (error) {
            console.error('Error clearing all annotations:', error);
            return false;
        }
    }
}

export const annotationService = new AnnotationService();
