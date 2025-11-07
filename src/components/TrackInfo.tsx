import { Text, View } from 'react-native';

// imports locais
import { storeTrackInfo } from '../store/storeTrackInfo';
import { styles } from '../styles/appStyles';

export function TrackInfo() {
  const artist = storeTrackInfo((state) => state.artist);
  const title = storeTrackInfo((state) => state.title);

  return (
    <View>
      <Text style={styles.artistText}>{artist}</Text>
      <Text style={styles.titleText}>{title}</Text>
    </View>
  );
}
