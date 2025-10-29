import { Text, View } from "react-native";

// imports locais
import { styles } from "../styles/appStyles";

type Props = { artist: string; title: string };

export function TrackInfo({ artist, title }: Props) {
    return (
        <View>
            <Text style={styles.artistText}>{artist}</Text>
            <Text style={styles.titleText}>{title}</Text>
        </View>
    );
}
