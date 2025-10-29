import TrackPlayer, {AppKilledPlaybackBehavior, Capability} from "react-native-track-player";

// imports locais
import { STREAM_URL} from '../constants';

let isPlayerInitialized: boolean = false;

export async function playerSetup (): Promise<void> {
    if (isPlayerInitialized) {
        console.log('Player já iniciado');
        return;
    }

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
            artist: 'Conectando...',
            title: 'Conectando...',
        });

        // coloca o player para tocar
        await TrackPlayer.play();
        isPlayerInitialized = true;

    } catch (err) {
        console.warn('Mensagem do catch do playerSetup', err);
        isPlayerInitialized = false;
    }
}