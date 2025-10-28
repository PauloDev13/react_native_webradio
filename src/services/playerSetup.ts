import TrackPlayer, {AppKilledPlaybackBehavior, Event, Capability} from "react-native-track-player";

// imports locais
import { STREAM_URL} from '../constants';
import {DeviceEventEmitter} from "react-native";

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
        console.warn('Erro ao configurar player', err);
        TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
            // console.error('Erro ao iniciar o player:', event.message);

            DeviceEventEmitter.emit('STREAM_CONNECTION_ERROR', {
                message: 'Clique no botão play para tentar novamente',
                details: event.message,
            });
        });

        isPlayerInitialized = false;
    }
}