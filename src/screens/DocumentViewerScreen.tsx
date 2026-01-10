import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    Dimensions,
    ScrollView,
    Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import * as FileSystem from 'expo-file-system/legacy';
import { Asset } from 'expo-asset';
import { RootStackParamList, Document } from '../types';
import { DOCUMENT_TYPE_ICONS } from '../constants';
import { DOCX_BASE64 } from '../data/docxData';

type DocumentViewerScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'DocumentViewer'>;
    route: RouteProp<RootStackParamList, 'DocumentViewer'>;
};

// Sample HTML content for demonstration
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

export function DocumentViewerScreen({ navigation, route }: DocumentViewerScreenProps) {
    const { document } = route.params;
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pdfBase64, setPdfBase64] = useState<string | null>(null);
    const [docxBase64, setDocxBase64] = useState<string | null>(null);

    const { width, height } = Dimensions.get('window');

    useEffect(() => {
        async function loadDocument() {
            if (document.type === 'pdf') {
                try {
                    // Load the PDF asset
                    const asset = Asset.fromModule(require('../../assets/documents/declaracao_matricula.pdf'));
                    await asset.downloadAsync();

                    if (asset.localUri) {
                        // Read the file as base64
                        const base64 = await FileSystem.readAsStringAsync(asset.localUri, {
                            encoding: 'base64',
                        });
                        setPdfBase64(base64);
                    }
                    setIsLoading(false);
                } catch (err) {
                    console.error('Error loading PDF:', err);
                    setError('Não foi possível carregar o documento PDF.');
                    setIsLoading(false);
                }
            } else if (document.type === 'docx') {
                try {
                    // Use pre-encoded base64 data for DOCX file
                    // Metro bundler cannot resolve DOCX files with require()
                    setDocxBase64(DOCX_BASE64);
                    setIsLoading(false);
                } catch (err) {
                    console.error('Error loading DOCX:', err);
                    setError('Não foi possível carregar o documento DOCX.');
                    setIsLoading(false);
                }
            } else {
                // Simulate loading for other document types
                const timer = setTimeout(() => {
                    setIsLoading(false);
                }, 500);
                return () => clearTimeout(timer);
            }
        }
        loadDocument();
    }, [document]);

    function renderDocumentContent() {
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
            case 'html':
                return (
                    <WebView
                        source={{ html: SAMPLE_HTML_CONTENT }}
                        style={{ flex: 1 }}
                        onLoadEnd={() => setIsLoading(false)}
                        startInLoadingState
                        renderLoading={() => (
                            <View className="flex-1 items-center justify-center absolute inset-0 bg-white">
                                <ActivityIndicator size="large" color="#4f46e5" />
                            </View>
                        )}
                    />
                );

            case 'pdf':
                if (!pdfBase64) {
                    return (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#4f46e5" />
                            <Text className="text-gray-500 mt-3">Carregando PDF...</Text>
                        </View>
                    );
                }

                // HTML with embedded PDF.js to render the PDF
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
                            
                            async function renderPDF() {
                                try {
                                    const loadingTask = pdfjsLib.getDocument({ data: pdfData });
                                    const pdf = await loadingTask.promise;
                                    const container = document.getElementById('pdf-container');
                                    document.getElementById('loading').remove();
                                    
                                    const pageInfo = document.createElement('div');
                                    pageInfo.className = 'page-info';
                                    pageInfo.textContent = 'Total: ' + pdf.numPages + ' página(s)';
                                    container.insertBefore(pageInfo, container.firstChild);
                                    
                                    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
                                        const page = await pdf.getPage(pageNum);
                                        const scale = 1.5;
                                        const viewport = page.getViewport({ scale });
                                        
                                        const canvas = document.createElement('canvas');
                                        const context = canvas.getContext('2d');
                                        canvas.height = viewport.height;
                                        canvas.width = viewport.width;
                                        canvas.style.width = '100%';
                                        canvas.style.height = 'auto';
                                        
                                        container.appendChild(canvas);
                                        
                                        await page.render({
                                            canvasContext: context,
                                            viewport: viewport
                                        }).promise;
                                    }
                                } catch (error) {
                                    console.error('Error rendering PDF:', error);
                                    document.getElementById('pdf-container').innerHTML = 
                                        '<div class="error">Erro ao renderizar o PDF: ' + error.message + '</div>';
                                }
                            }
                            
                            renderPDF();
                        </script>
                    </body>
                    </html>
                `;

                return (
                    <WebView
                        source={{ html: pdfHtml }}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowFileAccess={true}
                        scalesPageToFit={true}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('WebView error: ', nativeEvent);
                            setError('Erro ao carregar o visualizador de PDF.');
                        }}
                    />
                );

            case 'image':
                // Use the bundled image from assets
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

            case 'docx':
                if (!docxBase64) {
                    return (
                        <View className="flex-1 items-center justify-center">
                            <ActivityIndicator size="large" color="#4f46e5" />
                            <Text className="text-gray-500 mt-3">Carregando documento...</Text>
                        </View>
                    );
                }

                // HTML with embedded mammoth.js to render the DOCX
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
                        </style>
                    </head>
                    <body>
                        <div class="doc-header">📄 Documento Word Renderizado</div>
                        <div id="document-container">
                            <div class="loading" id="loading">Renderizando documento...</div>
                        </div>
                        <script>
                            const base64Data = '${docxBase64}';
                            
                            // Convert base64 to ArrayBuffer
                            function base64ToArrayBuffer(base64) {
                                const binaryString = atob(base64);
                                const bytes = new Uint8Array(binaryString.length);
                                for (let i = 0; i < binaryString.length; i++) {
                                    bytes[i] = binaryString.charCodeAt(i);
                                }
                                return bytes.buffer;
                            }
                            
                            async function renderDOCX() {
                                try {
                                    const arrayBuffer = base64ToArrayBuffer(base64Data);
                                    const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
                                    const container = document.getElementById('document-container');
                                    container.innerHTML = result.value;
                                    
                                    if (result.messages.length > 0) {
                                        console.log('Mammoth messages:', result.messages);
                                    }
                                } catch (error) {
                                    console.error('Error rendering DOCX:', error);
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
                        source={{ html: docxHtml }}
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowFileAccess={true}
                        scalesPageToFit={true}
                        onError={(syntheticEvent) => {
                            const { nativeEvent } = syntheticEvent;
                            console.warn('WebView error: ', nativeEvent);
                            setError('Erro ao carregar o visualizador de documento.');
                        }}
                    />
                );

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

    return (
        <SafeAreaView className="flex-1 bg-white" edges={['top']}>
            {/* Header */}
            <View className="flex-row items-center px-4 py-3 border-b border-gray-100">
                <TouchableOpacity
                    onPress={() => navigation.goBack()}
                    className="p-2 -ml-2"
                >
                    <Text className="text-2xl">←</Text>
                </TouchableOpacity>
                <View className="flex-1 ml-2">
                    <Text className="text-gray-800 font-semibold text-lg" numberOfLines={1}>
                        {document.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                        {DOCUMENT_TYPE_ICONS[document.type]} {document.type.toUpperCase()} • {document.size}
                    </Text>
                </View>
            </View>

            {/* Content */}
            {isLoading ? (
                <View className="flex-1 items-center justify-center">
                    <ActivityIndicator size="large" color="#4f46e5" />
                    <Text className="text-gray-500 mt-3">Carregando documento...</Text>
                </View>
            ) : (
                renderDocumentContent()
            )}
        </SafeAreaView>
    );
}
