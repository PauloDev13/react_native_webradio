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
import { fetchArtworkFromITunes } from '../services/fetchArtwork';
import { playerSetup } from '../services/playerSetup';
import { FONT_DEFAULT, LocalArtworkKey } from '../constants';

// Impede que a splash screen desapareça antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

type TrackInfo = {
  artist: string;
  title: string;
  artwork: string | LocalArtworkKey | null;
};

const initialTrack: TrackInfo = {
  artist: 'Conectando...',
  title: 'Aguarde...',
  artwork: 'logo',
};

export function useRadioPlayer() {
  const playbackState = usePlaybackState();
  const [track, setTrack] = useState<TrackInfo>(initialTrack);
  const [loading, setLoading] = useState<boolean>(false);
  const [appIsReady, setAppIsReady] = useState<boolean>(false);
  const [splashHidden, setSplashHidden] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('Sem conexão...');
  const [visible, setVisible] = useState<boolean>(false);
  const [statePlayer, setStatePlayer] = useState(State.Stopped);

  // Carregamento das fontes
  useEffect(() => {
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
    if (event.metadata?.title) {
      const [maybeArtist, maybeTitle] = event.metadata.title.split(' - ');
      const artist = maybeArtist?.trim() || '';
      const title = maybeTitle?.trim() || '';

      // limpa artwork para forçar nova busca
      setTrack({ artist, title, artwork: null });
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
      // abtribui o estado ao setStatePlayer
      setStatePlayer(State.Ended);
      // abtribui mensagem ao setMessage
      setMessage('Conexão perdida...');
      // abtribui o valor true ao setVisible que será usado
      // para exibir Modal quando a conexão for perdida
      setVisible(true);
    }
    // se o evento do estado é Error (stream já está
    // offline quando o player é aberto)
    if (event.state === State.Error) {
      setStatePlayer(State.Error);
      setMessage('Conexão perdida...');
      setVisible(true);
    }
  });

  // Atualiza capa
  useEffect(() => {
    if (!track.artist || !track.title) return;

    let isActive = true;

    const updateMetadata = async () => {
      let artwork: string | LocalArtworkKey | null =
        await fetchArtworkFromITunes(track.artist, track.title);

      // se o nome do artista é igual a 'Paulo Roberto',
      // exibe a foto do locutor
      if (track.artist === 'Paulo Roberto') {
        artwork = 'locucao';
      } else if (
        track.artist.startsWith('Web') ||
        track.title === 'Hora' ||
        track.title === 'Minuto'
      ) {
        artwork = 'logo';
      }
      // se isActive é igual a true, usa setTrack
      // para atualizar os dados da trilha
      if (isActive) {
        setTrack((prev) => ({
          ...prev,
          artwork: artwork || 'logo',
        }));

        // atualiza também os dados da trilha que está
        // em execução o player que roda em background
        await TrackPlayer.updateNowPlayingMetadata({
          artist: track.artist,
          title: track.title,
          artwork: artwork!,
        });
      }
    };

    // executa a função updateMetadata
    updateMetadata();

    return () => {
      isActive = false;
    };

    // atualiza o hook useEffects toda a vez que
    // os nomes do artista e música mudarem
  }, [track.artist, track.title]);

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
    track,
    playbackState,
    togglePlayback,
    loading,
    appIsReady,
    visible,
    message,
    setVisible,
    statePlayer,
  };
}
