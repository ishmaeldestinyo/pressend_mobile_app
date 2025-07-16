import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  useColorScheme,
  View,
} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Onboarding from './src/screens/onboarding/Onboarding';
import ImportWallet from './src/screens/auth/ImportWallet';
import CreateWallet from './src/screens/auth/CreateWallet';
import Home from './src/screens/dashboard/Home';
import SecurityDashboard from './src/screens/settings/SecurityDashboard';
import TokenExplorer from './src/screens/dashboard/TokenExplorer';
import ListBillPayment from './src/screens/billpayment/ListBillPayment';
import TransferAssetList from './src/screens/transfer/TransferAssetList';
import WithdrawAssetList from './src/screens/transfer/WithdrawAssetList';
import RecieveAssetsList from './src/screens/recieve/RecieveAssetsList';
import ResetPasswordScreen from './src/screens/auth/ResetPasswordScreen';
import OTPScreen from './src/screens/auth/OTPScreen';
import ResetPasswordConfirmation from './src/screens/auth/ResetPasswordConfirmation';
import ListTransaction from './src/screens/transaction/ListTransaction';
import SetTagname from './src/screens/dashboard/SetTagname';
import SetPaymentPin from './src/screens/transaction/SetPaymentPin';
import SetPalmprint from './src/screens/transaction/SetPalmprint';
import EnableFingerprint from './src/screens/transaction/EnableFingerprint';
import DetailTransactionViaTagTransfer from './src/screens/transaction/DetailTransactionViaTagTransfer';
import ReportTransaction from './src/screens/transaction/ReportTransaction';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors } from './src/constants/colors';
import { AppRoutes, RootStackParamList } from './src/constants/routes';
import { AuthProvider } from './src/context/userContext';

import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { NetworkProvider } from './src/context/NetworkContext';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const isDarkMode = useColorScheme() === 'dark';

  const [newUser, setNewUser] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem('isNewUser')
      .then((res) => {
        setNewUser(res);
        console.log('isNewUser:', res);
      })
      .catch((err) => {
        console.log('Error getting isNewUser:', err);
      })
      .finally(() => {
        setIsReady(true);
      });
  }, []);

  if (!isReady) return null;

  return (
    <NetworkProvider> 
      <AuthProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <SafeAreaView style={{ flex: 1, backgroundColor: Colors.backgroundColor }}>
              <StatusBar
                barStyle="light-content"
                backgroundColor={Colors.backgroundColor}
              />
              <KeyboardAvoidingView
                style={{ flex: 1 }}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : StatusBar.currentHeight || 0}
              >
                <View style={{ flex: 1 }}>
                  <Stack.Navigator
                    initialRouteName={
                      newUser === 'No' ? AppRoutes.ListTransaction : AppRoutes.Onboarding
                    }
                    screenOptions={{ headerShown: false }}
                  >
                    <Stack.Screen name={AppRoutes.Onboarding} component={Onboarding} />
                    <Stack.Screen name={AppRoutes.ImportWallet} component={ImportWallet} />
                    <Stack.Screen name={AppRoutes.ListTransaction} component={ListTransaction} />
                    <Stack.Screen name={AppRoutes.CreateWallet} component={CreateWallet} />
                    <Stack.Screen name={AppRoutes.Home} component={Home} />
                    <Stack.Screen name={AppRoutes.SecurityDashboard} component={SecurityDashboard} />
                    <Stack.Screen name={AppRoutes.Explorer} component={TokenExplorer} />
                    <Stack.Screen name={AppRoutes.BillPayment} component={ListBillPayment} />
                    <Stack.Screen name={AppRoutes.TransferAssetList} component={TransferAssetList} />
                    <Stack.Screen name={AppRoutes.WithdrawAssetList} component={WithdrawAssetList} />
                    <Stack.Screen name={AppRoutes.RecieveAssetsList} component={RecieveAssetsList} />
                    <Stack.Screen name={AppRoutes.SetTagname} component={SetTagname} />
                    <Stack.Screen name={AppRoutes.ResetPassword} component={ResetPasswordScreen} />
                    <Stack.Screen name={AppRoutes.SetPaymentPin} component={SetPaymentPin} />
                    <Stack.Screen name={AppRoutes.SetPalmprint} component={SetPalmprint} />
                    <Stack.Screen name={AppRoutes.EnableFingerprint} component={EnableFingerprint} />
                    <Stack.Screen name={AppRoutes.ReportTransaction} component={ReportTransaction} />
                    <Stack.Screen
                      name={AppRoutes.DetailTransactionViaTagTransfer}
                      component={DetailTransactionViaTagTransfer}
                    />
                    <Stack.Screen
                      name={AppRoutes.ResetPasswordConfirmation}
                      component={ResetPasswordConfirmation}
                    />
                    <Stack.Screen name={AppRoutes.OTPCode} component={OTPScreen} />
                  </Stack.Navigator>
                </View>
              </KeyboardAvoidingView>
            </SafeAreaView>
          </NavigationContainer>
        </SafeAreaProvider>
      </AuthProvider>
    </NetworkProvider>
  );
}
