import React from 'react';
import { ImageBackground } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatusBar } from 'expo-status-bar';

// imports locais
import { Artwork } from './src/components/Artwork';
import { ConnectionModal } from './src/components/ConnectionModal';
import { Header } from './src/components/Header';
import { PlayButton } from './src/components/PlayButton';
import { TrackInfo } from './src/components/TrackInfo';
import { IMAGES } from './src/constants';
import { useRadioPlayer } from './src/hooks/useRadioPlayer';
import { styles } from './src/styles/appStyles';

export default function App() {
  const { appIsReady } = useRadioPlayer();

  return (
    <ImageBackground
      source={IMAGES.background}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ConnectionModal />
        {appIsReady && (
          <>
            <Header />
            <Artwork />
            <TrackInfo />
            <PlayButton />
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}
