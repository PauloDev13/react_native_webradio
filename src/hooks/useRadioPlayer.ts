import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import TrackPlayer, {
  Event,
  State,
  usePlaybackState,
  useTrackPlayerEvents,
} from 'react-native-track-player';

import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// imports locais
import { CLOUDINARY_IMAGE, FONT_DEFAULT, LocalArtworkKey } from '../constants';
import { fetchArtworkFromITunes } from '../services/fetchArtwork';
import { playerSetup } from '../services/playerSetup';
import { useArtworkStore } from '../store/artworkStore';
import { useModalStore } from '../store/modalStore';
import { useTrackInfo } from '../store/trackInfo';

// Impede que a splash screen desapareça antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

// type TrackInfo = {
//   artist: string;
//   title: string;
// };

// type TrackInfo = {
//   artist: string;
//   title: string;
//   artwork: string | LocalArtworkKey | null;
// };

// const initialTrack: TrackInfo = {
//   artist: 'WR Parque Verde',
//   title: 'Conectando...',
// };

// const initialTrack: TrackInfo = {
//   artist: 'WR Parque Verde...',
//   title: 'Conectando...',
//   artwork: null,
// };

export function useRadioPlayer() {
  const { setMessage, setVisible, setStatePlayer } = useModalStore();
  const { setArtwork } = useArtworkStore();
  const { interprete, song, setTrack } = useTrackInfo();
  const playbackState = usePlaybackState();
  // const [track, setTrack] = useState<TrackInfo>(initialTrack);
  const [loading, setLoading] = useState<boolean>(false);
  const [appIsReady, setAppIsReady] = useState<boolean>(false);
  const [splashHidden, setSplashHidden] = useState<boolean>(false);

  // Carregamento das fontes
  useEffect(() => {
    console.log('CARREGOU FONTES');
    let isMounted = true;

    const loadFonts = async () => {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync(FONT_DEFAULT);
      } catch (err) {
        console.warn('Erro ao carregar fontes:', err);
      } finally {
        if (isMounted) {
          setAppIsReady(true);
        }
      }
    };
    // executa a função loadFonts
    loadFonts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Inicialização do player
  useEffect(() => {
    console.log('INICIOU O PLAYER');
    if (!appIsReady) return;

    const initPlayer = async () => {
      // chama função que inicializa e toca o player
      await playerSetup();
    };

    if (AppState.currentState === 'active') initPlayer();

    const subscription = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') initPlayer();
      }
    );

    return () => {
      subscription.remove();
    };
  }, [appIsReady, splashHidden]);

  // Metadados recebidos
  useTrackPlayerEvents([Event.MetadataCommonReceived], async (event) => {
    console.log('ENTROU NO METADATA');
    let _artwork: string | LocalArtworkKey | null = null;

    if (event.metadata?.title) {
      const [maybeArtist, maybeTitle] = event.metadata.title.split(' - ');
      const artist = maybeArtist?.trim() || '';
      const title = maybeTitle?.trim() || '';

      if (title !== title) {
        _artwork = await fetchArtworkFromITunes(artist, title);

        // se o nome do artista é igual a 'Paulo Roberto',
        // exibe a foto do locutor
        if (artist === 'Paulo Roberto') {
          _artwork = CLOUDINARY_IMAGE.locucao;
        } else if (
          artist.startsWith('Web') ||
          title === 'Hora' ||
          title === 'Minuto'
        ) {
          _artwork = CLOUDINARY_IMAGE.logo;
        } else if (_artwork === null) {
          _artwork = CLOUDINARY_IMAGE.logo;
        }

        console.log('ARTISTE', artist);
        console.log('TIELE', title);

        // setTrack({ artist, title });

        setTrack(interprete, song);

        setArtwork(_artwork);
        // setTrack({ artist, title, artwork: _artwork });

        await TrackPlayer.updateNowPlayingMetadata({
          artist,
          title,
          artwork: _artwork!,
        });
      }
    }
  });

  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    // se o player está no estado Buffering
    if (event.state === State.Buffering && !splashHidden) {
      // tira a splash screen da tela
      await SplashScreen.hideAsync();
      setSplashHidden(true);
    }
    // se o evento do estado é Ended (o player está em execução
    // com o stream online e ele fica offline
    if (event.state === State.Ended) {
      console.error('ERRO ENDED');
      // abtribui o estado ao setStatePlayer
      setStatePlayer(State.Ended);
      // abtribui mensagem ao setMessage
      setMessage('Conexão perdida...');
      // abtribui o valor true ao setVisible que será usado
      // para exibir ModalStore quando a conexão for perdida
      setVisible(true);
    }
    // se o evento do estado é Error (stream já está
    // offline quando o player é aberto)
    if (event.state === State.Error) {
      console.error('ERRO ENDED');
      setStatePlayer(State.Error);
      setMessage('Conexão perdida...');
      setVisible(true);
    }
  });

  // controles play/estop
  const togglePlayback = async () => {
    setLoading(true);

    // permite atualização da UI
    await Promise.resolve();

    try {
      const playback = await TrackPlayer.getPlaybackState();

      if (playback.state === State.Playing) {
        await TrackPlayer.stop();
      } else {
        await TrackPlayer.play();
      }
    } finally {
      setLoading(false);
    }
  };

  // retorna os estados que podem ser usados nos componentes para atualizar a UI
  return {
    // track,
    playbackState,
    togglePlayback,
    loading,
    appIsReady,
  };
}
