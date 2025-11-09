import TrackPlayer, { Event, State } from 'react-native-track-player';

import { create } from 'zustand';

type StoreModal = {
  visible: boolean;
  message?: string;
  statePlayer?: State;
  setModal: (visible: boolean, message?: string, statePlayer?: State) => void;
};

export const useStoreTestModal = create<StoreModal>((set, get) => {
  console.log('STORE DISPLAY MODAL');

  TrackPlayer.addEventListener(Event.PlaybackState, async ({ state }) => {
    // se o evento do estado é Ended (o player está em execução
    // com o stream online e ele fica offline
    if (state === State.Ended) {
      console.error('ERRO ENDED');
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
      console.error('ERRO ERROR');
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
    statePlayer: State.None,

    setModal: (visible: boolean, message?: string, statePlayer?: State) => {
      set({ visible, message, statePlayer });
    },
  };
});
