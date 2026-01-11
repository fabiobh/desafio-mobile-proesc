/**
 * Arquivo de constantes do aplicativo
 * Centraliza valores fixos utilizados em todo o aplicativo
 */

// Importa os tipos necessários para tipagem das constantes
import { DocumentCategory, UploadCategory, DocumentStatus } from '../types';

// ============================================
// LABELS DE CATEGORIAS
// ============================================

/**
 * Mapeamento de categorias de documentos disponíveis para seus labels em português
 * Usado para exibir nomes amigáveis nas listagens
 */
export const DOCUMENT_CATEGORIES: Record<DocumentCategory, string> = {
    historico: 'Histórico Escolar',
    boletim: 'Boletim',
    declaracao: 'Declaração',
    comunicado: 'Comunicado',
};

/**
 * Mapeamento de categorias de upload para seus labels em português
 * Usado no formulário de envio de documentos
 */
export const UPLOAD_CATEGORIES: Record<UploadCategory, string> = {
    atestado: 'Atestado Médico',
    justificativa: 'Justificativa de Falta',
    requerimento: 'Requerimento',
    outros: 'Outros Documentos',
};

// ============================================
// CONFIGURAÇÃO DE STATUS
// ============================================

/**
 * Configuração visual para cada status de documento
 * Define label, cor do texto e cor de fundo para os badges de status
 */
export const STATUS_CONFIG: Record<DocumentStatus, { label: string; color: string; bgColor: string }> = {
    enviado: {
        label: 'Enviado',           // Documento recebido
        color: '#6b7280',           // Cinza (texto)
        bgColor: '#f3f4f6',         // Cinza claro (fundo)
    },
    em_analise: {
        label: 'Em Análise',        // Documento sendo analisado
        color: '#d97706',           // Laranja (texto)
        bgColor: '#fef3c7',         // Amarelo claro (fundo)
    },
    aprovado: {
        label: 'Aprovado',          // Documento aceito
        color: '#16a34a',           // Verde (texto)
        bgColor: '#dcfce7',         // Verde claro (fundo)
    },
    rejeitado: {
        label: 'Rejeitado',         // Documento recusado
        color: '#dc2626',           // Vermelho (texto)
        bgColor: '#fee2e2',         // Vermelho claro (fundo)
    },
};

// ============================================
// ÍCONES
// ============================================

/**
 * Ícones emoji para cada tipo de documento
 * Usados nos cards de documentos disponíveis
 */
export const DOCUMENT_TYPE_ICONS: Record<string, string> = {
    pdf: '📄',      // Ícone para PDF
    docx: '📝',     // Ícone para Word
    html: '🌐',     // Ícone para HTML
    image: '🖼️',   // Ícone para imagens
};

/**
 * Ícones emoji para cada categoria de upload
 * Usados no formulário de envio e nos cards de documentos enviados
 */
export const CATEGORY_ICONS: Record<UploadCategory, string> = {
    atestado: '🏥',       // Hospital/médico
    justificativa: '📝',  // Documento escrito
    requerimento: '📋',   // Prancheta/formulário
    outros: '📄',         // Documento genérico
};

// ============================================
// CREDENCIAIS DE TESTE
// ============================================

/**
 * Credenciais mock para testes de desenvolvimento
 * ATENÇÃO: Apenas para ambiente de desenvolvimento!
 */
export const MOCK_CREDENTIALS = {
    matricula: '123456',    // Matrícula de teste
    senha: 'aluno123',      // Senha de teste
};

/**
 * Dados do usuário mock para testes
 * Simula um aluno cadastrado no sistema
 */
export const MOCK_USER = {
    id: '1',
    name: 'João da Silva',
    matricula: '123456',
    email: 'joao.silva@escola.com',
    turma: '9º Ano A',
    serie: 'Ensino Fundamental',
};
