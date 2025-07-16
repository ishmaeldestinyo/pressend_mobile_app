import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { EnvelopeIcon } from 'react-native-heroicons/outline';
import tw from 'twrnc';
import TopNavbar from '../../components/TopNavbar';
import LoadingModal from '../../components/LoadingModal';
import { getDeviceDetails } from '../../utils/getDeviceInfo';
import { useNavigation } from '@react-navigation/native';
import { axiosInstance } from '../../api/axiosConfig';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import { useAxiosWithNetworkCheck } from '../../api/useAxiosWithNetworkCheck';

const ResetPasswordScreen = () => {
  const navigation = useNavigation();
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string; other?: string }>({});
  const [loading, setLoading] = useState(false);

  const { axiosRequest } = useAxiosWithNetworkCheck();

  const validate = () => {
    const errorObj: typeof errors = {};
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      errorObj.email = 'Enter a valid email address';
    }
    setErrors(errorObj);
    return Object.keys(errorObj).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);
      const device_info = await getDeviceDetails();

      const res = await axiosRequest({
        method: "POST",
        url: "/auth/send-verification",
        data: {
          email,
          device_info,
          country_code: 'NG',
        }
      })


      if (res && res.status !== 200) {
        throw new Error(res?.data?.message || 'An error occurred');
      }

      if (res && res.status === 200) {
        setLoading(false);
        navigation.navigate(AppRoutes.OTPCode, { email, from: AppRoutes.ResetPassword });
      }
      setLoading(false);
      return;

    } catch (err: any) {
      setLoading(false);
      const message =
        err?.response?.data?.message ||
        err?.message ||
        'An unexpected error occurred';
      setErrors({ other: message });
    }
  };


  const handleNavigate = (target: keyof RootStackParamList) => {
    navigation.navigate(target);
  };

  return (
    <>
      {loading && <LoadingModal />}
      <SafeAreaView style={tw`flex-1 bg-[#020618]`}>
        <TopNavbar title="Reset Password" />

        <KeyboardAvoidingView
          style={tw`flex-1`}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <View style={tw`flex-1 px-5 pt-8`}>
            <Text style={tw`text-gray-400 text-sm mb-2`}>
              Enter your email to receive an OTP
            </Text>

            <View style={tw`relative`}>
              <EnvelopeIcon size={20} color="#ccc" style={tw`absolute left-3 top-3`} />
              <TextInput
                placeholder="Enter Email"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={tw`border border-[#3c4464] bg-[rgba(255,255,255,0.05)] text-white rounded-lg pl-10 py-2`}
              />
            </View>

            {errors.email && <Text style={tw`text-red-500 mt-2`}>{errors.email}</Text>}
            {errors.other && <Text style={tw`text-red-500 mt-2`}>{errors.other}</Text>}
          </View>

          <View style={tw` mb-5 items-center`}>
            <Text style={tw`text-gray-400`}>
              Don't have an account?{' '}
              <Text style={tw`text-blue-400`} onPress={() => handleNavigate(AppRoutes.CreateWallet)}>
                Signup
              </Text>{' '}or{' '}
              <Text style={tw`text-blue-400`} onPress={() => handleNavigate(AppRoutes.ResetPassword)}>
                Login
              </Text>
            </Text>
          </View>

          <View style={tw`px-5 pb-10`}>
            <TouchableOpacity
              style={tw.style(
                `py-3 rounded-xl items-center`,
                /\S+@\S+\.\S+/.test(email) ? 'bg-[#2299fb]' : 'bg-gray-500'
              )}
              onPress={handleSubmit}
              disabled={!/\S+@\S+\.\S+/.test(email)} // ✅ email must be valid
            >
              <Text style={tw`text-white font-semibold text-base`}>Reset</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
};

export default ResetPasswordScreen;
