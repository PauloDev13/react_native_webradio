import { create } from 'zustand';

type tStoreArtwork = {
  artwork: string | null;
  nextArtwork: string | null;
  setArtwork: (artwork: string | null) => void;
  confirmArtworkLoaded: () => void;
};

export const useStoreArtwork = create<tStoreArtwork>((set, get) => ({
  artwork: null,
  nextArtwork: null,

  setArtwork: (artwork: string | null) => {
    // const { artwork: current } = get();
    const state = get();
    const current = state.artwork;

    if (artwork && artwork !== current) {
      set({ nextArtwork: artwork });
    }
  },
  confirmArtworkLoaded: () => {
    const { nextArtwork } = get();

    if (nextArtwork) {
      set({ artwork: nextArtwork, nextArtwork: null });
    }
  },
}));
