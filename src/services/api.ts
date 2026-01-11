/**
 * Serviço de API Mock
 * Simula endpoints de backend para desenvolvimento e testes
 * Em produção, estas funções seriam substituídas por chamadas HTTP reais
 */

// Importa tipos necessários
import {
    Document,
    UploadedDocument,
    LoginResponse,
    DocumentsResponse,
    UploadedDocumentsResponse,
    UploadResponse,
    UploadCategory,
} from '../types';

// Importa credenciais e dados de teste
import { MOCK_CREDENTIALS, MOCK_USER } from '../constants';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Simula delay de rede
 * Usado para tornar a experiência mais realista
 * 
 * @param ms - Tempo de espera em milissegundos
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// ============================================
// ARMAZENAMENTO EM MEMÓRIA
// ============================================

/**
 * Armazena documentos enviados pelo usuário (em memória)
 * Em produção, esses dados viriam do backend
 */
let uploadedDocuments: UploadedDocument[] = [];

/**
 * Lista de documentos disponíveis para o aluno
 * Simula documentos que a escola disponibiliza
 */
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

// ============================================
// SERVIÇO DE API
// ============================================

/**
 * Objeto que contém todas as funções de API mock
 */
export const api = {
    // ========================================
    // AUTENTICAÇÃO
    // ========================================

    /**
     * Realiza login do usuário
     * 
     * @param matricula - Número de matrícula do aluno
     * @param senha - Senha do aluno
     * @returns Promise com resultado do login
     */
    async login(matricula: string, senha: string): Promise<LoginResponse> {
        // Simula delay de rede (1 segundo)
        await delay(1000);

        // Verifica credenciais (compara com dados mock)
        if (matricula === MOCK_CREDENTIALS.matricula && senha === MOCK_CREDENTIALS.senha) {
            return {
                success: true,
                user: MOCK_USER,
                token: 'mock-jwt-token-123456',
            };
        }

        // Credenciais inválidas
        return {
            success: false,
            error: 'Matrícula ou senha incorretos',
        };
    },

    // ========================================
    // DOCUMENTOS DISPONÍVEIS
    // ========================================

    /**
     * Busca documentos disponíveis para o aluno
     * 
     * @param category - Categoria para filtrar (opcional)
     * @returns Promise com lista de documentos
     */
    async getDocuments(category?: string): Promise<DocumentsResponse> {
        // Simula delay de rede (0.5 segundos)
        await delay(500);

        // Cria cópia da lista de documentos
        let documents = [...availableDocuments];

        // Aplica filtro de categoria se especificado
        if (category && category !== 'all') {
            documents = documents.filter(doc => doc.category === category);
        }

        return {
            success: true,
            documents,
        };
    },

    // ========================================
    // DOCUMENTOS ENVIADOS
    // ========================================

    /**
     * Busca documentos enviados pelo aluno
     * 
     * @returns Promise com lista de documentos enviados
     */
    async getUploadedDocuments(): Promise<UploadedDocumentsResponse> {
        // Simula delay de rede (0.5 segundos)
        await delay(500);

        return {
            success: true,
            documents: uploadedDocuments,
        };
    },

    // ========================================
    // UPLOAD DE DOCUMENTO
    // ========================================

    /**
     * Envia um novo documento
     * 
     * @param title - Título do documento
     * @param category - Categoria do documento
     * @param fileUri - URI do arquivo no dispositivo
     * @param fileName - Nome original do arquivo
     * @param fileSize - Tamanho do arquivo (opcional)
     * @returns Promise com resultado do upload
     */
    async uploadDocument(
        title: string,
        category: UploadCategory,
        fileUri: string,
        fileName: string,
        fileSize?: string
    ): Promise<UploadResponse> {
        // Simula delay de upload (1.5 segundos)
        await delay(1500);

        // Cria novo documento com status inicial "enviado"
        const newDocument: UploadedDocument = {
            id: Date.now().toString(),           // ID único baseado em timestamp
            title,
            category,
            status: 'enviado',                   // Status inicial
            uploadDate: new Date().toISOString().split('T')[0], // Data atual
            fileUri,
            fileName,
            fileSize,
        };

        // Adiciona ao início da lista
        uploadedDocuments = [newDocument, ...uploadedDocuments];

        // ========================================
        // SIMULAÇÃO DE MUDANÇA DE STATUS
        // ========================================

        /**
         * Após 5 segundos, muda o status para "em_análise"
         * Simula o comportamento real onde a escola analisa o documento
         */
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

    // ========================================
    // ATUALIZAÇÃO DE STATUS (ADMIN)
    // ========================================

    /**
     * Atualiza o status de um documento (função administrativa)
     * Em produção, seria usada pela equipe da escola
     * 
     * @param documentId - ID do documento
     * @param status - Novo status ('aprovado' ou 'rejeitado')
     * @returns Promise com resultado da operação
     */
    async updateDocumentStatus(
        documentId: string,
        status: 'aprovado' | 'rejeitado'
    ): Promise<{ success: boolean }> {
        // Simula delay de rede
        await delay(500);

        // Busca documento pelo ID
        const docIndex = uploadedDocuments.findIndex(d => d.id === documentId);

        if (docIndex !== -1) {
            // Atualiza o status
            uploadedDocuments[docIndex] = {
                ...uploadedDocuments[docIndex],
                status,
            };
            return { success: true };
        }

        // Documento não encontrado
        return { success: false };
    },

    // ========================================
    // FUNÇÕES DE TESTE
    // ========================================

    /**
     * Limpa todos os documentos enviados (para testes)
     * Útil para resetar o estado durante desenvolvimento
     */
    resetUploadedDocuments(): void {
        uploadedDocuments = [];
    },
};
