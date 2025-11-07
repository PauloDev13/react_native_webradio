import { create } from 'zustand';

type tUseTrackInfo = {
  artist: string;
  title: string;
  setTrack: (artist: string, title: string) => void;
};

export const storeTrackInfo = create<tUseTrackInfo>((set, get) => ({
  artist: 'WR Parque Verde',
  title: 'Conectando...',
  setTrack: (artist: string, title: string) => {
    const state = get();

    if (state.artist !== artist || state.title !== title) {
      set({ artist, title });
    }
  },
}));
