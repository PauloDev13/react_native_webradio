import { create } from 'zustand';

type tUseTrackInfo = {
  metadata: tTrackInfo;
  setTrack: (metadata: tTrackInfo) => void;
};

type tTrackInfo = {
  artist: string;
  title: string;
};

export const useTrackInfo = create<tUseTrackInfo>((set) => ({
  metadata: { artist: 'WR Parque Verde', title: 'Conectando...' },
  setTrack: (data: tTrackInfo) =>
    set((state) => ({
      metadata: {
        artist: (state.metadata.artist = data.artist),
        title: (state.metadata.title = data.title),
      },
    })),
}));
