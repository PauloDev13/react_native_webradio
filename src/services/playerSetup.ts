import TrackPlayer, {AppKilledPlaybackBehavior, Capability} from "react-native-track-player";

// imports locais
import { STREAM_URL} from '../constants';

export async function playerSetup (): Promise<void> {
    try {
        await TrackPlayer.setupPlayer();
        await TrackPlayer.updateOptions({
            android:{
                appKilledPlaybackBehavior: AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
            },
            capabilities: [
                Capability.Play,
                Capability.Pause,
                Capability.Stop,
                Capability.SeekTo,
            ],
            compactCapabilities: [Capability.Play, Capability.Pause],
        });
        await TrackPlayer.add({
            id: 'stream',
            url: STREAM_URL,
            title: 'Web Rádio Parque Verde',
            artist: 'Conectando...',
        });
    } catch (err) {
        console.warn('Erro ao configurar player', err);
    }
}