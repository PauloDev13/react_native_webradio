import { Text, View } from 'react-native';

// imports locais
import { useTrackInfo } from '../store/trackInfo';
import { styles } from '../styles/appStyles';

// type Props = { artist: string; title: string };

export function TrackInfo() {
  const { interprete, song } = useTrackInfo();
  return (
    <View>
      <Text style={styles.artistText}>{interprete}</Text>
      <Text style={styles.titleText}>{song}</Text>
    </View>
  );
}
