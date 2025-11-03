import React from 'react';
import { ImageBackground } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

// imports locais
import { IMAGES } from './src/constants';
import { styles } from './src/styles/appStyles';
import { useRadioPlayer } from './src/hooks/useRadioPlayer';
import { Header } from './src/components/Header';
import { Artwork } from './src/components/Artwork';
import { TrackInfo } from './src/components/TrackInfo';
import { PlayButton } from './src/components/PlayButton';
import { ConnectionModal } from './src/components/ConnectionModal';

export default function App() {
  const {
    track,
    playbackState,
    togglePlayback,
    loading,
    appIsReady,
    visible,
    message,
    setVisible,
    statePlayer,
  } = useRadioPlayer();

  return (
    <ImageBackground
      source={IMAGES.background}
      style={styles.container}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="light" />
        <ConnectionModal
          visible={visible}
          message={message}
          setVisible={setVisible}
          statePlayer={statePlayer}
        />
        {appIsReady && (
          <>
            <Header />
            <Artwork artwork={track.artwork} />
            <TrackInfo artist={track.artist} title={track.title} />
            <PlayButton
              state={playbackState}
              loading={loading}
              onPress={togglePlayback}
            />
          </>
        )}
      </SafeAreaView>
    </ImageBackground>
  );
}
