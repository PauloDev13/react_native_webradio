import TrackPlayer from 'react-native-track-player';

import { registerRootComponent } from 'expo';

import App from './App';

// Registra o serviço de background do Track Player
// IMPORTANTE: usar require() para que o bundler do Expo inclua o arquivo no build
TrackPlayer.registerPlaybackService(
  () => require('./src/services/playbackService').playbackService
);

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);
