import {useEffect, useState} from "react";
import {AppState} from "react-native";
import TrackPlayer, {Event, State, usePlaybackState, useTrackPlayerEvents} from "react-native-track-player";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";
import {fetchArtworkFromITunes} from "../services/fetch_artwork";
import {playerSetup} from "../services/player_setup";
import {FONT_DEFAULT, LocalArtworkKey} from "../constants";

// Impede que a splash screen desapareça antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

type TrackInfo = {
    artist: string;
    title: string;
    artwork: string | LocalArtworkKey | null;
}

const initialTrack: TrackInfo = {
    artist: 'Web Rádio',
    title: 'Web Rádio',
    artwork: 'logo',
}

export function useRadioPlayer() {
    const playbackState = usePlaybackState();
    const [track, setTrack] = useState<TrackInfo>(initialTrack);
    const [loading, setLoading] = useState<boolean>(false);
    const [isPlayingReady, setIsPlayingReady] = useState<boolean>(false);
    const [appIsReady, setAppIsReady] = useState<boolean>(false);

    // Carregamento das fontes
    useEffect(() => {
        let isMounted = true;

        async function prepare() {
            try {
                await SplashScreen.preventAutoHideAsync();
                await Font.loadAsync({
                    'Michroma': require(FONT_DEFAULT),
                });
            } catch (err) {
                console.warn('Erro ao carregar fontes:', err);
            } finally {
                if (isMounted) {
                    setAppIsReady(true);
                }
            }
        }

        prepare();
        return () => { isMounted = false; };
    }, []);

    // Inicialização do player
    useEffect(() => {
        if (!appIsReady) return;
        let isMounted = true;

        const initPlayer = async () => {
            await playerSetup();
            if (isMounted) TrackPlayer.play();
        };

        if (AppState.currentState === 'active') initPlayer();

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') initPlayer();
        });

        return () => {
            isMounted = false;
            subscription.remove();
        };
    }, [appIsReady]);

    // Metadados recebidos
    useTrackPlayerEvents([Event.MetadataCommonReceived], async (event) => {
        if (event.metadata?.title) {
            const [maybeArtist, maybeTitle] = event.metadata.title.split(' - ');
            const artist = maybeArtist?.trim() || '';
            const title = maybeTitle?.trim() || '';

            // limpa artwork para forçar nova busca
            setTrack({ artist, title, artwork: null });
        }
    });

    // Atualiza capa
    useEffect(() => {
        if (!track.artist || !track.title) return;

        let isActive = true;

        (async () => {
            const artworkRemote = await fetchArtworkFromITunes(track.artist, track.title);
            let artwork: string | LocalArtworkKey | null = artworkRemote;

            if (track.artist === 'Paulo Roberto') {
                artwork = 'locucao';
            } else if (track.title.startsWith('Web') || track.title === 'Hora' || track.title === 'Minuto') {
                artwork = 'logo';
            }

            if (isActive) {
                setTrack(prev => ({
                    ...prev,
                    artwork: artwork || '',
                }));
            }
        })();

        return () => { isActive = false };
    }, [track.artist, track.title]);

    // controles play/estop
    const togglePlayback = async () => {
        setLoading(true);

        await Promise.resolve(); // permite atualização da UI

        try {
            const playback = await TrackPlayer.getPlaybackState();

            if (playback.state === State.Playing) {
                await TrackPlayer.stop();
            } else {
                await TrackPlayer.play();
            }
        } finally {
            setLoading(false);
        }
    };

    return { track, playbackState, togglePlayback, loading, appIsReady };
}