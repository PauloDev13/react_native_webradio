import { State } from 'react-native-track-player';

import { create } from 'zustand';

type Modal = {
  message: string;
  visible: boolean;
  statePlayer: State;
  setVisible: (visible: boolean) => void;
  setMessage: (message: string) => void;
  setStatePlayer: (statePlayer: State) => void;
};

export const useModal = create<Modal>((set) => ({
  message: '',
  visible: false,
  statePlayer: State.None,
  setVisible: (visible: boolean) =>
    set((state) => ({
      visible: (state.visible = visible),
    })),

  setMessage: (message: string) =>
    set((state) => ({
      message: (state.message = message),
    })),

  setStatePlayer: (statePlayer: State) =>
    set((state) => ({
      statePlayer: (state.statePlayer = statePlayer),
    })),
}));
