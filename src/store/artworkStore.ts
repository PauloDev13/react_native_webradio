import { create } from 'zustand';

type tArtworkStore = {
  artwork: string | null;
  setArtwork: (artwork: string | null) => void;
};

export const useArtworkStore = create<tArtworkStore>((set) => ({
  artwork: '',
  setArtwork: (artwork: string | null) =>
    set((state) => ({
      artwork: (state.artwork = artwork),
    })),
}));
