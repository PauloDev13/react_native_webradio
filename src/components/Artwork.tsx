import React from 'react';
import { View } from 'react-native';

import { Image } from 'expo-image'; // imports locais

import { useStoreArtwork } from '../store/storeArtwork';
import { styles } from '../styles/appStyles';

export function Artwork() {
  const artwork = useStoreArtwork((state) => state.artwork);

  return (
    <View style={styles.artworkContainer}>
      <View style={styles.shadows}>
        <Image
          key={artwork!}
          source={{ uri: artwork! }}
          style={styles.artwork}
          cachePolicy={'disk'}
          contentFit={'cover'}
          onError={(e) => {
            console.warn('A capa não foi carregada: ', e.error ?? e);
          }}
          transition={{
            effect: 'flip-from-right',
            duration: 500,
            timing: 'ease-out',
          }}
          priority={'high'}
        />
      </View>
    </View>
  );
}
