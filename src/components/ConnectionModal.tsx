import {StyleSheet, TouchableOpacity} from "react-native";
import {ActivityIndicator, Modal, Text, View} from "react-native";
import {MaterialIcons} from "@expo/vector-icons";
import React from "react";
import TrackPlayer from "react-native-track-player";

type Props = {
  visible: boolean;
  loading: boolean;
  message: string | null;
  setVisible: React.Dispatch<React.SetStateAction<boolean>>
};

export const ConnectionModal = ({visible, message, setVisible}: Props) => {

  const onCancel = async () => {
    try {
      await TrackPlayer.stop();
    } catch (err) {
      console.warn('Erro ao cancelar o player:', err);
    } finally {
      setVisible(false);
    }
  }
  
  return (
    <Modal visible={visible}  transparent animationType={'fade'} onRequestClose={() => setVisible(false) }>
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Sem Conexão</Text>
          <Text style={styles.text} >{message}</Text>

          <View style={styles.buttons}>
            <View style={styles.btn}>
              <TouchableOpacity onPress={onCancel}>
                <Text>OK</Text>
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
    justifyContent: 'center',
  },
  btn: {
    flex: 1,
    marginHorizontal: 6,
  },
});