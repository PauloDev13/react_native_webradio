import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { Event, State, useTrackPlayerEvents } from 'react-native-track-player';

import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// imports locais
import { FONT_DEFAULT } from '../constants';
import { playerSetup } from '../services/playerSetup';
import { useStoreModal } from '../store/storeModal';

// Impede que a splash screen desapareça antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

export function useRadioPlayer() {
  const { setModal } = useStoreModal();
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
    };
    // executa a função loadFonts
    loadFonts();

    return () => {
      isMounted = false;
    };
  }, []);

  // Inicialização do player
  useEffect(() => {
    // if (!appIsReady) return;

    const initPlayer = async () => {
      // chama função que inicializa e toca o player
      await playerSetup();
    };

    if (AppState.currentState === 'active') initPlayer();

    const subscription = AppState.addEventListener(
      'change',
      (state: AppStateStatus) => {
        if (state === 'active') initPlayer();
      }
    );

    return () => {
      subscription.remove();
    };
  }, [appIsReady]);

  useTrackPlayerEvents([Event.PlaybackState], async (event) => {
    // se o player está no estado Buffering
    if (event.state === State.Buffering && !splashHidden) {
      // tira a splash screen da tela
      await SplashScreen.hideAsync();
      setSplashHidden(true);
    }
    // se o evento do estado é Ended (o player está em execução
    // com o stream online e ele fica offline
    if (event.state === State.Ended) {
      console.error('ERRO ENDED');
      // abtribui o estado ao setStatePlayer
      setModal(true, 'Conexão perdida...', State.Ended);
    }
    // se o evento do estado é Error (stream já está
    // offline quando o player é aberto)
    if (event.state === State.Error) {
      console.error('ERRO ERROR');
      setModal(true, 'Conexão perdida...', State.Error);
    }
  });

  // retorna os estados que podem ser usados nos componentes para atualizar a UI
  return {
    appIsReady,
  };
}
