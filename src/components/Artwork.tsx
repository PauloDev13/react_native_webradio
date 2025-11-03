import { Image } from 'expo-image';
import React from 'react';
import { View } from 'react-native';

// imports locais
import { styles } from '../styles/appStyles';
import { CLOUDINARY_IMAGE } from '../constants';

type Props = { artwork: string | null };

export function Artwork({ artwork }: Props) {
  return (
    <View style={styles.artworkContainer}>
      <View style={styles.shadows}>
        <Image
          key={artwork!}
          source={{ uri: artwork! }}
          style={styles.artwork}
          cachePolicy={'disk'}
          contentFit={'cover'}
          placeholder={{ uri: CLOUDINARY_IMAGE.logo }}
          onError={(e) => {
            console.warn('A capa não foi carregada: ', e.error ?? e);
          }}
          transition={250}
          priority={'high'}
        />
      </View>
    </View>
  );
}
