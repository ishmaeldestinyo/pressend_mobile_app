import React, { useEffect, useState } from 'react';
import {
  View,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { ArrowRightIcon, EyeIcon, EyeSlashIcon, FingerPrintIcon, ArrowPathIcon as RefreshIcon } from 'react-native-heroicons/outline';
import tw from 'twrnc';
import TopNavbar from '../../components/TopNavbar';
import LoadingModal from '../../components/LoadingModal';
import { getDeviceDetails } from '../../utils/getDeviceInfo';
import { axiosInstance } from '../../api/axiosConfig';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import { NavigationProp, RouteProp, useNavigation } from '@react-navigation/native';
import { LockClosedIcon } from 'react-native-heroicons/solid';
import Animated, { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

interface ResetPasswordConfirmationProps {
  route: RouteProp<{ ResetPasswordConfirmation: { email?: string; phone?: string; otp: string } }, 'ResetPasswordConfirmation'>;
}

const ResetPasswordConfirmation: React.FC<ResetPasswordConfirmationProps> = ({ route }) => {
  const { email, phone, otp } = route.params;
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(90);
  const [resendAvailable, setResendAvailable] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const handleSubmit = async () => {
    if (!password) return;

    try {
      setLoading(true);
      const device_info = await getDeviceDetails();

      console.log(email, phone, password, otp);
      const res = await axiosInstance.post('/auth/resetpassword/submit', {
        email,
        phone,
        new_password: password,
        otp,
        device_info,
        country_code: 'NG',
      });

      if (res.status !== 200) {
        throw new Error(res?.data?.message || 'Reset failed');
      }

      navigation.navigate(AppRoutes.ImportWallet);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const device_info = await getDeviceDetails();

      const res = await axiosInstance.post('/auth/resetpassword/request', {
        email,
        phone,
        device_info,
        country_code: 'NG',
      });

      if (res.status !== 200) {
        throw new Error(res?.data?.message || 'Could not resend OTP');
      }

      setResendCountdown(90);
      setResendAvailable(false);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resendCountdown > 0) {
      const interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setResendAvailable(true);
    }
  }, [resendCountdown]);

  const getShakeStyle = (shakeVal: any) =>
    useAnimatedStyle(() => ({
      transform: [{ translateX: shakeVal.value }],
    }));

      const [showPassword, setShowPassword] = useState(false);

  const passwordShake = useSharedValue(0);

   const [showSuccess, setShowSuccess] = useState(false);
  
  const passwordStyle = getShakeStyle(passwordShake);

  return (
    <>
      {loading && <LoadingModal />}
      <SafeAreaView style={tw`flex-1 bg-[#020618]`}>
        <TopNavbar title="Reset Password" />
        <View style={tw`flex-1 px-6 pt-4`}>
          <Text style={tw`text-white text-sm text-center mb-6`}>
            Enter your new password to reset your account
          </Text>

          <View style={tw`bg-[rgba(255,255,255,0.02)] rounded-xl p-4`}>
            <Animated.View style={passwordStyle}>
              <View style={tw`mb-0 relative`}>
                <FingerPrintIcon size={20} color="#ccc" style={tw`absolute left-3 top-3`} />
                <TextInput
                  placeholder="Enter Password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  style={tw`border border-[#3c4464] bg-[rgba(255,255,255,0.05)] text-white rounded-lg pl-10 pr-10 py-2`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={tw`absolute right-3 top-3`}
                >
                  {showPassword ? <EyeSlashIcon size={20} color="#ccc" /> : <EyeIcon size={20} color="#ccc" />}
                </TouchableOpacity>
                <View style={tw`min-h-5 mt-1`}>
                  {error && <Text style={tw`text-red-500`}>{error}</Text>}
                </View>
              </View>
            </Animated.View>

            <TouchableOpacity
              style={tw.style(
                `mt-6 p-4 rounded-full items-center justify-center`,
                password ? 'bg-[#2299fb]' : 'bg-gray-500'
              )}
              disabled={!password}
              onPress={handleSubmit}
            >
              <Text style={tw`text-white`}>Submit</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row justify-center items-center mt-6`}>
            <TouchableOpacity
              onPress={handleResendOTP}
              disabled={!resendAvailable}
              style={tw`flex-row items-center`}
            >
              <RefreshIcon
                size={20}
                color={resendAvailable ? 'white' : '#555'}
              />
              <Text
                style={tw.style(
                  `ml-2`,
                  resendAvailable ? `text-white` : `text-gray-500`
                )}
              >
                {resendAvailable
                  ? 'Resend OTP'
                  : `Resend in ${formatTime(resendCountdown)}`}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </>
  );
};

export default ResetPasswordConfirmation;
