import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

// imports locais
import { FONT_DEFAULT } from '../constants';
import { playerSetup } from '../services/playerSetup';

// Impede que a splash screen desapareça antes das fontes carregarem
SplashScreen.preventAutoHideAsync();

export function useRadioPlayer() {
  const [appIsReady, setAppIsReady] = useState<boolean>(false);

  // hook de carregamento das fontes
  useEffect(() => {
    console.log('USE EFFECT CARREGAMENTO FONTES');
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

  // hook de Inicialização do player
  useEffect(() => {
    console.log('USE EFFECT INICIALIZAÇÃO DO PLAYER');

    if (!appIsReady) return;

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

  // retorna os estados que podem ser usados nos componentes para atualizar a UI
  return {
    appIsReady,
  };
}
