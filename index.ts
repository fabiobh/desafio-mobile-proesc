/**
 * Ponto de entrada do aplicativo React Native/Expo
 * Este arquivo registra o componente raiz da aplicação
 */

// Importa a função de registro do Expo
import { registerRootComponent } from 'expo';

// Importa o componente principal do aplicativo
import App from './App';

/**
 * registerRootComponent chama AppRegistry.registerComponent('main', () => App);
 * Também garante que, seja carregando no Expo Go ou em uma build nativa,
 * o ambiente seja configurado apropriadamente
 */
registerRootComponent(App);
