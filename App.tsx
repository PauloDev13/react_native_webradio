import { StatusBar } from 'expo-status-bar';
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
import React, { useEffect, useState } from "react";
import { MaterialIcons } from '@expo/vector-icons'
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import TrackPlayer, { Capability, Event, State, usePlaybackState, useTrackPlayerEvents} from "react-native-track-player";
import {SafeAreaView} from "react-native-safe-area-context";

// Impede que a splash screen desapareça antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

const STREAM_URL: string = "https://centova2.ipstm.net/proxy/bmjceqts/stream";
const FONT_DEFAULT: string = './assets/fonts/Michroma-Regular.ttf';

const IMAGES = {
  background: require('./assets/images/background.png'),
  locucao: require('./assets/images/locucao.png'),
  logo: require('./assets/images/logo.png'),
}

type TrackInfo = {
  artist: string;
  title: string;
  artwork?: string | null;
}

const initialTrack: TrackInfo = {
  artist: '-',
  title: 'Conectando...',
  artwork: null,
}

export default function App() {
  const playbackState = usePlaybackState();
  const [track, setTrack] = useState<TrackInfo>(initialTrack);
  const [loading, setLoading] = useState<boolean>(false);
  const [isPlayingReady, setIsPlayingReady] = useState<boolean>(false);
  const [appIsReady, setAppIsReady] = useState<boolean>(false);

  useEffect(() => {
    async function prepare() {
      try {
        await Font.loadAsync({
          'Michroma': require(FONT_DEFAULT),
        })
      }catch (err){
        console.warn('Erro ao carregar fontes:', err)
      }finally {
        setAppIsReady(true);
        // só libera a UI depois que as fontes estão prontas
        await SplashScreen.hideAsync();
      }
    }
    prepare();
  }, []);

  useEffect(() => {
    if (!appIsReady) return;
    let isMounted = true;
    let hasInitialized = false;

    const initPlayer = async () => {
      if (hasInitialized) return;

      try {
        await setupPlayer();
        if (isMounted) {
          togglePlayback();
          hasInitialized = true;
          setIsPlayingReady(true);
        }
        console.log('🎵 TrackPlayer configurado com sucesso!');
      } catch (error) {
        console.warn('Erro ao configurar TrackPlayer:', error);
      }
    };

    // Executa assim que o app estiver ativo
    const handleAppStateChange = async (nextState: string) => {
      if (nextState === 'active' && !hasInitialized) {
        await initPlayer();
      }
    };

    // Adiciona listener de AppState
    const subscription = AppState.addEventListener('change', handleAppStateChange);

    // Garante tentativa inicial (caso o app já esteja ativo)
    if (AppState.currentState === 'active') {
      initPlayer();
    }

    return () => {
      isMounted = false;
      subscription.remove();
      TrackPlayer.reset();
    };
  }, [appIsReady]);

  useTrackPlayerEvents([Event.MetadataCommonReceived], async (event) => {
    if(event.metadata.title) {
      const rawTitle: string = event.metadata?.title;
      const [maybeArtist, maybeTitle] = rawTitle.split(' - ');
      const artist = maybeArtist.trim() || 'Desconhecido';
      const title = maybeTitle.trim() || 'Desconhecido';

      const artwork: string | null = await fetchArtworkFromITunes(artist, title);
      setTrack({artist: artist, title: title, artwork: artwork});
    }
  });

  const setupPlayer = async (): Promise<void> => {
    try {
      await TrackPlayer.setupPlayer();
      await TrackPlayer.updateOptions({
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
    }catch(err) {
      console.warn('Erro ao configurar player', err);
    }
  };

  const togglePlayback = async () => {
    try {
      setLoading(true);
      const state: State = (await TrackPlayer.getPlaybackState()).state;

      if (state === State.Playing) {
        await TrackPlayer.stop();
      } else {
        await TrackPlayer.play();
      }
    } finally {
      setLoading(false);
    }
  };

  const cover = ()  => {
    if (track.artist.startsWith('Paulo Roberto')) {
      return IMAGES.locucao;
    }

    if (track.title.startsWith('Hora') || track.title.startsWith('Minuto')) {
      return IMAGES.logo;
    }
    return IMAGES.logo;
  }

  return (
    <ImageBackground source={IMAGES.background} resizeMode='cover' style={styles.container}>
      <SafeAreaView style={styles.safeArea} >
        <StatusBar style="light" />
        <View style={styles.artworkContainer}>
          <Text style={styles.title}>Parque Verde</Text>
          <Text style={styles.subtitle}>Web Rádio</Text>

          <View style={styles.shadows}>
            {track.artwork ? (
                <Image source={{uri: track.artwork}} style={styles.artwork} />
            ): (
                <Image source={cover()} style={styles.artwork} />
              )
            }
          </View>
        </View>
        <Text style={styles.artistText}>{track.artist}</Text>
        <Text style={styles.titleText}>{track.title}</Text>

        <TouchableOpacity style={[
            styles.playButton, playbackState?.state === State.Playing ? styles.playing : undefined
        ]} onPress={togglePlayback} disabled={loading}>
          {loading ? (
              <ActivityIndicator color='#03ebff' />
          ): (
              <MaterialIcons
                  style={[styles.iconStart, playbackState?.state === State.Playing ? styles.iconStop : undefined]}
                  name={playbackState?.state === State.Playing? 'stop' : 'play-arrow'}
                  color='#fff' size={40}
              />
          )}
        </TouchableOpacity>

      </SafeAreaView>
    </ImageBackground>
  );
}

async function fetchArtworkFromITunes(artist: string, title: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const url = `https://itunes.apple.com/search?term=${query}&limit=1&entity=song`;
    const response = await fetch(url);

    if (!response.ok) return null;

    const json = await response.json();

    if(json.results?.length) {
      const artworkUrl = json.results[0].artworkUrl100;
      return artworkUrl ? artworkUrl.replace('100x100bb', '600x600bb') : null;
    }

  }catch(err) {
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
    top: 30,
    bottom: 10,
    paddingLeft: 20,
    paddingRight: 20,
    alignItems: 'center'
  },
  shadows: {
    overflow: 'visible',
    shadowColor: '#03ebff',
    shadowOffset: {width: 10, height: -20},
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 10,
    borderRadius: 12,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Michroma',
    color: "#03ebff",
    marginTop: 30,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Michroma',
    color: "#03ebff",
    marginBottom: 30,
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
  artworkPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#666",
    marginTop: 8,
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
    borderStyle: "solid" ,
    borderWidth: 2,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  playing: {
    backgroundColor: "rgba(3,235,255,0.6)",
    borderColor: "rgba(255,77,77,0.8)",
    borderStyle: "solid" ,
    borderWidth: 2,
  },
  iconStop: {
    color: "#000b11",
  },
  iconStart: {
    color: "#03ebff",
  }

});
