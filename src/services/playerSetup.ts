import TrackPlayer, {
  AppKilledPlaybackBehavior,
  Capability,
} from 'react-native-track-player';

// imports locais
import { trackPlayerAdd } from './trackPlayerAdd';

let isPlayerInitialized: boolean = false;

// Função que inicializa o player quando o app é aberto
export async function playerSetup(): Promise<void> {
  console.log('FUNCTION PLAYER SETUP');

  if (isPlayerInitialized) {
    console.log('Player já iniciado');
    return;
  }

  try {
    await TrackPlayer.setupPlayer();
    await TrackPlayer.updateOptions({
      android: {
        appKilledPlaybackBehavior:
          AppKilledPlaybackBehavior.StopPlaybackAndRemoveNotification,
      },
      capabilities: [
        Capability.Play,
        Capability.Pause,
        Capability.Stop,
        Capability.SeekTo,
      ],
      compactCapabilities: [Capability.Play, Capability.Pause],
    });

    // adiciona o player
    await trackPlayerAdd();

    // coloca o player para tocar
    await TrackPlayer.play();

    isPlayerInitialized = true;
  } catch (err) {
    console.warn('Mensagem do catch do playerSetup', err);
    isPlayerInitialized = false;
  }
}
