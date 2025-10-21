import {Image, View} from "react-native";
import React from "react";
import {styles} from "../styles/appStyles";
import {LOCAL_NETWORK, LocalArtworkKey} from "../constants";

type Props = { artwork: string | null }

export function Artwork({ artwork }: Props) {
    const isArtworkNotNull = artwork;
    const isRemote = typeof artwork === "string" && artwork.startsWith('http');
    return (
        <View style={styles.artworkContainer}>
            <View style={styles.shadows}>
                {isArtworkNotNull ? (
                    isRemote ? (
                        <Image
                            source={{ uri: artwork }}
                            style={styles.artwork}
                            defaultSource={LOCAL_NETWORK.logo}
                            onError={(e) => {
                                console.warn('Erro ao carregar imagem remota:', e.nativeEvent.error);
                            }}
                        />
                        ): (
                        <Image source={LOCAL_NETWORK[artwork as LocalArtworkKey]} style={styles.artwork} />
                    )
                ) : (
                    <Image source={LOCAL_NETWORK.logo} style={styles.artwork} />
                )}
            </View>
        </View>
    );
}