import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import { CLOUDINARY_IMAGE, LocalArtworkKey } from '../constants';
import { fetchArtworkFromITunes } from '../services/fetchArtwork';
import { useStoreArtwork } from '../store/storeArtwork';
import { storeTrackInfo } from '../store/storeTrackInfo';

export function UseTrackInfoListener() {
  console.log('USE TRACK INFO');

  const { artist, title, setTrack } = storeTrackInfo();
  const { setArtwork } = useStoreArtwork();

  useTrackPlayerEvents([Event.MetadataCommonReceived], async (event) => {
    let _artwork: string | LocalArtworkKey | null = null;

    if (event.metadata?.title) {
      const [maybeArtist, maybeTitle] = event.metadata.title.split(' - ');
      let _artist = maybeArtist?.trim() || '';
      let _title = maybeTitle?.trim() || '';

      if (_title !== title || _artist !== artist) {
        // muda os nomes que serão exibidos nas variáveis artist, title e artwork
        // conforme os valores recebidos originalmente do player
        if (_artist === 'Paulo Roberto') {
          _artwork = CLOUDINARY_IMAGE.locucao;
          _title = 'Radialista/Jornalista';
        } else if (_artist.startsWith('Web')) {
          _artwork = CLOUDINARY_IMAGE.logo;
        } else if (_title === 'Hora' || _title === 'Minuto') {
          _artwork = CLOUDINARY_IMAGE.logo;
          _artist = 'Hora Certa';
          _title = '';
        } else {
          // se nenhuma das alternativas acima for atendida,
          // vai à API do iTunes buscar a capa
          _artwork = await fetchArtworkFromITunes(_artist, _title);
        }

        // se o retorno da API for nulo, mostra a logo da rádio
        if (_artwork === null) {
          _artwork = CLOUDINARY_IMAGE.logo;
        }

        setTrack(_artist, _title);
        setArtwork(_artwork);

        await TrackPlayer.updateNowPlayingMetadata({
          artist: _artist,
          title: _title,
          artwork: _artwork!,
        });
      }
    }
  });
}
