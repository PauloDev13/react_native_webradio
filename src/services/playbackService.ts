import TrackPlayer, { Event } from 'react-native-track-player';
import {DeviceEventEmitter} from "react-native";

export const playbackService = async () => {
    // Estes eventos continuam funcionando mesmo em segundo plano
    TrackPlayer.addEventListener(Event.RemotePlay, () => TrackPlayer.play());
    TrackPlayer.addEventListener(Event.RemotePause, () => TrackPlayer.pause());
    TrackPlayer.addEventListener(Event.RemoteStop, () => TrackPlayer.stop());
    TrackPlayer.addEventListener(Event.RemoteSeek, (e) => TrackPlayer.seekTo(e.position));

    TrackPlayer.addEventListener(Event.PlaybackError, (event) => {
        console.error('Erro ao iniciar o player:', event.message);

        DeviceEventEmitter.emit('CONNECTION_ERROR', {
            message: 'Sem conexão. Clique em reconectar',
            details: event.message,
        });
    })
}