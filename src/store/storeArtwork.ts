import { create } from 'zustand';

type tStoreArtwork = {
  artwork: string | null;
  setArtwork: (artwork: string | null) => void;
};

export const useStoreArtwork = create<tStoreArtwork>((set, get) => ({
  artwork: null,

  setArtwork: (artwork: string | null) => {
    const state = get();

    console.log('CAPA NO STATE', state.artwork);
    console.log('CAPA RECEBIDA', artwork);

    set({ artwork: state.artwork });

    if (state.artwork !== artwork) {
      set({ artwork });
    }
  },
}));
