/**
 * Tela de Visualização de Documentos (DocumentViewerScreen)
 * Renderiza diferentes tipos de documentos: PDF, DOCX, HTML e imagens
 * Inclui funcionalidades de busca, modo offline e anotações
 */

// Importações do React
import React, { useState, useEffect, useRef } from 'react';

// Importa componentes do React Native
import {
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    TextInput,
    Modal,
    Alert,
} from 'react-native';

// Importa tipos de navegação
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';

// Importa container de área segura
import { SafeAreaView } from 'react-native-safe-area-context';

// Importa WebView para renderização de HTML/PDF
import { WebView } from 'react-native-webview';

// Importa FileSystem para operações com arquivos
import * as FileSystem from 'expo-file-system/legacy';

// Importa Asset para carregar recursos bundled
import { Asset } from 'expo-asset';

// Importa tipos do projeto
import { RootStackParamList, Document, Annotation } from '../types';

// Importa constantes
import { DOCUMENT_TYPE_ICONS } from '../constants';

// Importa dados do DOCX (base64)
import { DOCX_BASE64 } from '../data/docxData';

// Importa serviços
import { offlineService } from '../services/offlineService';
import { annotationService } from '../services/annotationService';

// ============================================
// TIPOS
// ============================================

/**
 * Props da tela DocumentViewerScreen
 */
type DocumentViewerScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'DocumentViewer'>;
    route: RouteProp<RootStackParamList, 'DocumentViewer'>;
};

// ============================================
// CONTEÚDO HTML DE EXEMPLO
// ============================================

/**
 * Conteúdo HTML de demonstração
 * Usado para documentos do tipo 'html'
 * Simula um comunicado escolar
 */
