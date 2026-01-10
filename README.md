# Proesc - Portal do Aluno 📚

Um aplicativo React Native para visualização e envio de documentos escolares.

## 🚀 Como Rodar o Projeto

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Expo CLI (`npm install -g expo-cli`)
- Expo Go no celular (iOS/Android)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/desafio-mobile-proesc.git
cd desafio-mobile-proesc

# Instale as dependências
npm install

# Inicie o projeto
npx expo start
```

### Executando

1. Escaneie o QR code com o app **Expo Go** (Android) ou **Câmera** (iOS)
2. Ou pressione `i` para iOS Simulator / `a` para Android Emulator

## 🔐 Credenciais de Teste

| Campo     | Valor      |
|-----------|------------|
| Matrícula | `123456`   |
| Senha     | `aluno123` |

## 📱 Funcionalidades

### ✅ Autenticação
- Login com matrícula + senha
- Validação de campos
- Persistência de sessão
- Logout funcional

### ✅ Visualização de Documentos
- Lista de documentos por categoria
- Filtros: Histórico, Boletins, Declarações, Comunicados
- Suporte a formatos: PDF, DOCX, HTML, Imagens
- Visualização inline no app
- Pull-to-refresh

### ✅ Upload de Documentos
- Captura por câmera
- Seleção da galeria
- Seleção de arquivos
- Categorização (Atestado, Justificativa, etc.)
- Status de envio (Enviado → Em Análise → Aprovado)

## 🛠 Stack Técnica

- **React Native** + **Expo**
- **TypeScript**
- **NativeWind** (TailwindCSS)
- **React Navigation**
- **AsyncStorage** (persistência)
- **Expo Image/Document Picker**
- **Bottom Sheet** (@gorhom/bottom-sheet)

## 📁 Estrutura do Projeto

```
src/
├── components/
│   ├── DocumentCard.tsx
│   └── UploadBottomSheet.tsx
├── contexts/
│   └── AuthContext.tsx
├── navigation/
│   └── AppNavigator.tsx
├── screens/
│   ├── LoginScreen.tsx
│   ├── HomeScreen.tsx
│   └── DocumentViewerScreen.tsx
├── services/
│   └── api.ts (mock)
├── types/
│   └── index.ts
└── constants/
    └── index.ts
```

## 📸 Screenshots

[Em desenvolvimento - adicione screenshots aqui]

## 🔄 Fluxos Principais

### Visualização
```
Login → Lista de Documentos → Filtrar categoria → Abrir documento → Visualizar
```

### Upload
```
FAB (+) → Bottom Sheet → Selecionar categoria → Escolher arquivo → Enviar
```

## 📝 Notas de Implementação

- **Mock API**: Todas as requisições são simuladas localmente
- **Documentos de exemplo**: Incluídos em `assets/documents/`
- **Status automático**: Documentos enviados mudam para "Em Análise" após 5s

## 👨‍💻 Autor

Desenvolvido para o Desafio Técnico Proesc.
