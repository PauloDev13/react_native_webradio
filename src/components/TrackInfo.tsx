import { Text, View } from 'react-native';

// imports locais
import { useTrackInfo } from '../store/trackInfo';
import { styles } from '../styles/appStyles';

export function TrackInfo() {
  const { artist, title } = useTrackInfo().metadata;
  return (
    <View>
      <Text style={styles.artistText}>{artist}</Text>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
}
