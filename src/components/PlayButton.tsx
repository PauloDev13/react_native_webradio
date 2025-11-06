import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { State } from 'react-native-track-player';

import { MaterialIcons } from '@expo/vector-icons';

// imports locais
import { useRadioPlayer } from '../hooks/useRadioPlayer';
import { styles } from '../styles/appStyles';

export function PlayButton() {
  const { loading, togglePlayback, playbackState } = useRadioPlayer();
  return (
    <TouchableOpacity
      style={[
        styles.playButton,
        playbackState?.state === State.Playing ? styles.playing : undefined,
      ]}
      onPress={togglePlayback}
      disabled={loading}
    >
      {loading || playbackState?.state === State.Buffering ? (
        <ActivityIndicator color="#03ebff" />
      ) : (
        <MaterialIcons
          style={[
            styles.iconStart,
            playbackState?.state === State.Playing
              ? styles.iconStop
              : undefined,
          ]}
          name={playbackState?.state === State.Playing ? 'pause' : 'play-arrow'}
          color="#fff"
          size={30}
        />
      )}
    </TouchableOpacity>
  );
}
