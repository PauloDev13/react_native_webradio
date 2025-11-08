import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { State, usePlaybackState } from 'react-native-track-player';

import { MaterialIcons } from '@expo/vector-icons'; // imports locais

// imports locais
import { togglePlayback } from '../services/togglePlayback';
import { styles } from '../styles/appStyles';

export function PlayButton() {
  const playbackState = usePlaybackState();

  return (
    <TouchableOpacity
      style={[
        styles.playButton,
        playbackState.state === State.Playing && styles.playing,
      ]}
      onPress={togglePlayback}
    >
      {playbackState.state === State.Buffering ? (
        <ActivityIndicator color="#03ebff" />
      ) : (
        <MaterialIcons
          style={[
            styles.iconStart,
            playbackState.state === State.Playing && styles.iconStop,
          ]}
          name={playbackState.state === State.Playing ? 'pause' : 'play-arrow'}
          color="#fff"
          size={30}
        />
      )}
    </TouchableOpacity>
  );
}
