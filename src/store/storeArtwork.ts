import { create } from 'zustand';

import { CLOUDINARY_IMAGE } from '../constants';

type StoreArtwork = {
  artwork: string | null;
  nextArtwork: string | null;
  setArtwork: (artwork: string | null) => void;
  confirmArtworkLoaded: () => void;
};

export const useStoreArtwork = create<StoreArtwork>((set, get) => ({
  artwork: CLOUDINARY_IMAGE.logo,
  nextArtwork: null,

  setArtwork: (artwork: string | null) => {
    const { artwork: current } = get();
    // const state = get();
    // const current = state.artwork;

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
