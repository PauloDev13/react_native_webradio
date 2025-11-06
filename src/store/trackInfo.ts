import { create } from 'zustand';

type tUseTrackInfo = {
  // metadata: tTrackInfo;
  interprete: string;
  song: string;
  setTrack: (interprete: string, song: string) => void;
};

type tTrackInfo = {
  artist: string;
  title: string;
};

export const useTrackInfo = create<tUseTrackInfo>((set) => ({
  interprete: 'WR Parque Verde',
  song: 'Conectando...',
  setTrack: (interprete: string, song: string) =>
    set((state) => ({
      interprete: (state.interprete = interprete),
      song: (state.song = song),
    })),
}));
