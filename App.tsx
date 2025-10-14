import {StatusBar} from 'expo-status-bar';
import {ActivityIndicator, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useState} from "react";
import {MaterialIcons} from '@expo/vector-icons'
import TrackPlayer, {Capability, Event, State, usePlaybackState, useTrackPlayerEvents} from "react-native-track-player";


const STREAM_URL = "https://centova2.ipstm.net/proxy/bmjceqts/stream";

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

  useEffect(() => {
    (async () => {
      await setupPlayer();
    })();
    return () => {
      TrackPlayer.reset();
    };
  },[]);

  useTrackPlayerEvents([Event.MetadataCommonReceived], async (event) => {
    if(event.metadata.title) {
      const rawTitle = event.metadata.title;
      const [maybeArtist, maybeTitle] = rawTitle.split(' - ');
      const artist = maybeArtist.trim() || 'Desconhecido';
      const title = maybeTitle.trim() || rawTitle;

      const artwork = await fetchArtworkFromITunes(artist, title);
      setTrack({artist, title, artwork});
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
      console.warn('Erro ao configurar player');
    }
  };

  const togglePlayback = async () => {
    try {
      setLoading(true);
      const state = (await TrackPlayer.getPlaybackState()).state;

      if (state === State.Playing) {
        await TrackPlayer.pause();
      } else {
        await TrackPlayer.play();
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.artworkContainer}>
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
                name={playbackState?.state === State.Playing? 'stop' : 'play-arrow'}
                color='#fff' size={40}
            />
        )}
      </TouchableOpacity>
    </View>
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
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  artworkContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  artwork: {
    width: 260,
    height: 260,
    borderRadius: 12,
    backgroundColor: "#eee",
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
    fontWeight: "bold",
    marginTop: 8,
  },
  titleText: {
    fontSize: 16,
    color: "#444",
    marginTop: 4,
    textAlign: "center",
  },
  playButton: {
    marginTop: 24,
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: "#1E90FF",
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  playing: {
    backgroundColor: "#ff4d4d",
  },
});
