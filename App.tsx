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
import { useFonts } from 'expo-font'
import TrackPlayer, { Capability, Event, State, usePlaybackState, useTrackPlayerEvents} from "react-native-track-player";


const STREAM_URL = "https://centova2.ipstm.net/proxy/bmjceqts/stream";
const BACKGROUND_IMAGE = './assets/images/background.png';
const FONT_DEFAULT = './assets/fonts/Michroma-Regular.ttf';

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

  const [fontsLoaded] = useFonts({
    'Michroma': require(FONT_DEFAULT),
  });

  useEffect(() => {
    let isMounted = true;
    let hasInitialized = false;

    const initPlayer = async () => {
      if (!fontsLoaded || hasInitialized) return;

      try {
        await setupPlayer();
        if (isMounted) {
          hasInitialized = true;
          setIsPlayingReady(true);
          togglePlayback();
        }
        console.log('🎵 TrackPlayer configurado com sucesso!');
      } catch (error) {
        console.warn('Erro ao configurar TrackPlayer:', error);
      }
    };

    // Executa assim que o app estiver ativo
    const handleAppStateChange = async (nextState: string) => {
      if (nextState === 'active' && !hasInitialized && fontsLoaded) {
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
  }, [fontsLoaded]);

  useTrackPlayerEvents([Event.MetadataCommonReceived], async (event) => {
    if(event.metadata.title) {
      const rawTitle = event.metadata?.title;
      const [maybeArtist, maybeTitle] = rawTitle.split(' - ');
      const artist = maybeArtist.trim() || 'Desconhecido';
      const title = maybeTitle.trim() || rawTitle;

      const artwork = await fetchArtworkFromITunes(artist, title);
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
      const state = (await TrackPlayer.getPlaybackState()).state;

      if (state === State.Playing) {
        await TrackPlayer.stop();
      } else {
        await TrackPlayer.play();
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <ImageBackground source={require(BACKGROUND_IMAGE)} resizeMode='cover' style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.artworkContainer}>
        <Text style={styles.title}>Parque Verde</Text>
        <Text style={styles.subtitle}>Web Rádio</Text>

        {track.artwork ? (
            <Image source={{uri: track.artwork}} style={styles.artwork} />
        ): (
            <View style={[styles.artwork, styles.artworkPlaceholder]}>
              <MaterialIcons name='music-note' size={64} color='#555' />
              <Text style={styles.placeholderText}>Sem capa</Text>
            </View>
        )}
      </View>
      <Text style={styles.artistText}>{track.artist}</Text>
      <Text style={styles.titleText}>{track.title}</Text>

      <TouchableOpacity style={[
          styles.playButton, playbackState?.state === State.Playing ? styles.playing : undefined
      ]} onPress={togglePlayback} disabled={loading}>
        {loading ? (
            <ActivityIndicator color='#fff' />
        ): (
            <MaterialIcons
                style={[styles.iconStart, playbackState?.state === State.Playing ? styles.iconStop : undefined]}
                name={playbackState?.state === State.Playing? 'stop' : 'play-arrow'}
                color='#fff' size={40}
            />
        )}
      </TouchableOpacity>
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
    justifyContent: "flex-start",
    padding: 24,
  },
  title: {
    fontSize: 22,
    fontFamily: 'Michroma',
    color: "#03ebff",
    marginTop: 15,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 18,
    fontFamily: 'Michroma',
    color: "#03ebff",
    marginBottom: 20,
    textAlign: "center",
  },
  artworkContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  artwork: {
    width: 220,
    height: 220,
    borderRadius: 12,
    backgroundColor: "transparent",
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
    fontSize: 18,
    fontFamily: 'Michroma',
    color: "#03ebff",
    fontWeight: "bold",
    marginTop: 4,
    textAlign: "center",
  },
  titleText: {
    fontSize: 16,
    fontStyle: "italic",
    fontFamily: 'Michroma',
    color: "#03ebff",
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
    borderWidth: 1,
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  playing: {
    backgroundColor: "rgba(3,235,255,0.8)",
    borderColor: "rgba(255,77,77,0.8)",
    borderStyle: "solid" ,
    borderWidth: 1,
  },
  iconStop: {
    color: "#000b11",
  },
  iconStart: {
    color: "#03ebff",
  }

});
