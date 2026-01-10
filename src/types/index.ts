// Document types
export type DocumentType = 'pdf' | 'docx' | 'html' | 'image';

// Available document categories
export type DocumentCategory = 'historico' | 'boletim' | 'declaracao' | 'comunicado';

// Upload document categories
export type UploadCategory = 'atestado' | 'justificativa' | 'requerimento' | 'outros';

// Document status
export type DocumentStatus = 'enviado' | 'em_analise' | 'aprovado' | 'rejeitado';

// Available Document (from school)
export interface Document {
    id: string;
    title: string;
    type: DocumentType;
    category: DocumentCategory;
    url: string;
    date: string;
    size: string;
    description?: string;
    pages?: number;
}

// Uploaded Document (by student)
export interface UploadedDocument {
    id: string;
    title: string;
    category: UploadCategory;
    status: DocumentStatus;
    uploadDate: string;
    fileUri: string;
    fileName: string;
    fileSize?: string;
}

// User/Student
export interface User {
    id: string;
    name: string;
    matricula: string;
    email?: string;
    turma?: string;
    serie?: string;
}

// Auth state
export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
}

// API Response types
export interface LoginResponse {
    success: boolean;
    user?: User;
    token?: string;
    error?: string;
}

export interface DocumentsResponse {
    success: boolean;
    documents: Document[];
    error?: string;
}

export interface UploadedDocumentsResponse {
    success: boolean;
    documents: UploadedDocument[];
    error?: string;
}

export interface UploadResponse {
    success: boolean;
    document?: UploadedDocument;
    error?: string;
}

// Navigation types
export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    DocumentViewer: {
        document: Document;
    };
};
