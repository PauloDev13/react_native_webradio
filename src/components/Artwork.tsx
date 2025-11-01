import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';

// imports locais
import { styles } from '../styles/appStyles';
import { LOCAL_NETWORK } from '../constants';

type Props = { artwork: string | null };

export function Artwork({ artwork }: Props) {
  const isRemote = typeof artwork === 'string' && artwork.startsWith('http');
  const isLocalKey = typeof artwork === 'string' && !isRemote;

  const source = isRemote
    ? { uri: artwork }
    : LOCAL_NETWORK[
        isLocalKey ? (artwork as keyof typeof LOCAL_NETWORK) : 'logo'
      ];

  return (
    <View style={styles.artworkContainer}>
      <View style={styles.shadows}>
        <Image
          source={source}
          style={styles.artwork}
          cachePolicy={'memory-disk'}
          contentFit={'cover'}
          placeholder={LOCAL_NETWORK.logo}
          onError={(e) => {
            console.warn('A capa não foi carregada: ', e.error ?? e);
          }}
          transition={500}
        />
      </View>
    </View>
  );
}
