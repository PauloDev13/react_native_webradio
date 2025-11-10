import TrackPlayer, { Event, State } from 'react-native-track-player';

import * as SplashScreen from 'expo-splash-screen';
import { create } from 'zustand';

type StoreModal = {
  visible: boolean;
  message?: string;
  hiddenSplash: boolean;
  statePlayer?: State;
  setModal: (visible: boolean, message?: string, statePlayer?: State) => void;
};

export const useStoreTestModal = create<StoreModal>((set, get) => {
  console.log('STORE DISPLAY MODAL');

  TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
    const { hiddenSplash: _currentHiddenState } = get();

    // quando o estado do player é buffering,
    // esconde a tela de Splashscreen
    if (state === State.Buffering && !_currentHiddenState) {
      await SplashScreen.hideAsync().then(() => {
        console.log('FECHOU A SPLASH NO THEN');
      });
      set({ hiddenSplash: true });
    }

    if (state === State.Ended) {
      // se o evento do estado é Ended (o player está em execução
      // com o stream online e ele fica offline
      console.warn('ERRO ENDED');
      // atribui o estado ao setStatePlayer
      set({
        visible: true,
        message: 'Conexão perdida...',
        statePlayer: State.Ended,
      });
    }
    // se o evento do estado é Error (stream já está
    // offline quando o player é aberto)
    else if (state === State.Error) {
      console.warn('ERRO ERROR');
      set({
        visible: true,
        message: 'Conexão perdida...',
        statePlayer: State.Error,
      });
    } else {
      set({ visible: false });
    }
  });

  return {
    message: '',
    visible: false,
    hiddenSplash: false,
    statePlayer: State.None,

    setModal: (visible: boolean, message?: string, statePlayer?: State) => {
      set({ visible, message, statePlayer });
    },
  };
});
