import {
    Document,
    UploadedDocument,
    LoginResponse,
    DocumentsResponse,
    UploadedDocumentsResponse,
    UploadResponse,
    UploadCategory,
} from '../types';
import { MOCK_CREDENTIALS, MOCK_USER } from '../constants';

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// In-memory storage for uploaded documents
let uploadedDocuments: UploadedDocument[] = [];

// Available documents (would come from server in real app)
const availableDocuments: Document[] = [
    {
        id: '1',
        title: 'Histórico Escolar Completo',
        type: 'docx',
        category: 'historico',
        url: 'historico_escolar.docx',
        date: '2024-02-15',
        size: '16 KB',
        description: 'Histórico escolar completo com todas as disciplinas cursadas.',
        pages: 4,
    },
    {
        id: '2',
        title: 'Boletim 1º Bimestre 2024',
        type: 'image',
        category: 'boletim',
        url: 'boletim_escolar.png',
        date: '2024-04-10',
        size: '75 KB',
        description: 'Boletim de notas do primeiro bimestre de 2024.',
    },
    {
        id: '3',
        title: 'Declaração de Matrícula',
        type: 'pdf',
        category: 'declaracao',
        url: 'declaracao_matricula.pdf',
        date: '2024-05-20',
        size: '169 KB',
        description: 'Declaração oficial de matrícula para o ano letivo de 2024.',
    },
    {
        id: '4',
        title: 'Comunicado - Reunião de Pais',
        type: 'html',
        category: 'comunicado',
        url: 'comunicado.html',
        date: '2024-05-25',
        size: '9 KB',
        description: 'Comunicado sobre reunião de pais e mestres.',
    },
];

// Mock API Service
export const api = {
    // Login endpoint
    async login(matricula: string, senha: string): Promise<LoginResponse> {
        await delay(1000); // Simulate network delay

        if (matricula === MOCK_CREDENTIALS.matricula && senha === MOCK_CREDENTIALS.senha) {
            return {
                success: true,
                user: MOCK_USER,
                token: 'mock-jwt-token-123456',
            };
        }

        return {
            success: false,
            error: 'Matrícula ou senha incorretos',
        };
    },

    // Get available documents
    async getDocuments(category?: string): Promise<DocumentsResponse> {
        await delay(500);

        let documents = [...availableDocuments];

        if (category && category !== 'all') {
            documents = documents.filter(doc => doc.category === category);
        }

        return {
            success: true,
            documents,
        };
    },

    // Get uploaded documents
    async getUploadedDocuments(): Promise<UploadedDocumentsResponse> {
        await delay(500);

        return {
            success: true,
            documents: uploadedDocuments,
        };
    },

    // Upload document
    async uploadDocument(
        title: string,
        category: UploadCategory,
        fileUri: string,
        fileName: string,
        fileSize?: string
    ): Promise<UploadResponse> {
        await delay(1500); // Simulate upload time

        const newDocument: UploadedDocument = {
            id: Date.now().toString(),
            title,
            category,
            status: 'enviado',
            uploadDate: new Date().toISOString().split('T')[0],
            fileUri,
            fileName,
            fileSize,
        };

        uploadedDocuments = [newDocument, ...uploadedDocuments];

        // Simulate status change after some time
        setTimeout(() => {
            const docIndex = uploadedDocuments.findIndex(d => d.id === newDocument.id);
            if (docIndex !== -1) {
                uploadedDocuments[docIndex] = {
                    ...uploadedDocuments[docIndex],
                    status: 'em_analise',
                };
            }
        }, 5000);

        return {
            success: true,
            document: newDocument,
        };
    },

    // Update document status (admin function, simulated)
    async updateDocumentStatus(
        documentId: string,
        status: 'aprovado' | 'rejeitado'
    ): Promise<{ success: boolean }> {
        await delay(500);

        const docIndex = uploadedDocuments.findIndex(d => d.id === documentId);
        if (docIndex !== -1) {
            uploadedDocuments[docIndex] = {
                ...uploadedDocuments[docIndex],
                status,
            };
            return { success: true };
        }

        return { success: false };
    },

    // Reset uploaded documents (for testing)
    resetUploadedDocuments(): void {
        uploadedDocuments = [];
    },
};
