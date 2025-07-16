import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import {
  ArrowRightIcon,
  ArrowPathIcon as RefreshIcon,
} from 'react-native-heroicons/outline';
import tw from 'twrnc';
import TopNavbar from '../../components/TopNavbar';
import LoadingModal from '../../components/LoadingModal';
import {
  NavigationProp,
  RouteProp,
  useNavigation,
} from '@react-navigation/native';
import { getDeviceDetails } from '../../utils/getDeviceInfo';
import { axiosInstance } from '../../api/axiosConfig';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import Animated, { FadeInUp } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAxiosWithNetworkCheck } from '../../api/useAxiosWithNetworkCheck';

interface OTPScreenProps {
  route: RouteProp<{ OTPScreen: OTPScreenRouteParams }, 'OTPScreen'>;
}

interface OTPScreenRouteParams {
  email?: string;
  phone?: string;
  password?: string;
  from?: string;
}

const OTPScreen: React.FC<OTPScreenProps> = ({ route }) => {
  const { email, phone, password, from } = route.params || {};
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [otp, setOtp] = useState<string[]>(['', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ otherError?: string }>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(90);
  const [resendAvailable, setResendAvailable] = useState(false);

  const inputs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);
    if (text && index < 4) inputs.current[index + 1]?.focus();
  };

  const handleBackspace = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && otp[index] === '' && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  useEffect(() => {
    const joinedOtp = otp.join('');
    if (joinedOtp.length === 5 && !submitting) {
      setSubmitting(true);
      const timer = setTimeout(() => {
        handleSubmit();
      }, 700);
      return () => clearTimeout(timer);
    }
  }, [otp]);

  useEffect(() => {
    if (resendCountdown > 0) {
      setResendAvailable(false);
      const interval = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setResendAvailable(true);
    }
  }, [resendCountdown]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  const { axiosRequest } = useAxiosWithNetworkCheck();


  const handleSubmit = async () => {
    const finalOtp = otp.join('');
    if (finalOtp.length < 5) return;

    console.log(finalOtp)
    try {
      setLoading(true);
      const device_info = await getDeviceDetails();

      if (from === AppRoutes.ResetPassword) { //navigate to confirmation password

        navigation.navigate(AppRoutes.ResetPasswordConfirmation, {
          email,
          phone,
          otp: finalOtp
        })
        return;
      }
      const response = await axiosRequest({
        method: "POST",
        url: "/auth/verify-account",
        data: {
          email,
          phone,
          password,
          otp: finalOtp,
          device_info,
          country_code: 'NG',
        }
      })

      if (response && response.status !== 200) {
        throw new Error(response.data?.message || 'An error occurred');
      }

      if (response && response.status === 200) {
        const accessToken = response?.data?.accessToken;
        if (accessToken) {
          await AsyncStorage.setItem('accessToken', accessToken);
          await AsyncStorage.setItem('isNewUser', "No");
        }

        setShowSuccess(true);
        setTimeout(() => {
          setShowSuccess(false);
          navigation.navigate(AppRoutes.Home as never);
        }, 1000);
      }
      setLoading(false);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'An unexpected error occurred';

      setErrors((prev) => ({ ...prev, otherError: message }));
      console.log('OTP Verification error:', error);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  const handleResendOTP = async () => {
    try {
      setLoading(true);
      const device_info = await getDeviceDetails();

      const res = await axiosInstance.post('/auth/send-verification', {
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
      console.error('Resend OTP failed:', err);
      setErrors((prev) => ({
        ...prev,
        otherError: err?.response?.data?.message || err.message,
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading && <LoadingModal />}

      {showSuccess && (
        <Animated.View
          entering={FadeInUp.duration(400)}
          style={tw`absolute z-50 bg-black/60 flex-1 justify-center items-center w-full h-full`}
        >
          <LottieView
            source={require('../../../assets/lotties/f8.json')}
            autoPlay
            loop={false}
            style={tw`w-4/5 h-72`}
          />
        </Animated.View>
      )}

      <SafeAreaView style={tw`flex-1 bg-[#020618]`}>
        <TopNavbar title="OTP Verification" />

        <View style={tw`flex-1 px-6 pt-4`}>
          <Text style={tw`text-white text-sm text-center mb-6`}>
            Enter the 5-digit OTP sent to your{' '}
            {email ? 'email address' : 'phone number'}
          </Text>

          <View style={tw`bg-[rgba(255,255,255,0.02)] rounded-xl p-4`}>
            <View style={tw`flex-row justify-between mb-4`}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => (inputs.current[index] = ref)}
                  value={digit}
                  onChangeText={(text) => {
                    setErrors((prev) => ({ ...prev, otherError: '' }));
                    if (/^\d?$/.test(text)) {
                      handleChange(text, index);
                    }
                  }}
                  onKeyPress={(e) => handleBackspace(e, index)}
                  keyboardType="number-pad"
                  maxLength={1}
                  returnKeyType="done"
                  textContentType="telephoneNumber"
                  inputMode="numeric"
                  style={tw`w-12 h-14 bg-[rgba(255,255,255,0.05)] border border-[#3c4464] text-white text-xl rounded-md text-center`}
                />
              ))}
            </View>

            <View style={tw`items-end`}>
              <TouchableOpacity
                style={tw.style(
                  `p-4 rounded-full w-14 h-14 items-center justify-center`,
                  otp.join('').length < 5 || submitting
                    ? 'bg-gray-500'
                    : 'bg-[#2299fb]'
                )}
                disabled={otp.join('').length < 5 || submitting}
                onPress={() => {
                  if (otp.join('').length === 5 && !submitting) {
                    setSubmitting(true);
                    setTimeout(() => {
                      handleSubmit();
                    }, 700);
                  }
                }}
              >
                <ArrowRightIcon size={26} color="white" />
              </TouchableOpacity>
            </View>
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

          {errors.otherError && (
            <Text style={tw`text-red-500 text-center mt-4`}>
              {errors.otherError}
            </Text>
          )}
        </View>
      </SafeAreaView>
    </>
  );
};

export default OTPScreen;
