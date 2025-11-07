import { create } from 'zustand';

type tUseTrackInfo = {
  artist: string;
  title: string;
  artwork: string | null;
  setTrack: (artist: string, title: string, artwork: string | null) => void;
};

export const storeTrackInfo = create<tUseTrackInfo>((set, get) => ({
  artist: 'WR Parque Verde',
  title: 'Conectando...',
  artwork: null,
  setTrack: (artist: string, title: string, artwork: string | null) => {
    const state = get();

    if (
      state.artist !== artist ||
      state.title !== title ||
      state.artwork !== artwork
    ) {
      set({ artist, title, artwork });
    }
  },
}));
