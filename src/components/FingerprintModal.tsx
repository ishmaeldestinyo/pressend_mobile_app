import React, { useEffect } from 'react';
import { Modal, Pressable, Text, View, Alert, Platform, ToastAndroid } from 'react-native';
import ReactNativeBiometrics from 'react-native-biometrics';
import { FingerPrintIcon } from 'react-native-heroicons/outline';
import tw from 'twrnc';

export interface FingerprintModalProps {
  showFingerprintModal?: boolean;
  setShowFingerprintModal: (val: boolean) => void;
  onAuthenticated?: () => void; // Callback for successful auth
}

function FingerprintModal({
  showFingerprintModal,
  setShowFingerprintModal,
  onAuthenticated,
}: FingerprintModalProps) {
  
  // Helper function to show message per platform
  const showMessage = (message: string, title?: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      Alert.alert(title || 'Notice', message);
    }
  };

  useEffect(() => {
    if (!showFingerprintModal) return; // Only run when modal is visible

    const rnBiometrics = new ReactNativeBiometrics();

    rnBiometrics.isSensorAvailable().then(result => {
      const { available } = result;
      if (!available) {
        showMessage('Fingerprint not supported on this device');
        setShowFingerprintModal(false);
        return;
      }

      rnBiometrics
        .simplePrompt({ promptMessage: 'Confirm Payment with Fingerprint' })
        .then(resultObject => {
          const { success } = resultObject;

          if (success) {
            setShowFingerprintModal(false);
            onAuthenticated?.();
          } else {
            showMessage('Fingerprint not recognized.', 'Authentication Failed');
          }
        })
        .catch(() => {
          showMessage('Biometric authentication not available.', 'Error');
          setShowFingerprintModal(false);
        });
    });
  }, [showFingerprintModal]);

  return (
    <Modal visible={showFingerprintModal} transparent animationType="fade">
      <Pressable
        style={tw`flex-1 bg-black/50`}
        onPress={() => setShowFingerprintModal(false)}
      >
        <View style={tw`flex-1 justify-end`}>
          <View style={tw`bg-[#020618] rounded-t-2xl px-6 py-4 max-h-[40%]`}>
            <Text style={tw`text-white text-center text-lg mb-4`}>
              Fingerprint Confirmation
            </Text>
            <FingerPrintIcon size={48} color="white" style={tw`self-center mb-3`} />
            <Text style={tw`text-white text-center`}>Place your finger on the sensor.</Text>
          </View>
        </View>
      </Pressable>
    </Modal>
  );
}

export default FingerprintModal;
