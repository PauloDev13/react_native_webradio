import React, { useEffect, useState } from 'react';
import { View } from 'react-native';

import { Image } from 'expo-image';

// imports locais
import { useStoreArtwork } from '../store/storeArtwork';
import { styles } from '../styles/appStyles';

export function Artwork() {
  const { artwork, nextArtwork, confirmArtworkLoaded } = useStoreArtwork();
  const [displayedArtwork, setDisplayedArtwork] = useState<string | null>(
    artwork
  );

  useEffect(() => {
    if (nextArtwork) {
      setDisplayedArtwork(nextArtwork);
    }
  }, [nextArtwork]);

  const handleLoadEnd = () => {
    if (nextArtwork) {
      confirmArtworkLoaded();
    }
  };

  return (
    <View style={styles.artworkContainer}>
      <View style={styles.shadows}>
        <Image
          source={{ uri: displayedArtwork ?? artwork ?? undefined }}
          style={styles.artwork}
          cachePolicy="disk"
          contentFit="cover"
          onLoad={handleLoadEnd}
          onLoadEnd={handleLoadEnd}
          onError={(e) => {
            console.warn('A capa não foi carregada: ', e.error ?? e);
            setDisplayedArtwork(artwork);
          }}
          transition={{
            effect: 'cross-dissolve',
            duration: 400,
            timing: 'ease-in-out',
          }}
        />
      </View>
    </View>
  );
}
