import { DocumentCategory, UploadCategory, DocumentStatus } from '../types';

// Document category labels
export const DOCUMENT_CATEGORIES: Record<DocumentCategory, string> = {
    historico: 'Histórico Escolar',
    boletim: 'Boletim',
    declaracao: 'Declaração',
    comunicado: 'Comunicado',
};

// Upload category labels
export const UPLOAD_CATEGORIES: Record<UploadCategory, string> = {
    atestado: 'Atestado Médico',
    justificativa: 'Justificativa de Falta',
    requerimento: 'Requerimento',
    outros: 'Outros Documentos',
};

// Status configuration
export const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bgColor: string }> = {
    enviado: {
        label: 'Enviado',
        color: '#6b7280',
        bgColor: '#f3f4f6',
    },
    em_analise: {
        label: 'Em Análise',
        color: '#d97706',
        bgColor: '#fef3c7',
    },
    aprovado: {
        label: 'Aprovado',
        color: '#16a34a',
        bgColor: '#dcfce7',
    },
    rejeitado: {
        label: 'Rejeitado',
        color: '#dc2626',
        bgColor: '#fee2e2',
    },
};

// Document type icons
export const DOCUMENT_TYPE_ICONS: Record<string, string> = {
    pdf: '📄',
    docx: '📝',
    html: '🌐',
    image: '🖼️',
};

// Category icons
export const CATEGORY_ICONS: Record<UploadCategory, string> = {
    atestado: '🏥',
    justificativa: '📝',
    requerimento: '📋',
    outros: '📄',
};

// Mock credentials for testing
export const MOCK_CREDENTIALS = {
    matricula: '123456',
    senha: 'aluno123',
};

// Mock user data
export const MOCK_USER = {
    id: '1',
    name: 'João da Silva',
    matricula: '123456',
    email: 'joao.silva@escola.com',
    turma: '9º Ano A',
    serie: 'Ensino Fundamental',
};
