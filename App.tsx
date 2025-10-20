import {StatusBar} from 'expo-status-bar';
import {
  ActivityIndicator,
  AppState,
  Image,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import React, {useEffect, useState} from "react";
import {MaterialIcons} from '@expo/vector-icons'
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
  Event,
  State,
  usePlaybackState,
  useTrackPlayerEvents
} from "react-native-track-player";
import {SafeAreaView} from "react-native-safe-area-context";

// Impede que a splash screen desapareça antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

const STREAM_URL: string = "https://centova2.ipstm.net/proxy/bmjceqts/stream";
const FONT_DEFAULT: string = './assets/fonts/Michroma-Regular.ttf';

type LocalArtworkKey = 'logo' | 'locucao';

const localArtwork: Record<LocalArtworkKey, any> = {
  locucao: require('./assets/images/locucao.png'),
  logo: require('./assets/images/logo.png'),
}

const IMAGES = {
  background: require('./assets/images/background.png'),
}

type TrackInfo = {
  artist: string;
  title: string;
  artwork: string | LocalArtworkKey | null;
}

const initialTrack: TrackInfo = {
  artist: 'Web Rádio',
  title: 'Web Rádio',
  artwork: 'logo',
}

export default function App() {
  const playbackState = usePlaybackState();
  const [track, setTrack] = useState<TrackInfo>(initialTrack);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlayingReady, setIsPlayingReady] = useState<boolean>(false);
  const [appIsReady, setAppIsReady] = useState<boolean>(false);

  // --- Corrigido: carregamento seguro das fontes ---
  useEffect(() => {
    let isMounted = true;

    async function prepare() {
      try {
        await SplashScreen.preventAutoHideAsync();
        await Font.loadAsync({
          'Michroma': require(FONT_DEFAULT),
        });
      } catch (err) {
        console.warn('Erro ao carregar fontes:', err);
      } finally {
        if (isMounted) {
          setAppIsReady(true);
        }
      }
    }

    prepare();
    return () => { isMounted = false; };
  }, []);

  // --- Inicialização do player ---
  useEffect(() => {
    if (!appIsReady) return;
    let isMounted = true;
    let hasInitialized = false;

    const initPlayer = async () => {
      if (hasInitialized) return;

      try {
        await playerSetup();
        if (isMounted) {
          TrackPlayer.play();
          hasInitialized = true;
          setIsPlayingReady(true);
        }
        console.log('🎵 TrackPlayer configurado com sucesso!');
      } catch (error) {
        console.warn('Erro ao configurar TrackPlayer:', error);
      }
    };

    const handleAppStateChange = async (nextState: string) => {
      if (nextState === 'active' && !hasInitialized) {
        await initPlayer();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    if (AppState.currentState === 'active') {
      initPlayer();
    }

    return () => {
      isMounted = false;
      subscription.remove();
    };
  }, [appIsReady]);

  // --- Atualiza track info quando metadados chegam ---
  useTrackPlayerEvents([Event.MetadataCommonReceived], async (event) => {
    if (event.metadata?.title) {
      const [maybeArtist, maybeTitle] = event.metadata.title.split(' - ');
      const artist = maybeArtist?.trim() || '';
      const title = maybeTitle?.trim() || '';

      // limpa artwork para forçar nova busca
      setTrack({ artist, title, artwork: null });
    }
  });

  // --- Força atualização da artwork sempre que artista ou título mudam ---
  useEffect(() => {
    if (!track.artist || !track.title) return;

    let isActive = true;

    (async () => {
      const artworkRemote = await fetchArtworkFromITunes(track.artist, track.title);
      let artwork: string | LocalArtworkKey | null = artworkRemote;

      if (track.artist === 'Paulo Roberto') {
        artwork = 'locucao';
      } else if (track.title.startsWith('Web') || track.title === 'Hora' || track.title === 'Minuto') {
        artwork = 'logo';
      }

      if (isActive) {
        setTrack(prev => ({
          ...prev,
          artwork: artwork || '',
        }));
      }
    })();

    return () => { isActive = false };
  }, [track.artist, track.title]);

  const playerSetup = async (): Promise<void> => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
        android:{
          appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
        },
        capabilities: [
          Capability.Play,
          Capability.Pause,
          Capability.Stop,
          Capability.SeekTo,
        ],
        compactCapabilities: [Capability.Play, Capability.Pause],
      });
      await TrackPlayer.add({
        id: 'stream',
        url: STREAM_URL,
        title: 'Web Rádio Parque Verde',
        artist: 'Conectando...',
      });
    } catch (err) {
      console.warn('Erro ao configurar player', err);
    }
  };

  const togglePlayback = async () => {
    setLoading(true);

    await Promise.resolve(); // permite atualização da UI

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

  return (
      <ImageBackground source={IMAGES.background} resizeMode='cover' style={styles.container}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar style="light" />
          { appIsReady && (
              <>
                <Text style={styles.title}>Parque Verde</Text>
                <Text style={styles.subtitle}>Web Rádio</Text>
              </>
          )}

          <View style={styles.artworkContainer}>
            <View style={styles.shadows}>
              {track.artwork ? (
                  typeof track.artwork === 'string' && track.artwork.startsWith('http') ? (
                      <Image
                          source={{ uri: track.artwork }}
                          style={styles.artwork}
                          defaultSource={localArtwork.logo}
                          onError={(e) => {
                            console.warn('Erro ao carregar imagem remota:', e.nativeEvent.error);
                            setTrack(prev => ({ ...prev, artwork: 'logo' }));
                          }}
                      />
                  ) : (
                      <Image source={localArtwork[track.artwork as LocalArtworkKey]} style={styles.artwork} />
                  )
              ) : (
                  <Image source={localArtwork.logo} style={styles.artwork} />
              )}
            </View>
          </View>

          <Text style={styles.artistText}>{track.artist}</Text>
          <Text style={styles.titleText}>{track.title}</Text>

          <TouchableOpacity
              style={[
                styles.playButton,
                playbackState?.state === State.Playing ? styles.playing : undefined,
              ]}
              onPress={togglePlayback}
              disabled={loading}
          >
            {loading || playbackState?.state === State.Buffering ? (
                <ActivityIndicator color='#03ebff' />
            ) : (
                <MaterialIcons
                    style={[
                      styles.iconStart,
                      playbackState?.state === State.Playing ? styles.iconStop : undefined,
                    ]}
                    name={playbackState?.state === State.Playing ? 'stop' : 'play-arrow'}
                    color='#fff'
                    size={40}
                />
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </ImageBackground>
  );
}

// --- Função de busca de capa no iTunes ---
async function fetchArtworkFromITunes(artist: string, title: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const country = 'BR';
    const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=musicTrack&limit=1&country=${country}`;
    const response = await fetch(url);

    if (!response.ok) return null;
    const json = await response.json();

    if (json.results?.length) {
      const artworkUrl: string = json.results[0].artworkUrl100;
      return artworkUrl ? artworkUrl.replace('100x100bb', '600x600bb') : null;
    }
  } catch (err) {
    console.warn('Erro ao buscar capa', err);
  }
  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "transparent",
    alignItems: "center",
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  shadows: {
    overflow: 'visible',
    shadowColor: '#03ebff',
    shadowOffset: { width: 10, height: 20 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    borderRadius: 12,
  },
  title: {
    fontSize: 20,
    fontFamily: 'Michroma',
    color: "#03ebff",
    marginTop: 10,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Michroma',
    color: "#03ebff",
    marginBottom: 20,
    textAlign: "center",
  },
  artworkContainer: {
    alignItems: "center",
    marginBottom: 10,
  },
  artwork: {
    width: 220,
    height: 220,
    borderRadius: 12,
    backgroundColor: "transparent",
    margin: 2
  },
  artistText: {
    fontSize: 16,
    fontFamily: 'Michroma',
    color: "#03ebff",
    textAlign: "center",
  },
  titleText: {
    fontSize: 14,
    fontFamily: 'Michroma',
    color: "#ffffff",
    marginTop: 4,
    textAlign: "center",
  },
  playButton: {
    marginTop: 24,
    width: 64,
    height: 64,
    borderRadius: 42,
    borderColor: "rgba(3,235,255,0.7)",
    borderStyle: "solid",
    borderWidth: 2,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  playing: {
    backgroundColor: "rgba(3,235,255,0.6)",
    borderColor: "rgba(255,77,77,0.8)",
    borderStyle: "solid",
    borderWidth: 2,
  },
  iconStop: {
    color: "#000b11",
  },
  iconStart: {
    color: "#03ebff",
  },
});
