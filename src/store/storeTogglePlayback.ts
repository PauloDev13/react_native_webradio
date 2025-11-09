import TrackPlayer, { Event, State } from 'react-native-track-player';

import { create } from 'zustand';

type StoreTogglePlayback = {
  loading: boolean | null;
  togglePlayback: () => void;
};

export const useStoreTogglePlayback = create<StoreTogglePlayback>((set) => {
  console.log('STORE TOGGLE PLAYBACK');
  // Cria o listener logo ao instanciar o store que fica escutando
  // as mudanças de estado do player
  TrackPlayer.addEventListener(Event.PlaybackState, ({ state }) => {
    if (state === State.Playing) {
      set({ loading: false });
    } else if (state === State.Stopped) {
      set({ loading: null });
    } else {
      set({ loading: true });
    }
  });

  return {
    loading: false,

    togglePlayback: async () => {
      const { state } = await TrackPlayer.getPlaybackState();
      try {
        if (state === State.Playing) {
          await TrackPlayer.stop();
        } else {
          await TrackPlayer.play();
        }
      } catch (err) {
        console.warn('Erro no togglePlayback:', err);
      }
    },
  };
});
