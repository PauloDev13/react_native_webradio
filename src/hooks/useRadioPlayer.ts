import {useEffect, useState} from "react";
import {AppState} from "react-native";
import TrackPlayer, {Event, State, usePlaybackState, useTrackPlayerEvents} from "react-native-track-player";
import * as Font from "expo-font";
import * as SplashScreen from "expo-splash-screen";

// imports locais
import {fetchArtworkFromITunes} from "../services/fetchArtwork";
import {playerSetup} from "../services/playerSetup";
import {FONT_DEFAULT, LocalArtworkKey} from "../constants";

// Impede que a splash screen desapareça antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

type TrackInfo = {
    artist: string;
    title: string;
    artwork: string | LocalArtworkKey | null;
}

const initialTrack: TrackInfo = {
    artist: 'Conectando...',
    title: 'Aguarde...',
    artwork: 'logo',
}

export function useRadioPlayer() {
    const playbackState = usePlaybackState();
    const [track, setTrack] = useState<TrackInfo>(initialTrack);
    const [loading, setLoading] = useState<boolean>(false);
    const [appIsReady, setAppIsReady] = useState<boolean>(false);
    const [splashHidden, setSplashHidden] = useState<boolean>(false);

    // Carregamento das fontes
    useEffect(() => {
        let isMounted = true;

        const loadFonts = async () => {
            try {
                await SplashScreen.preventAutoHideAsync();
                await Font.loadAsync(FONT_DEFAULT);
            } catch (err) {
                console.warn('Erro ao carregar fontes:', err);
            } finally {
                if (isMounted) {
                    setAppIsReady(true);
                }
            }
        }
        // executa a função loadFonts
        loadFonts();

        return () => {
            isMounted = false;
        };

    }, []);

    // Inicialização do player
    useEffect(() => {
        if (!appIsReady) return;

        const initPlayer = async () => {
            // chama função que inicializa e toca o player
            await playerSetup();

            // se o player está efetivamente tocando o áudio
            if (playbackState.state === State.Playing && !splashHidden) {
                // tira a splash screen da tela
                await SplashScreen.hideAsync();
                setSplashHidden(true);
                console.log('setSplashHidden', splashHidden);
            }
        };

        if (AppState.currentState === 'active') initPlayer();

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') initPlayer();
        });

        return () => {
            subscription.remove();
        };

    }, [appIsReady, splashHidden, playbackState.state]);

    // Metadados recebidos
    useTrackPlayerEvents([Event.MetadataCommonReceived], async (event) => {
        console.log('useTrackPlayerEvents')

        if (event.metadata?.title) {
            const [maybeArtist, maybeTitle] = event.metadata.title.split(' - ');
            const artist = maybeArtist?.trim() || '';
            const title = maybeTitle?.trim() || '';

            // limpa artwork para forçar nova busca
            setTrack({artist, title, artwork: null});
        };
    });

    // Atualiza capa
    useEffect(() => {
        if (!track.artist || !track.title) return;

        let isActive = true;

        const updateMetadata = async () =>  {
            let artwork: string | LocalArtworkKey | null = await fetchArtworkFromITunes(track.artist, track.title);

            if (track.artist === 'Paulo Roberto') {
                artwork = 'locucao';
            } else if (track.artist.startsWith('Web') || track.title === 'Hora' || track.title === 'Minuto') {
                artwork = 'logo';
            };

            if (isActive) {
                setTrack(prev => ({
                    ...prev,
                    artwork: artwork || 'logo',
                }));

                await TrackPlayer.updateNowPlayingMetadata({
                    artist: track.artist, title: track.title, artwork: artwork!
                });
            };
        };

        // executa a função updateMetadata
        updateMetadata();

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