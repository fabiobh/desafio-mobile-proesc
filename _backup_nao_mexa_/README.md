# Desafio Técnico Proesc: Portal de Documentos do Aluno

## **Descrição do Projeto**
Desenvolva um app onde o aluno/responsável faz login, visualiza documentos escolares e pode enviar novos documentos para a escola. O foco é na **visualização de diferentes formatos** (PDF, DOCX, HTML) e **upload de documentos**.

Faça download dos arquivos presentes na pasta `assets` para usar como exemplo de documentos.

Em relação a APIs, na pasta `assets/mock` você encontrará um mock de API que pode ser usado para simular as requisições, através de um arquivo JSON. Você pode usar esse mock para desenvolver o app, mas é importante que o app funcione como se estivesse consumindo uma API real.

## **Requisitos Funcionais**

### **Autenticação (Obrigatório)**
- Login com **matrícula + senha**
- Validação simples de campos
- Logout funcional
- Persistir sessão

### **Visualização de Documentos do Aluno (Obrigatório)**
- **Lista de documentos** disponíveis do aluno
- **Categorias**: Histórico, Boletins, Declarações, Comunicados
- **Diferentes formatos**: PDF, DOCX, HTML, Imagens
- **Visualização inline** dentro do app
- Pull-to-refresh para atualizar lista

Implementar renderização para diferentes formatos de documento.

### **Upload de Novos Documentos (Obrigatório)**
- **Adicionar documentos** para envio à escola
- **Captura por câmera** ou **seleção da galeria**
- **Seleção de arquivos** do dispositivo
- **Categorização** do documento (atestado, justificativa, etc.)
- **Status de envio** (enviado, em análise, aprovado)

### **Interface**
- Bottom sheet para visualizar/enviar documentos
- Navegação stack simples
- Estados de loading e erro

## **Requisitos Técnicos**

### **Stack**
- **React Native** + **Expo**
- **TypeScript**
- **NativeWind**
- **React Navigation**

Mas fique a vontade para usar outras bibliotecas ou ferramentas que achar necessárias!

## **Estrutura de Dados**

### **Documentos disponíveis para o Aluno**
```typescript
interface Document {
  id: string;
  title: string;
  type: 'pdf' | 'docx' | 'html' | 'image';
  category: 'historico' | 'boletim' | 'declaracao' | 'comunicado';
  url: string;
  date: string;
  size: string;
}
```

### **Documentos Enviados pelo Aluno**
```typescript
interface UploadedDocument {
  id: string;
  title: string;
  category: 'atestado' | 'justificativa' | 'requerimento';
  status: 'enviado' | 'em_analise' | 'aprovado' | 'rejeitado';
  uploadDate: string;
  file: File;
}
```

# 📄 Mock 

### **Estrutura de Endpoints Simulados**

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Login do usuário |
| `/api/student/documents` | GET | Documentos disponíveis |
| `/api/student/documents/uploaded` | GET | Documentos enviados |
| `/api/student/documents/upload` | POST | Upload novo documento |
| `/api/student/documents/{id}/status` | PUT | Atualizar status |

## **Fluxos Principais**

### **1. Visualização de Documentos**
- Login → Lista de documentos → Clique no documento → Visualização no formato correto

### **2. Upload de Documentos**
- Bottom sheet "Adicionar documento"
- Escolher categoria
- Selecionar fonte: câmera, galeria ou arquivos
- Upload com feedback visual
- Atualização do status em tempo real

## **Tempo de Entrega**
**4-5 dias**

## **Entregáveis**
**Repositório GitHub** com:
1. **Código fonte completo**
2. **README.md** explicando:
   - **Como rodar o projeto**
   - **Como testar as funcionalidades**
   - **Credenciais de teste** (ex: matrícula: 123456, senha: aluno123)
   - **Screenshots** ou **vídeos** demonstrando o funcionamento (opcional)
   - **Link para o app** (se possível, usando Expo Go) (opcional)

## **Extras que Impressionam**
Os seguintes recursos são opcionais, mas podem impressionar:
- **Modo Offline** de documentos baixados
- **Pesquisa** dentro dos documentos
- **Annotations** simples em PDFs
- **Compressão** de imagens no upload
- **Visualização Fallback** para formatos não suportados


Se tiver dúvidas, sinta-se à vontade para perguntar no email `murilo.alvez@proesc.com`
