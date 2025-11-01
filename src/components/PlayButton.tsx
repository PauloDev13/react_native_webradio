import { ActivityIndicator, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { PlaybackState, State } from 'react-native-track-player';

// imports locais
import { styles } from '../styles/appStyles';

type Props = {
  state: PlaybackState | { state: undefined };
  loading: boolean;
  onPress: () => void;
};

export function PlayButton({ state, loading, onPress }: Props) {
  return (
    <TouchableOpacity
      style={[
        styles.playButton,
        state?.state === State.Playing ? styles.playing : undefined,
      ]}
      onPress={onPress}
      disabled={loading}
    >
      {loading || state?.state === State.Buffering ? (
        <ActivityIndicator color="#03ebff" />
      ) : (
        <MaterialIcons
          style={[
            styles.iconStart,
            state?.state === State.Playing ? styles.iconStop : undefined,
          ]}
          name={state?.state === State.Playing ? 'pause' : 'play-arrow'}
          color="#fff"
          size={30}
        />
      )}
    </TouchableOpacity>
  );
}
