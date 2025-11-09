import TrackPlayer from 'react-native-track-player';

import { STREAM_URL } from '../constants';

export async function trackPlayerAdd() {
  console.log('FUNCTION TRACK PLAYER ADD');

  await TrackPlayer.add({
    id: 'stream',
    url: STREAM_URL,
    artist: 'WR Parque Verde',
    title: 'Conectando...',
    artwork: undefined,
  });
}
