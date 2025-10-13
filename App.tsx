import {StatusBar} from 'expo-status-bar';
import {ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import React, {useEffect, useRef, useState} from "react";
import {Audio} from "expo-av";
import {MaterialIcons} from '@expo/vector-icons'

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

async function fetchArtworkItunes(artist: string, title: string): Promise<string | null> {
  try {
    const query = encodeURIComponent(`${artist} ${title}`);
    const country = 'BR';
    const res = await fetch(`https://itunes.apple.com/search?term=${query}&limit=1&entity=musicTrack&country=${country}`);
    if (!res.ok) return null;
    const json = await res.json();
    console.log(json.results);
    if (json.results?.length > 0){
      return json.results[0].artworkUrl100;
    }
  }catch (err) {
    console.error(err);
  }
  return null;
}

async function fetchIcyMetadata(uri: string): Promise<{artist?: string, title?: string} | null> {
  try {
    const res = await fetch(uri, {
      method: 'GET',
      headers: {
        'Icy-MetaData': '1',
        'User-Agent': "ExpoRadioPlayer",
      }
    });
    if (!res.ok) {
      console.warn('Falha ao conectar stream ICY');
      return null;
    }

    const metaintHeader = res.headers.get('icy-metaint');
    if (!metaintHeader) {
      console.warn('Falha ao retornar cabeçalho ICY');
      return null;
    }

    const metaint = parseInt(metaintHeader, 10);
    const reader = res.body?.getReader();
    if(!reader) return null;

    let bytesUntilMeta = metaint;
    let songTitle: string | null = null;

    while (true) {
      const{done, value} = await reader.read();
      if (done) break;
      if (!value) continue;

      let offset = 0;
      while (offset < value.length) {
        const remaining = value.length - offset;

        if (bytesUntilMeta > 0) {
          const cosume = Math.min(bytesUntilMeta, remaining);
          offset += cosume;
          bytesUntilMeta-= cosume;
        } else {
          if(remaining < 1) break
          const metaLength = value[offset] * 16;
          offset += 1;
          if(metaLength > 0) {
            const metaBytes = value.slice(offset, offset + metaLength);
            const metaString = new TextDecoder('utf-8').decode(metaBytes);
            const match = metaString.match(/StreamTitle='([^']*)';/);

            if (match && match[1]) {
              songTitle = match[1].trim();
              const parts = songTitle.split(' - ');
              const artist = parts[0].trim() || 'Desconhecido';
              const title = parts[1].trim() || 'Ao vivo';
              reader.cancel()
              return {artist, title};
            }
          }
          offset += metaLength;
          bytesUntilMeta = metaint;
        }
      }
    }
    return null;
  } catch (error) {
    console.error('Erro ao ler Icy metadata');
    return null;
  }

  // teste

}

export default function App() {
  const soundRef = useRef<Audio.Sound | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [track, setTrack] = useState<TrackInfo>(initialTrack);

  const playerStream = async () => {
    try {
      setLoading(true);
      if (!soundRef.current) {
        const {sound} = await Audio.Sound.createAsync(
            {uri: STREAM_URL},
            {shouldPlay: true}
        );
        soundRef.current = sound;
      } else {
        await soundRef.current.playAsync();
      }
      setIsPlaying(true);
    } catch (error) {
      Alert.alert('Erro ao reproduzir stream', String(error));
    } finally {
      setLoading(false);
    }
  };

  const stopStream = async () => {
    try {
      if (soundRef.current) {
        await soundRef.current.stopAsync();
      }
      setIsPlaying(false);
    } catch (err) {
      console.error(err);
    }
  };

  const togglePlay = () => {
    isPlaying ? stopStream() : playerStream();
  };

  const updateTrackInfo = async () => {
    const meta = await fetchIcyMetadata(STREAM_URL);
    if (meta?.artist && meta?.title) {
      const artwork = await fetchArtworkItunes(meta.artist, meta.title);
      setTrack({
        artist: meta.artist,
        title: meta.title,
        artwork: artwork,
      });
    }
  };

  useEffect(() => {
    updateTrackInfo();
    const interval = setInterval(updateTrackInfo, 1500);
    return () => clearInterval(interval);
  },[track]);

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <View style={styles.artworkContainer}>
        {track.artwork ? (
            <Image source={{uri: track.artwork}} style={styles.artwork} />
        ): (
            <View style={[styles.artwork, styles.placeholder]}>
              <MaterialIcons name='music-note' size={64} color='#555' />
              <Text style={styles.placeholderText}>Sem capa</Text>
            </View>
        )}
      </View>
      <Text style={styles.artist}>{track.artist}</Text>
      <Text style={styles.title}>{track.title}</Text>
      
      <TouchableOpacity style={styles.button} onPress={togglePlay} disabled={loading}>
        {loading ? (
            <ActivityIndicator color='#fff' />
        ): (
            <MaterialIcons name={isPlaying ? 'stop' : 'play-arrow'} color='#fff' size={40} />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  artworkContainer: {
    marginBottom: 20,
  },
  artwork: {
    width: 250,
    height: 250,
    borderRadius: 12,
    backgroundColor: "#eee",
  },
  placeholder: {
    alignItems: "center",
    justifyContent: "center",
  },
  placeholderText: {
    color: "#666",
  },
  artist: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  title: {
    fontSize: 16,
    marginTop: 4,
    color: "#333",
  },
  button: {
    marginTop: 24,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#1E90FF",
    alignItems: "center",
    justifyContent: "center",
  },
});
