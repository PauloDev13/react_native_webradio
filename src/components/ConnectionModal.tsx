import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import TrackPlayer, { State } from 'react-native-track-player';

// imports locais
import { trackPlayerAdd } from '../services/trackPlayerAdd';
import { useStoreModal } from '../store/storeModal';

export const ConnectionModal = () => {
  const { visible, message, statePlayer, setModal } = useStoreModal();

  const onReconnect = async () => {
    if (statePlayer === State.Ended) {
      try {
        await TrackPlayer.reset();

        await trackPlayerAdd();

        await TrackPlayer.play();
      } catch (e) {
        console.error('Erro ao reconectar servidor', e);
      }
      setModal(false);
    }

    if (statePlayer === 'error') {
      await TrackPlayer.play();
      setModal(false);
    }
  };
  return (
    <Modal
      visible={visible}
      transparent
      animationType={'fade'}
      onRequestClose={() => setModal(false)}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>WR Parque Verde</Text>
          <Text style={styles.text}>{message}</Text>
          <View style={styles.buttons}>
            <TouchableOpacity onPress={onReconnect} style={styles.btn}>
              <Text style={styles.textButton}>Conectar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,11,17,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modal: {
    width: '70%',
    borderWidth: 1,
    borderColor: 'rgba(3,235,255,0.6)',
    backgroundColor: 'rgba(0,11,17,0.6)',
    borderRadius: 12,
    padding: 18,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Michroma',
    color: '#03ebff',
    textAlign: 'center',
    marginBottom: 8,
  },
  text: {
    fontSize: 14,
    fontFamily: 'Michroma',
    color: '#fff',
    marginBottom: 20,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    height: 35,
    width: 90,
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: 2,
    borderColor: 'rgba(3,235,255,0.6)',
    backgroundColor: 'transparent',
    alignItems: 'center',
  },
  textButton: {
    color: '#03ebff',
    fontFamily: 'Michroma',
    fontSize: 14,
  },
});
