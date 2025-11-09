import { ActivityIndicator, TouchableOpacity } from 'react-native';

import { MaterialIcons } from '@expo/vector-icons'; // imports locais

// imports locais
import { useStoreTogglePlayback } from '../store/storeTogglePlayback';
import { styles } from '../styles/appStyles';

export function PlayButton() {
  // const playbackState = usePlaybackState();
  const { loading, togglePlayback } = useStoreTogglePlayback();

  return (
    <TouchableOpacity
      style={[
        styles.playButton,
        !loading && loading !== null && styles.playing,
      ]}
      onPress={togglePlayback}
    >
      {loading ? (
        <ActivityIndicator color="#03ebff" />
      ) : (
        <MaterialIcons
          style={[
            styles.iconStart,
            !loading && loading !== null && styles.iconStop,
          ]}
          name={!loading && loading !== null ? 'pause' : 'play-arrow'}
          color="#fff"
          size={30}
        />
      )}
    </TouchableOpacity>
  );
}
