/**
 * Arquivo de definições de tipos TypeScript
 * Centraliza todas as interfaces e types utilizados no aplicativo
 */

// ============================================
// TIPOS DE DOCUMENTOS
// ============================================

/**
 * Tipos de documentos suportados pelo sistema
 * - pdf: Documentos PDF
 * - docx: Documentos Word
 * - html: Páginas HTML
 * - image: Imagens (PNG, JPG, etc.)
 */
export type DocumentType = 'pdf' | 'docx' | 'html' | 'image';

/**
 * Categorias de documentos disponíveis da escola
 * - historico: Histórico escolar do aluno
 * - boletim: Boletins de notas
 * - declaracao: Declarações oficiais
 * - comunicado: Comunicados da escola
 */
export type DocumentCategory = 'historico' | 'boletim' | 'declaracao' | 'comunicado';

/**
 * Categorias para upload de documentos pelo aluno
 * - atestado: Atestados médicos
 * - justificativa: Justificativas de falta
 * - requerimento: Requerimentos diversos
 * - outros: Outros tipos de documentos
 */
export type UploadCategory = 'atestado' | 'justificativa' | 'requerimento' | 'outros';

/**
 * Status de um documento enviado pelo aluno
 * - enviado: Documento recebido, aguardando análise
 * - em_analise: Documento sendo analisado
 * - aprovado: Documento aprovado
 * - rejeitado: Documento rejeitado
 */
export type DocumentStatus = 'enviado' | 'em_analise' | 'aprovado' | 'rejeitado';

// ============================================
// INTERFACES DE DOCUMENTOS
// ============================================

/**
 * Interface para documentos disponíveis (da escola)
 * Representa documentos que o aluno pode visualizar/baixar
 */
export interface Document {
    id: string;                      // Identificador único do documento
    title: string;                   // Título do documento
    type: DocumentType;              // Tipo do arquivo (pdf, docx, etc.)
    category: DocumentCategory;      // Categoria do documento
    url: string;                     // URL ou caminho do arquivo
    date: string;                    // Data de emissão/criação
    size: string;                    // Tamanho do arquivo (ex: "200 KB")
    description?: string;            // Descrição opcional do documento
    pages?: number;                  // Número de páginas (para PDFs)
    isOffline?: boolean;             // Indica se está salvo offline
}

/**
 * Metadados de documento salvo offline
 * Armazena informações para recuperar documentos salvos localmente
 */
export interface OfflineDocumentMeta {
    documentId: string;              // ID do documento original
    title: string;                   // Título do documento
    type: string;                    // Tipo do arquivo
    localPath: string;               // Caminho local do arquivo salvo
    savedAt: string;                 // Data/hora em que foi salvo
    size?: string;                   // Tamanho do arquivo
}

/**
 * Interface para anotações em PDFs
 * Permite destacar texto ou adicionar notas em documentos
 */
export interface Annotation {
    id: string;                      // Identificador único da anotação
    type: 'highlight' | 'note';      // Tipo: destaque ou nota
    page: number;                    // Número da página
    x: number;                       // Posição X (percentual da largura)
    y: number;                       // Posição Y (percentual da altura)
    width?: number;                  // Largura do destaque (percentual)
    height?: number;                 // Altura do destaque (percentual)
    text?: string;                   // Texto selecionado (para destaques)
    color: string;                   // Cor da anotação
    content?: string;                // Conteúdo da nota
    createdAt: string;               // Data de criação
}

/**
 * Interface para documentos enviados pelo aluno
 * Representa documentos que o aluno fez upload
 */
export interface UploadedDocument {
    id: string;                      // Identificador único
    title: string;                   // Título dado pelo aluno
    category: UploadCategory;        // Categoria do documento
    status: DocumentStatus;          // Status atual do documento
    uploadDate: string;              // Data do upload
    fileUri: string;                 // URI do arquivo no dispositivo
    fileName: string;                // Nome do arquivo original
    fileSize?: string;               // Tamanho do arquivo
}

// ============================================
// INTERFACES DE USUÁRIO
// ============================================

/**
 * Interface para dados do usuário/aluno
 */
export interface User {
    id: string;                      // Identificador único
    name: string;                    // Nome completo
    matricula: string;               // Número de matrícula
    email?: string;                  // Email (opcional)
    turma?: string;                  // Turma atual
    serie?: string;                  // Série/Ano escolar
}

// ============================================
// INTERFACES DE ESTADO E AUTENTICAÇÃO
// ============================================

/**
 * Estado de autenticação do aplicativo
 */
export interface AuthState {
    user: User | null;               // Usuário logado (null se não autenticado)
    isAuthenticated: boolean;        // Se está autenticado
    isLoading: boolean;              // Se está carregando dados
}

// ============================================
// INTERFACES DE RESPOSTA DA API
// ============================================

/**
 * Resposta do endpoint de login
 */
export interface LoginResponse {
    success: boolean;                // Se o login foi bem-sucedido
    user?: User;                     // Dados do usuário (se sucesso)
    token?: string;                  // Token de autenticação (se sucesso)
    error?: string;                  // Mensagem de erro (se falha)
}

/**
 * Resposta do endpoint de listagem de documentos disponíveis
 */
export interface DocumentsResponse {
    success: boolean;                // Se a requisição foi bem-sucedida
    documents: Document[];           // Lista de documentos
    error?: string;                  // Mensagem de erro (se falha)
}

/**
 * Resposta do endpoint de documentos enviados pelo aluno
 */
export interface UploadedDocumentsResponse {
    success: boolean;                // Se a requisição foi bem-sucedida
    documents: UploadedDocument[];   // Lista de documentos enviados
    error?: string;                  // Mensagem de erro (se falha)
}

/**
 * Resposta do endpoint de upload de documento
 */
export interface UploadResponse {
    success: boolean;                // Se o upload foi bem-sucedido
    document?: UploadedDocument;     // Documento criado (se sucesso)
    error?: string;                  // Mensagem de erro (se falha)
}

// ============================================
// TIPOS DE NAVEGAÇÃO
// ============================================

/**
 * Parâmetros das rotas da navegação principal
 * Define os parâmetros que cada tela pode receber
 */
export type RootStackParamList = {
    Login: undefined;                // Tela de login não recebe parâmetros
    Home: undefined;                 // Tela inicial não recebe parâmetros
    DocumentViewer: {                // Tela de visualização recebe:
        document: Document;          // - O documento a ser exibido
    };
};
