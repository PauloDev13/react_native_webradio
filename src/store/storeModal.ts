import { State } from 'react-native-track-player';

import { create } from 'zustand';

type StoreModal = {
  visible: boolean;
  message?: string;
  statePlayer?: State;
  setModal: (visible: boolean, message?: string, statePlayer?: State) => void;
};

export const useStoreModal = create<StoreModal>((set) => ({
  message: '',
  visible: false,
  statePlayer: State.None,

  setModal: (visible: boolean, message?: string, statePlayer?: State) => {
    set({ visible, message, statePlayer });
  },
}));
