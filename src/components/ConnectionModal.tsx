import {useEffect, useState} from "react";
import {StyleSheet, TouchableOpacity} from "react-native";
import {ActivityIndicator, DeviceEventEmitter, Modal, Text, View} from "react-native";
import TrackPlayer, {State, usePlaybackState} from "react-native-track-player";
import {playerSetup} from "../services/playerSetup";
import {MaterialIcons} from "@expo/vector-icons";
import {Player} from "react-native-track-player/lib/web/TrackPlayer";

export const ConnectionModal = () => {
  const playbackState = usePlaybackState();
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState<string>('Sem conexão...');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('Chamou o useEffects');
    const sub = DeviceEventEmitter.addListener('CONNECTION_ERROR', (payload) => {
      setMessage(payload.message || 'Sem conexão');
      setVisible(true);
    });

    return () => {
      sub.remove()
    }
  }, []);

  const onCancel = async () => {
    try {
      await TrackPlayer.stop();
      await TrackPlayer.reset();
    }catch (err) {
      console.warn('Erro ao cancelar o player:', err);
    } finally {
      setLoading(false);
    }
  };

  const onReconnect = async () => {
    setLoading(true);

    try {
      await playerSetup();

      if (playbackState.state === State.Playing) {
        setLoading(false);
        setVisible(false);
      } else {
        await playerSetup();
      }
    } catch (error) {
      console.warn('Erro ao reconectar:', error);
    }
    //
    // try {
    //   // Para o player (foreground) e tenta limpar/resetar para garantir que não fique rodando em background
    //   const connected = await playerSetup();
    //   console.log("Connected", connected);
    //
    //   if (connected) {
    //     setVisible(false);
    //   } else {
    //     setMessage('Sem conexão... tente novamente');
    //     await TrackPlayer.play();
    //     // permanece aberta e exibe mensagem (opcional)
    //   }
    // } catch (err) {
    //   console.warn('Erro ao reconectar:', err);
    //   setMessage('Sem conexão — tente novamente');
    // } finally {
    //   setLoading(false);
    // }
  };

  return (
    <Modal visible={visible}  transparent animationType={'fade'} onRequestClose={() => setVisible(false) }>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Sem Conexão</Text>
          <Text style={styles.text} >{message}</Text>

          {
            loading ? <ActivityIndicator style={{ marginVertical: 12}}/> : null
          }

          <View style={styles.buttons}>
            <View style={styles.btn}>
              <TouchableOpacity onPress={onCancel}>
                <MaterialIcons name={'stop'} />
              </TouchableOpacity>
            </View>
            <View>
              <TouchableOpacity onPress={onReconnect}>
                <MaterialIcons name={'play-arrow'} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '80%',
    backgroundColor: 'rgba(0,11,17,0.8)',
    borderRadius: 12,
    padding: 18,
  },
  title: {
    fontSize: 18,
    fontFamily: 'Michroma',
    fontWeight: '700',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Michroma',
    marginBottom: 12,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
  },
  btn: {
    flex: 1,
    marginHorizontal: 6,
  },
});