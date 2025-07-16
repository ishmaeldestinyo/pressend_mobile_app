import { Platform, ToastAndroid, Alert } from 'react-native';

export function showNoInternetToast() {
  const message = 'No internet connection';

  if (Platform.OS === 'android') {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  } else {
    Alert.alert('Network Error', message);
  }
}
