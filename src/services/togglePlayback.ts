import TrackPlayer, { State } from 'react-native-track-player';

export const togglePlayback = async () => {
  // permite atualização da UI
  // await Promise.resolve();
  try {
    const playback = await TrackPlayer.getPlaybackState();

    if (playback.state === State.Playing) {
      await TrackPlayer.stop();
    } else {
      await TrackPlayer.play();
    }
  } catch (err) {
    console.log('No togglePlayback:', err);
  }
};