const SAMPLE_HTML_CONTENT = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
      padding: 20px; 
      line-height: 1.6;
      color: #333;
      background: #fff;
    }
    h1 { color: #4f46e5; font-size: 24px; }
    h2 { color: #6366f1; font-size: 20px; margin-top: 24px; }
    .header { text-align: center; border-bottom: 2px solid #4f46e5; padding-bottom: 20px; margin-bottom: 20px; }
    .logo { font-size: 48px; margin-bottom: 10px; }
    .content { max-width: 800px; margin: 0 auto; }
    .info-box { background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 15px 0; }
    .important { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 15px 0; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #9ca3af; font-size: 14px; }
    .search-highlight { background-color: #fef08a; padding: 2px; }
  </style>
</head>
<body>
  <div class="content">
    <div class="header">
      <div class="logo">🏫</div>
      <h1>Escola Municipal Proesc</h1>
      <p>Comunicado Oficial</p>
    </div>
    
    <h2>📋 Comunicado - Reunião de Pais</h2>
    <p><strong>Data do documento:</strong> 25 de Maio de 2024</p>
    
    <div class="info-box">
      <h3>📌 Informações da Reunião</h3>
      <p><strong>Data:</strong> 30 de Maio de 2024</p>
      <p><strong>Horário:</strong> 19h00</p>
      <p><strong>Local:</strong> Auditório Principal</p>
    </div>
    
    <p>Prezados pais e responsáveis,</p>
    
    <p>Convidamos todos para a reunião de pais e mestres que acontecerá no dia 30 de maio. Nesta ocasião, discutiremos:</p>
    
    <ul>
      <li>Resultados do primeiro bimestre</li>
      <li>Calendário de provas do segundo bimestre</li>
      <li>Eventos escolares programados</li>
      <li>Projetos pedagógicos em andamento</li>
    </ul>
    
    <div class="important">
      <strong>⚠️ Importante:</strong> A presença dos pais é fundamental para o acompanhamento do desenvolvimento escolar dos alunos.
    </div>
    
    <p>Contamos com a presença de todos!</p>
    
    <p><strong>Atenciosamente,</strong><br>Direção Escolar</p>
    
    <div class="footer">
      © 2024 Escola Municipal Proesc - Todos os direitos reservados
    </div>
  </div>
</body>
</html>
`;

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Componente DocumentViewerScreen
 * 
 * Funcionalidades:
 * - Renderiza diferentes tipos de documentos (PDF, DOCX, HTML, imagem)
 * - Permite salvar documentos para acesso offline
 * - Busca de texto dentro do documento
 * - Anotações em PDFs (destaques e notas)
 * 
 * @param navigation - Objeto de navegação
 * @param route - Parâmetros da rota (contém o documento)
 */
export function DocumentViewerScreen({ navigation, route }: DocumentViewerScreenProps) {
    // Extrai o documento dos parâmetros da rota
    const { document } = route.params;

    // ========================================
    // ESTADOS PRINCIPAIS
    // ========================================

    // Estado de carregamento
    const [isLoading, setIsLoading] = useState(true);

    // Mensagem de erro (se houver)
    const [error, setError] = useState<string | null>(null);

    // Conteúdo do PDF em base64
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);

    // Conteúdo do DOCX em base64
    const [docxBase64, setDocxBase64] = useState<string | null>(null);

    // ========================================
    // ESTADOS DE MODO OFFLINE
    // ========================================

    // Se o documento está salvo offline
    const [isOffline, setIsOffline] = useState(false);

    // Se está salvando para offline
    const [isSavingOffline, setIsSavingOffline] = useState(false);

    // ========================================
    // ESTADOS DE BUSCA
    // ========================================

    // Se a barra de busca está visível
    const [showSearch, setShowSearch] = useState(false);

    // Texto de busca
    const [searchQuery, setSearchQuery] = useState('');

    // Número de resultados encontrados
    const [searchResults, setSearchResults] = useState(0);

    // Índice do resultado atual (para navegação)
    const [currentSearchIndex, setCurrentSearchIndex] = useState(0);

    // ========================================
    // ESTADOS DE ANOTAÇÕES (para PDF)
    // ========================================

    // Lista de anotações do documento
    const [annotations, setAnnotations] = useState<Annotation[]>([]);

    // Modo de anotação atual: nenhum, destaque ou nota
    const [annotationMode, setAnnotationMode] = useState<'none' | 'highlight' | 'note'>('none');

    // Se o modal de nota está visível
    const [showNoteModal, setShowNoteModal] = useState(false);

    // Texto da nota atual
    const [noteText, setNoteText] = useState('');

    // Anotação selecionada para edição/exclusão
    const [selectedAnnotation, setSelectedAnnotation] = useState<Annotation | null>(null);

    // ========================================
    // REFS
    // ========================================

    // Referência ao WebView para injeção de JavaScript
    const webViewRef = useRef<WebView>(null);

    // Dimensões da tela
    const { width, height } = Dimensions.get('window');

    // ========================================
    // EFEITOS
    // ========================================

    /**
     * Ao montar, verifica status offline e carrega anotações
     */
    useEffect(() => {
        checkOfflineStatus();
        loadAnnotations();
    }, [document.id]);

    /**
     * Verifica se o documento está salvo offline
     */
    async function checkOfflineStatus() {
        const offline = await offlineService.isDocumentOffline(document.id);
        setIsOffline(offline);
    }

    /**
     * Carrega anotações salvas do documento (apenas para PDF)
     */
    async function loadAnnotations() {
        if (document.type === 'pdf') {
            const savedAnnotations = await annotationService.getAnnotations(document.id);
            setAnnotations(savedAnnotations);
        }
    }

    /**
     * Carrega o conteúdo do documento baseado no tipo
     */
    useEffect(() => {
        async function loadDocument() {
            // Tenta carregar do cache offline primeiro
            const offlineContent = await offlineService.getOfflineDocumentContent(document.id);

            if (document.type === 'pdf') {
                try {
                    // Se tem conteúdo offline, usa ele
                    if (offlineContent) {
                        setPdfBase64(offlineContent);
                        setIsLoading(false);
                        return;
                    }

                    // Carrega o asset PDF bundled
                    const asset = Asset.fromModule(require('../../assets/documents/declaracao_matricula.pdf'));
                    await asset.downloadAsync();

                    if (asset.localUri) {
                        // Lê o arquivo como base64
                        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
                            encoding: 'base64',
                        });
                        setPdfBase64(base64);
                    }
                    setIsLoading(false);
                } catch (err) {
                    console.error('Erro ao carregar PDF:', err);
                    setError('Não foi possível carregar o documento PDF.');
                    setIsLoading(false);
                }
            } else if (document.type === 'docx') {
                try {
                    // Se tem conteúdo offline, usa ele
                    if (offlineContent) {
                        setDocxBase64(offlineContent);
                        setIsLoading(false);
                        return;
                    }

                    // Usa dados base64 pré-codificados
                    setDocxBase64(DOCX_BASE64);
                    setIsLoading(false);
                } catch (err) {
                    console.error('Erro ao carregar DOCX:', err);
                    setError('Não foi possível carregar o documento DOCX.');
                    setIsLoading(false);
                }
            } else {
                // Para outros tipos, apenas simula carregamento
                const timer = setTimeout(() => {
                    setIsLoading(false);
                }, 500);
                return () => clearTimeout(timer);
            }
        }
        loadDocument();
    }, [document]);

    // ========================================
    // FUNÇÕES DE MODO OFFLINE
    // ========================================

    /**
     * Salva o documento para acesso offline
     */
    async function handleSaveOffline() {
        setIsSavingOffline(true);
        try {
            let content: string | null = null;
            let contentType: 'base64' | 'text' = 'base64';

            // Determina o conteúdo baseado no tipo
            if (document.type === 'pdf' && pdfBase64) {
                content = pdfBase64;
            } else if (document.type === 'docx' && docxBase64) {
                content = docxBase64;
            } else if (document.type === 'html') {
                content = SAMPLE_HTML_CONTENT;
                contentType = 'text';
            }

            if (content) {
                const success = await offlineService.saveDocumentOffline(document, content, contentType);
                if (success) {
                    setIsOffline(true);
                    Alert.alert('Sucesso', 'Documento salvo para acesso offline!');
                } else {
                    Alert.alert('Erro', 'Não foi possível salvar o documento.');
                }
            }
        } catch (error) {
            console.error('Erro ao salvar offline:', error);
            Alert.alert('Erro', 'Não foi possível salvar o documento.');
        } finally {
            setIsSavingOffline(false);
        }
    }

    /**
     * Remove o documento do armazenamento offline
     */
    async function handleRemoveOffline() {
        const success = await offlineService.removeOfflineDocument(document.id);
        if (success) {
            setIsOffline(false);
            Alert.alert('Removido', 'Documento removido do armazenamento offline.');
        }
    }

    // ========================================
    // FUNÇÕES DE BUSCA
    // ========================================

    /**
     * Executa busca no WebView
     * Destaca todas as ocorrências do termo buscado
     */
    function handleSearch() {
        if (!searchQuery.trim()) return;

        // Script JavaScript injetado no WebView para busca
        const searchScript = `
            (function() {
                // Limpa destaques anteriores
                document.querySelectorAll('.search-highlight').forEach(el => {
                    el.outerHTML = el.innerHTML;
                });
                
                if (!window.find) {
                    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'searchResult', count: 0 }));
                    return;
                }
                
                // Conta ocorrências
                let count = 0;
                const searchText = '${searchQuery.replace(/'/g, "\\'")}';
                const regex = new RegExp(searchText, 'gi');
                const body = document.body.innerHTML;
                const matches = body.match(regex);
                count = matches ? matches.length : 0;
                
                // Destaca ocorrências
                if (count > 0) {
                    document.body.innerHTML = body.replace(regex, '<mark class="search-highlight">$&</mark>');
                    const firstMatch = document.querySelector('.search-highlight');
                    if (firstMatch) firstMatch.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'searchResult', count: count }));
            })();
            true;
        `;

        webViewRef.current?.injectJavaScript(searchScript);
    }

    /**
     * Navega entre resultados de busca (próximo/anterior)
     */
    function navigateSearch(direction: 'next' | 'prev') {
        const script = `
            (function() {
                const highlights = document.querySelectorAll('.search-highlight');
                if (highlights.length === 0) return;
                
                let index = ${currentSearchIndex};
                highlights.forEach(h => h.style.backgroundColor = '#fef08a');
                
                if ('${direction}' === 'next') {
                    index = (index + 1) % highlights.length;
                } else {
                    index = index > 0 ? index - 1 : highlights.length - 1;
                }
                
                highlights[index].style.backgroundColor = '#fb923c';
                highlights[index].scrollIntoView({ behavior: 'smooth', block: 'center' });
                
                window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'searchIndex', index: index }));
            })();
            true;
        `;

        webViewRef.current?.injectJavaScript(script);
    }

    // ========================================
    // HANDLER DE MENSAGENS DO WEBVIEW
    // ========================================

    /**
     * Processa mensagens recebidas do WebView
     * Usado para comunicação bidirecional (busca, anotações)
     */
    function handleWebViewMessage(event: any) {
        try {
            const data = JSON.parse(event.nativeEvent.data);

            if (data.type === 'searchResult') {
                // Resultado de busca
                setSearchResults(data.count);
                setCurrentSearchIndex(0);
            } else if (data.type === 'searchIndex') {
                // Navegação entre resultados
                setCurrentSearchIndex(data.index);
            } else if (data.type === 'textSelected' && annotationMode === 'highlight') {
                // Seleção de texto para destaque
                handleAddHighlight(data);
            } else if (data.type === 'annotationClick') {
                // Clique em anotação existente
                const annotation = annotations.find(a => a.id === data.id);
                if (annotation) {
                    setSelectedAnnotation(annotation);
                    if (annotation.type === 'note') {
                        setNoteText(annotation.content || '');
                        setShowNoteModal(true);
                    }
                }
            }
        } catch (e) {
            // Não é JSON, ignora
        }
    }

    // ========================================
    // FUNÇÕES DE ANOTAÇÕES
    // ========================================

    /**
     * Adiciona um destaque (highlight) ao texto selecionado
     */
    async function handleAddHighlight(data: any) {
        const newAnnotation = await annotationService.addAnnotation(document.id, {
            type: 'highlight',
            page: data.page || 1,
            x: data.x || 0,
            y: data.y || 0,
            width: data.width,
            height: data.height,
            text: data.text,
            color: '#fef08a', // Amarelo
        });

        if (newAnnotation) {
            setAnnotations([...annotations, newAnnotation]);
            Alert.alert('Destaque adicionado!');
        }
        setAnnotationMode('none');
    }

    /**
     * Adiciona ou atualiza uma nota
     */
    async function handleAddNote() {
        if (!noteText.trim()) {
            Alert.alert('Erro', 'Digite uma nota.');
            return;
        }

        if (selectedAnnotation) {
            // Atualiza nota existente
            await annotationService.updateAnnotation(document.id, selectedAnnotation.id, {
                content: noteText,
            });
            setAnnotations(annotations.map(a =>
                a.id === selectedAnnotation.id ? { ...a, content: noteText } : a
            ));
        } else {
            // Cria nova nota no centro da página
            const newAnnotation = await annotationService.addAnnotation(document.id, {
                type: 'note',
                page: 1,
                x: 50, // Centro horizontal
                y: 50, // Centro vertical
                color: '#fbbf24', // Âmbar
                content: noteText,
            });

            if (newAnnotation) {
                setAnnotations([...annotations, newAnnotation]);
            }
        }

        // Limpa e fecha modal
        setShowNoteModal(false);
        setNoteText('');
        setSelectedAnnotation(null);
        setAnnotationMode('none');
    }

    /**
     * Exclui anotação selecionada
     */
    async function handleDeleteAnnotation() {
        if (selectedAnnotation) {
            await annotationService.removeAnnotation(document.id, selectedAnnotation.id);
            setAnnotations(annotations.filter(a => a.id !== selectedAnnotation.id));
            setShowNoteModal(false);
            setSelectedAnnotation(null);
        }
    }

    // ========================================
    // FUNÇÃO DE RENDERIZAÇÃO DE CONTEÚDO
    // ========================================

    /**
     * Renderiza o conteúdo do documento baseado no tipo
     * Suporta: HTML, PDF, Imagem, DOCX
     */
    function renderDocumentContent() {
        // Estado: Erro
        if (error) {
            return (
                <View className="flex-1 items-center justify-center px-6">
                    <Text className="text-5xl mb-4">❌</Text>
                    <Text className="text-gray-700 text-lg text-center mb-4">{error}</Text>
                    <TouchableOpacity
                        className="bg-primary-600 px-6 py-3 rounded-xl"
                        onPress={() => setError(null)}
                    >
                        <Text className="text-white font-medium">Tentar novamente</Text>
                    </TouchableOpacity>
                </View>
            );
        }

        switch (document.type) {
            // ====================================
            // TIPO: HTML
            // ====================================
            case 'html':
                return (
                    <WebView
                        ref={webViewRef}
                        source={{ html: SAMPLE_HTML_CONTENT }}
                        style={{ flex: 1 }}
                        onLoadEnd={() => setIsLoading(false)}
                        onMessage={handleWebViewMessage}
                        startInLoadingState
                        renderLoading={() => (
                            <View className="flex-1 items-center justify-center absolute inset-0 bg-white">
                                <ActivityIndicator size="large" color="#4f46e5" />
                            </View>
                        )}
                    />
                );

            // ====================================
            // TIPO: PDF
            // ====================================
            case 'pdf':
                if (!pdfBase64) {
                    return (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#4f46e5" />
                            <Text className="text-gray-500 mt-3">Carregando PDF...</Text>
                        </View>
                    );
                }

                // Converte anotações para JSON
                const annotationsJson = JSON.stringify(annotations);

                // HTML com PDF.js embutido para renderização
                const pdfHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                background: #f5f5f5; 
                                display: flex; 
                                flex-direction: column; 
                                align-items: center;
                                padding: 8px;
                            }
                            #pdf-container {
                                display: flex;
                                flex-direction: column;
                                align-items: center;
                                gap: 16px;
                                width: 100%;
                                position: relative;
                            }
                            .page-wrapper {
                                position: relative;
                            }
                            canvas {
                                background: white;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.15);
                                max-width: 100%;
                                height: auto;
                            }
                            .page-info {
                                background: #4f46e5;
                                color: white;
                                padding: 8px 16px;
                                border-radius: 20px;
                                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                                font-size: 14px;
                                position: sticky;
                                top: 8px;
                                z-index: 10;
                            }
                            .loading {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 100vh;
                                font-family: -apple-system, BlinkMacSystemFont, sans-serif;
                                color: #666;
                            }
                            .error {
                                color: #dc2626;
                                padding: 20px;
                                text-align: center;
                            }
                            .search-highlight {
                                background-color: #fef08a !important;
                            }
                            .annotation-highlight {
                                position: absolute;
                                background-color: rgba(254, 240, 138, 0.5);
                                pointer-events: none;
                            }
                            .annotation-note {
                                position: absolute;
                                width: 24px;
                                height: 24px;
                                background: #fbbf24;
                                border-radius: 50%;
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                font-size: 14px;
                                cursor: pointer;
                                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                            }
                            .text-layer {
                                position: absolute;
                                left: 0;
                                top: 0;
                                right: 0;
                                bottom: 0;
                                overflow: hidden;
                                opacity: 0.2;
                                line-height: 1.0;
                            }
                            .text-layer > span {
                                color: transparent;
                                position: absolute;
                                white-space: pre;
                                pointer-events: all;
                            }
                            .text-layer ::selection {
                                background: #fef08a;
                            }
                        </style>
                    </head>
                    <body>
                        <div id="pdf-container">
                            <div class="loading" id="loading">Renderizando PDF...</div>
                        </div>
                        <script>
                            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
                            
                            const base64Data = '${pdfBase64}';
                            const pdfData = atob(base64Data);
                            const savedAnnotations = ${annotationsJson};
                            let currentSearchQuery = '';
                            
                            // Renderiza todas as páginas do PDF
                            async function renderPDF() {
                                try {
                                    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                                    const pdf = await loadingTask.promise;
                                    const container = document.getElementById('pdf-container');
                                    document.getElementById('loading').remove();
                                    
                                    // Adiciona informação de páginas
                                    const pageInfo = document.createElement('div');
                                    pageInfo.className = 'page-info';
                                    pageInfo.textContent = 'Total: ' + pdf.numPages + ' página(s)';
                                    container.insertBefore(pageInfo, container.firstChild);
                                    
                                    // Renderiza cada página
                                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                                        const page = await pdf.getPage(pageNum);
                                        const scale = 1.5;
                                        const viewport = page.getViewport({ scale });
                                        
                                        // Cria wrapper da página
                                        const wrapper = document.createElement('div');
                                        wrapper.className = 'page-wrapper';
                                        wrapper.style.width = viewport.width + 'px';
                                        wrapper.style.height = viewport.height + 'px';
                                        wrapper.dataset.page = pageNum;
                                        
                                        // Cria canvas para renderização
                                        const canvas = document.createElement('canvas');
                                        const context = canvas.getContext('2d');
                                        canvas.height = viewport.height;
                                        canvas.width = viewport.width;
                                        
                                        wrapper.appendChild(canvas);
                                        container.appendChild(wrapper);
                                        
                                        // Renderiza a página no canvas
                                        await page.render({
                                            canvasContext: context,
                                            viewport: viewport
                                        }).promise;
                                        
                                        // Renderiza camada de texto para seleção
                                        const textContent = await page.getTextContent();
                                        const textLayer = document.createElement('div');
                                        textLayer.className = 'text-layer';
                                        wrapper.appendChild(textLayer);
                                        
                                        // Renderiza anotações da página
                                        renderPageAnnotations(wrapper, pageNum);
                                    }
                                    
                                    // Configura listener de seleção de texto
                                    document.addEventListener('mouseup', handleTextSelection);
                                    document.addEventListener('touchend', handleTextSelection);
                                    
                                } catch (error) {
                                    console.error('Erro ao renderizar PDF:', error);
                                    document.getElementById('pdf-container').innerHTML = 
                                        '<div class="error">Erro ao renderizar o PDF: ' + error.message + '</div>';
                                }
                            }
                            
                            // Renderiza anotações de uma página
                            function renderPageAnnotations(wrapper, pageNum) {
                                const pageAnnotations = savedAnnotations.filter(a => a.page === pageNum);
                                pageAnnotations.forEach(ann => {
                                    if (ann.type === 'highlight' && ann.width && ann.height) {
                                        // Destaque
                                        const highlight = document.createElement('div');
                                        highlight.className = 'annotation-highlight';
                                        highlight.style.left = ann.x + '%';
                                        highlight.style.top = ann.y + '%';
                                        highlight.style.width = ann.width + '%';
                                        highlight.style.height = ann.height + '%';
                                        wrapper.appendChild(highlight);
                                    } else if (ann.type === 'note') {
                                        // Nota
                                        const note = document.createElement('div');
                                        note.className = 'annotation-note';
                                        note.style.left = ann.x + '%';
                                        note.style.top = ann.y + '%';
                                        note.textContent = '📝';
                                        note.onclick = () => {
                                            window.ReactNativeWebView.postMessage(JSON.stringify({
                                                type: 'annotationClick',
                                                id: ann.id
                                            }));
                                        };
                                        wrapper.appendChild(note);
                                    }
                                });
                            }
                            
                            // Handler de seleção de texto
                            function handleTextSelection() {
                                const selection = window.getSelection();
                                if (selection && selection.toString().trim()) {
                                    const text = selection.toString();
                                    const range = selection.getRangeAt(0);
                                    const rect = range.getBoundingClientRect();
                                    const wrapper = document.querySelector('.page-wrapper');
                                    if (wrapper) {
                                        const wrapperRect = wrapper.getBoundingClientRect();
                                        window.ReactNativeWebView.postMessage(JSON.stringify({
                                            type: 'textSelected',
                                            text: text,
                                            x: ((rect.left - wrapperRect.left) / wrapperRect.width) * 100,
                                            y: ((rect.top - wrapperRect.top) / wrapperRect.height) * 100,
                                            width: (rect.width / wrapperRect.width) * 100,
                                            height: (rect.height / wrapperRect.height) * 100,
                                            page: parseInt(wrapper.dataset.page) || 1
                                        }));
                                    }
                                }
                            }
                            
                            // Função de busca no PDF
                            window.searchPDF = function(query) {
                                currentSearchQuery = query;
                                window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: 'searchResult',
                                    count: 0
                                }));
                            };
                            
                            renderPDF();
                        </script>
                    </body>
                    </html>
                `;

                return (
                    <WebView
                        ref={webViewRef}
                        source={{ html: pdfHtml }}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowFileAccess={true}
                        scalesPageToFit={true}
                        onMessage={handleWebViewMessage}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('Erro no WebView: ', nativeEvent);
                            setError('Erro ao carregar o visualizador de PDF.');
                        }}
                    />
                );

            // ====================================
            // TIPO: IMAGEM
            // ====================================
            case 'image':
                return (
                    <ScrollView
                        className="flex-1 bg-gray-100"
                        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 16 }}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                    >
                        <View className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <Image
                                source={require('../../assets/documents/boletim_escolar.png')}
                                style={{
                                    width: width - 48,
                                    height: height * 0.65,
                                }}
                                resizeMode="contain"
                                onLoadEnd={() => setIsLoading(false)}
                            />
                        </View>
                        <Text className="text-gray-500 text-sm mt-4 text-center">
                            Pinça para ampliar a imagem
                        </Text>
                    </ScrollView>
                );

            // ====================================
            // TIPO: DOCX
            // ====================================
            case 'docx':
                if (!docxBase64) {
                    return (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#4f46e5" />
                            <Text className="text-gray-500 mt-3">Carregando documento...</Text>
                        </View>
                    );
                }

                // HTML com mammoth.js embutido para renderização de DOCX
                const docxHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=3.0, user-scalable=yes">
                        <script src="https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js"></script>
                        <style>
                            * { margin: 0; padding: 0; box-sizing: border-box; }
                            body { 
                                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                                background: #f5f5f5; 
                                padding: 16px;
                                line-height: 1.6;
                            }
                            #document-container {
                                background: white;
                                padding: 24px;
                                border-radius: 12px;
                                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                            }
                            #document-container h1 {
                                color: #1f2937;
                                font-size: 24px;
                                margin-bottom: 16px;
                                border-bottom: 2px solid #4f46e5;
                                padding-bottom: 8px;
                            }
                            #document-container h2 {
                                color: #374151;
                                font-size: 20px;
                                margin: 20px 0 12px 0;
                            }
                            #document-container p {
                                color: #4b5563;
                                margin-bottom: 12px;
                            }
                            #document-container table {
                                width: 100%;
                                border-collapse: collapse;
                                margin: 16px 0;
                            }
                            #document-container th, #document-container td {
                                border: 1px solid #e5e7eb;
                                padding: 12px;
                                text-align: left;
                            }
                            #document-container th {
                                background: #f3f4f6;
                                font-weight: 600;
                            }
                            #document-container ul, #document-container ol {
                                margin: 12px 0;
                                padding-left: 24px;
                            }
                            #document-container li {
                                margin-bottom: 6px;
                                color: #4b5563;
                            }
                            .loading {
                                display: flex;
                                align-items: center;
                                justify-content: center;
                                height: 200px;
                                color: #666;
                            }
                            .error {
                                color: #dc2626;
                                padding: 20px;
                                text-align: center;
                                background: #fef2f2;
                                border-radius: 8px;
                            }
                            .doc-header {
                                background: #4f46e5;
                                color: white;
                                padding: 12px 16px;
                                border-radius: 8px;
                                margin-bottom: 16px;
                                font-size: 14px;
                            }
                            .search-highlight {
                                background-color: #fef08a;
                                padding: 2px;
                            }
                        </style>
                    </head>
                    <body>
                        <div class="doc-header">📄 Documento Word Renderizado</div>
                        <div id="document-container">
                            <div class="loading" id="loading">Renderizando documento...</div>
                        </div>
                        <script>
                            const base64Data = '${docxBase64}';
                            
                            // Converte base64 para ArrayBuffer
                            function base64ToArrayBuffer(base64) {
                                const binaryString = atob(base64);
                                const bytes = new Uint8Array(binaryString.length);
                                for (let i = 0; i < binaryString.length; i++) {
                                    bytes[i] = binaryString.charCodeAt(i);
                                }
                                return bytes.buffer;
                            }
                            
                            // Renderiza o DOCX usando mammoth.js
                            async function renderDOCX() {
                                try {
                                    const arrayBuffer = base64ToArrayBuffer(base64Data);
                                    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                                    const container = document.getElementById('document-container');
                                    container.innerHTML = result.value;
                                    
                                    if (result.messages.length > 0) {
                                        console.log('Mensagens do Mammoth:', result.messages);
                                    }
                                } catch (error) {
                                    console.error('Erro ao renderizar DOCX:', error);
                                    document.getElementById('document-container').innerHTML = 
                                        '<div class="error">Erro ao renderizar o documento: ' + error.message + '</div>';
                                }
                            }
                            
                            renderDOCX();
                        </script>
                    </body>
                    </html>
                `;

                return (
                    <WebView
                        ref={webViewRef}
                        source={{ html: docxHtml }}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowFileAccess={true}
                        scalesPageToFit={true}
                        onMessage={handleWebViewMessage}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('Erro no WebView: ', nativeEvent);
                            setError('Erro ao carregar o visualizador de documento.');
                        }}
                    />
                );

            // ====================================
            // TIPO: NÃO SUPORTADO
            // ====================================
            default:
                return (
                    <View className="flex-1 items-center justify-center px-6">
                        <Text className="text-5xl mb-4">📄</Text>
                        <Text className="text-gray-500 text-center">
                            Formato não suportado para visualização inline
                        </Text>
                    </View>
                );
        }
    }

    // ========================================
    // RENDER PRINCIPAL
    // ========================================

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* ======================================== */}
            {/* HEADER */}
            {/* ======================================== */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                {/* Botão Voltar */}
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 -ml-2"
                >
                    <Text className="text-2xl">←</Text>
                </TouchableOpacity>

                {/* Informações do documento */}
                <View className="flex-1 ml-2">
                    <Text className="text-gray-800 font-semibold text-lg" numberOfLines={1}>
                        {document.title}
                    </Text>
                    <View className="flex-row items-center">
                        <Text className="text-gray-500 text-sm">
                            {DOCUMENT_TYPE_ICONS[document.type]} {document.type.toUpperCase()} • {document.size}
                        </Text>
                        {/* Indicador offline */}
                        {isOffline && (
                            <Text className="text-green-600 text-sm ml-2">✓ Offline</Text>
                        )}
                    </View>
                </View>

                {/* ------------------------------------ */}
                {/* BOTÕES DE AÇÃO */}
                {/* ------------------------------------ */}
                <View className="flex-row items-center">
                    {/* Botão: Busca */}
                    <TouchableOpacity
                        onPress={() => setShowSearch(!showSearch)}
                        className="p-2 mr-1"
                    >
                        <Text className="text-xl">🔍</Text>
                    </TouchableOpacity>

                    {/* Botão: Offline */}
                    <TouchableOpacity
                        onPress={isOffline ? handleRemoveOffline : handleSaveOffline}
                        disabled={isSavingOffline}
                        className="p-2 mr-1"
                    >
                        {isSavingOffline ? (
                            <ActivityIndicator size="small" color="#4f46e5" />
                        ) : (
                            <Text className="text-xl">{isOffline ? '☁️' : '📥'}</Text>
                        )}
                    </TouchableOpacity>

                    {/* Botões de anotação (apenas para PDF) */}
                    {document.type === 'pdf' && (
                        <>
                            {/* Botão: Destaque */}
                            <TouchableOpacity
                                onPress={() => setAnnotationMode(annotationMode === 'highlight' ? 'none' : 'highlight')}
                                className={`p-2 mr-1 rounded ${annotationMode === 'highlight' ? 'bg-yellow-200' : ''}`}
                            >
                                <Text className="text-xl">🖍️</Text>
                            </TouchableOpacity>

                            {/* Botão: Nota */}
                            <TouchableOpacity
                                onPress={() => {
                                    setAnnotationMode('note');
                                    setSelectedAnnotation(null);
                                    setNoteText('');
                                    setShowNoteModal(true);
                                }}
                                className="p-2"
                            >
                                <Text className="text-xl">📝</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>
            </View>

            {/* ======================================== */}
            {/* BARRA DE BUSCA */}
            {/* ======================================== */}
            {showSearch && (
                <View className="flex-row items-center px-4 py-2 bg-gray-50 border-b border-gray-100">
                    <TextInput
                        className="flex-1 bg-white rounded-lg px-3 py-2 mr-2 border border-gray-200"
                        placeholder="Buscar no documento..."
                        placeholderTextColor="#9ca3af"
                        value={searchQuery}
                        onChangeText={setSearchQuery}
                        onSubmitEditing={handleSearch}
                        returnKeyType="search"
                    />
                    <TouchableOpacity
                        onPress={handleSearch}
                        className="bg-primary-600 px-4 py-2 rounded-lg"
                    >
                        <Text className="text-white font-medium">Buscar</Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ======================================== */}
            {/* NAVEGAÇÃO DE RESULTADOS DE BUSCA */}
            {/* ======================================== */}
            {showSearch && searchResults > 0 && (
                <View className="flex-row items-center justify-between px-4 py-2 bg-yellow-50">
                    <Text className="text-gray-700">
                        {currentSearchIndex + 1} de {searchResults} resultados
                    </Text>
                    <View className="flex-row">
                        <TouchableOpacity
                            onPress={() => navigateSearch('prev')}
                            className="px-3 py-1 mr-2 bg-gray-200 rounded"
                        >
                            <Text>◀</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => navigateSearch('next')}
                            className="px-3 py-1 bg-gray-200 rounded"
                        >
                            <Text>▶</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ======================================== */}
            {/* INDICADOR DE MODO DE ANOTAÇÃO */}
            {/* ======================================== */}
            {annotationMode !== 'none' && (
                <View className="px-4 py-2 bg-yellow-100">
                    <Text className="text-yellow-800 text-center">
                        {annotationMode === 'highlight'
                            ? '🖍️ Selecione o texto para destacar'
                            : '📝 Modo de anotação ativo'}
                    </Text>
                </View>
            )}

            {/* ======================================== */}
            {/* CONTEÚDO DO DOCUMENTO */}
            {/* ======================================== */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4f46e5" />
                    <Text className="text-gray-500 mt-3">Carregando documento...</Text>
                </View>
            ) : (
                renderDocumentContent()
            )}

            {/* ======================================== */}
            {/* MODAL DE NOTA */}
            {/* ======================================== */}
            <Modal
                visible={showNoteModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowNoteModal(false)}
            >
                <View className="flex-1 bg-black/50 justify-center items-center px-4">
                    <View className="bg-white rounded-2xl p-6 w-full max-w-md">
                        <Text className="text-xl font-bold text-gray-800 mb-4">
                            {selectedAnnotation ? 'Editar Nota' : 'Nova Nota'}
                        </Text>

                        {/* Campo de texto da nota */}
                        <TextInput
                            className="bg-gray-100 rounded-xl px-4 py-3 text-gray-800 min-h-[100px]"
                            placeholder="Digite sua nota..."
                            placeholderTextColor="#9ca3af"
                            value={noteText}
                            onChangeText={setNoteText}
                            multiline
                            textAlignVertical="top"
                        />

                        {/* Botões de ação */}
                        <View className="flex-row justify-end mt-4">
                            {/* Botão Excluir (apenas para edição) */}
                            {selectedAnnotation && (
                                <TouchableOpacity
                                    onPress={handleDeleteAnnotation}
                                    className="px-4 py-2 mr-auto"
                                >
                                    <Text className="text-red-600 font-medium">Excluir</Text>
                                </TouchableOpacity>
                            )}

                            {/* Botão Cancelar */}
                            <TouchableOpacity
                                onPress={() => {
                                    setShowNoteModal(false);
                                    setNoteText('');
                                    setSelectedAnnotation(null);
                                }}
                                className="px-4 py-2 mr-2"
                            >
                                <Text className="text-gray-600 font-medium">Cancelar</Text>
                            </TouchableOpacity>

                            {/* Botão Salvar */}
                            <TouchableOpacity
                                onPress={handleAddNote}
                                className="bg-primary-600 px-6 py-2 rounded-lg"
                            >
                                <Text className="text-white font-medium">Salvar</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
