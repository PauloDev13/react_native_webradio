import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import { useShallow } from 'zustand/react/shallow';

import { CLOUDINARY_IMAGE, LocalArtworkKey } from '../constants';
import { fetchArtworkFromITunes } from '../services/fetchArtwork';
import { storeTrackInfo } from '../store/storeTrackInfo';

export function UseTrackInfoListener() {
  const { artist, title, setTrack } = storeTrackInfo(
    useShallow((s) => ({
      artist: s.artist,
      title: s.title,
      setTrack: s.setTrack,
    }))
  );
  // const setTrack = storeTrackInfo((s) => s.setTrack);
  // const artist = storeTrackInfo((s) => s.artist);
  // const title = storeTrackInfo((s) => s.title);

  useTrackPlayerEvents([Event.MetadataCommonReceived], async (event) => {
    let _artwork: string | LocalArtworkKey | null = null;

    if (event.metadata?.title) {
      const [maybeArtist, maybeTitle] = event.metadata.title.split(' - ');
      const _artist = maybeArtist?.trim() || '';
      const _title = maybeTitle?.trim() || '';

      if (_title !== title || _artist !== artist) {
        _artwork = await fetchArtworkFromITunes(_artist, _title);

        // se o nome do artista é igual a 'Paulo Roberto',
        // exibe a foto do locutor
        if (_artist === 'Paulo Roberto') {
          _artwork = CLOUDINARY_IMAGE.locucao;
        } else if (
          _artist.startsWith('Web') ||
          _title === 'Hora' ||
          _title === 'Minuto'
        ) {
          _artwork = CLOUDINARY_IMAGE.logo;
        } else if (_artwork === null) {
          _artwork = CLOUDINARY_IMAGE.logo;
        }

        setTrack(_artist, _title, _artwork);

        await TrackPlayer.updateNowPlayingMetadata({
          artist: _artist,
          title: _title,
          artwork: _artwork!,
        });
      }
    }
  });
}
