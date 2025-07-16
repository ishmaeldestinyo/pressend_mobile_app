import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';
import Checkbox from '@react-native-community/checkbox';
import tw from 'twrnc';
import Animated, {
  FadeInLeft,
  FadeInRight,
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { getDeviceDetails } from '../../utils/getDeviceInfo';
import LoadingModal from '../../components/LoadingModal';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import { useNavigation } from '@react-navigation/native';
import {
  EyeIcon,
  EyeSlashIcon,
  EnvelopeIcon,
  PhoneIcon,
  FingerPrintIcon,
} from 'react-native-heroicons/outline';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/userContext';
import { useAxiosWithNetworkCheck } from '../../api/useAxiosWithNetworkCheck';

interface InputErrors {
  email?: string;
  phone?: string;
  password?: string;
  otherError?: string;
}

function ImportWallet() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [activeTab, setActiveTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<InputErrors>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const { setAuthUser } = useAuth();

  const emailShake = useSharedValue(0);
  const phoneShake = useSharedValue(0);
  const passwordShake = useSharedValue(0);

  const getShakeStyle = (shakeVal: any) =>
    useAnimatedStyle(() => ({
      transform: [{ translateX: shakeVal.value }],
    }));

  const handleNavigate = (target: keyof RootStackParamList) => {
    navigation.navigate(target);
  };

  const shake = (field: 'email' | 'phone' | 'password') => {
    const sv =
      field === 'email' ? emailShake : field === 'phone' ? phoneShake : passwordShake;

    sv.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const emailStyle = getShakeStyle(emailShake);
  const phoneStyle = getShakeStyle(phoneShake);
  const passwordStyle = getShakeStyle(passwordShake);

  const validate = () => {
    const newErrors: InputErrors = {};

    if (activeTab === 'email') {
      if (!email) {
        newErrors.email = 'Email is required';
        shake('email');
      } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        newErrors.email = 'Invalid email format';
        shake('email');
      }
    } else {
      if (!phone) {
        newErrors.phone = 'Phone number is required';
        shake('phone');
      } else if (!/^\d{10,15}$/.test(phone)) {
        newErrors.phone = 'Phone number is invalid';
        shake('phone');
      }
    }

    if (!password) {
      newErrors.password = 'Password is required';
      shake('password');
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      shake('password');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const { axiosRequest } = useAxiosWithNetworkCheck();

  const signInHandler = async () => {

    setLoading(true);
    try {
      const device_info = await getDeviceDetails();

      const response = await axiosRequest({
        method: 'POST',
        url: '/auth/login',
        data: {
          email,
          phone,
          password,
          device_info,
          country_code: 'NG',
        }
      })

      if (response && response.status !== 200) {
        throw new Error(response.data?.message || 'An error occurred');
      }

      if (response && response?.status === 200) {
        setLoading(false);
        setShowSuccess(true);

        const accessToken = response?.data?.accessToken;
        if (accessToken) {
          setAuthUser(response?.data);
          await AsyncStorage.setItem('accessToken', accessToken);
        }

        setShowSuccess(false);
        navigation.navigate(AppRoutes.Home as never);
      }

      setLoading(false);

    } catch (error: any) {
      setLoading(false);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'An unexpected error occurred';

      setErrors(prev => ({ ...prev, otherError: message }));
      console.log('Signup error:', error);
    } finally {
      setLoading(false)
    }
  };

  return (
    <>
      {loading && <LoadingModal />}

      <SafeAreaView style={tw`flex-1 bg-[#020618]`}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={tw`flex-1`}
        >
          <ScrollView contentContainerStyle={tw`px-5 pb-28 pt-4`}>

            <View style={tw`flex-row border-b border-[#3c4464] rounded-lg mb-6`}>
              <TouchableOpacity
                style={tw.style(`flex-1 py-3 items-center`, activeTab === 'email' ? 'bg-[#2299fb] rounded-tr-xl' : '')}
                onPress={() => setActiveTab('email')}
              >
                <Text style={tw.style(`text-sm`, activeTab === 'email' ? 'text-white font-bold' : 'text-gray-300')}>
                  Continue with Email
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={tw.style(`flex-1 py-3 items-center`, activeTab === 'phone' ? 'bg-[#2299fb] rounded-tl-2xl' : '')}
                onPress={() => setActiveTab('phone')}
              >
                <Text style={tw.style(`text-sm`, activeTab === 'phone' ? 'text-white font-bold' : 'text-gray-300')}>
                  Continue with Phone
                </Text>
              </TouchableOpacity>
            </View>


            {activeTab === 'email' ? (
              <Animated.View entering={FadeInLeft.duration(300)} style={emailStyle}>
                <View style={tw`mb-1`}>
                  <View style={tw`relative`}>
                    <EnvelopeIcon size={20} color="#ccc" style={tw`absolute left-3 top-3`} />
                    <TextInput
                      placeholder="Enter Email"
                      placeholderTextColor="#9ca3af"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      style={tw`border border-[#3c4464] bg-[rgba(255,255,255,0.05)] text-white rounded-lg pl-10 py-2`}
                    />
                  </View>
                  <View style={tw`min-h-5 mt-1`}>
                    {errors.email && <Text style={tw`text-red-500`}>{errors.email}</Text>}
                  </View>
                </View>
              </Animated.View>
            ) : (
              <Animated.View entering={FadeInRight.duration(300)} style={phoneStyle}>
                <View style={tw`mb-1`}>
                  <View style={tw`relative`}>
                    <PhoneIcon size={20} color="#ccc" style={tw`absolute left-3 top-3`} />
                    <TextInput
                      placeholder="09027585555"
                      placeholderTextColor="#9ca3af"
                      value={phone}
                      onChangeText={setPhone}
                      keyboardType="phone-pad"
                      style={tw`border border-[#3c4464] bg-[rgba(255,255,255,0.05)] text-white rounded-lg pl-10 py-2`}
                    />
                  </View>
                  <View style={tw`min-h-5 mt-1`}>
                    {errors.phone && <Text style={tw`text-red-500`}>{errors.phone}</Text>}
                  </View>
                </View>
              </Animated.View>
            )}

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
                  {errors.password && <Text style={tw`text-red-500`}>{errors.password}</Text>}
                </View>
              </View>
            </Animated.View>
            {errors.otherError && (
              <Text style={tw`text-red-500 text-center mb-3`}>{errors.otherError}</Text>
            )}
            <View style={tw`flex-row items-center mt-0`}>
              <Checkbox
                value={agreed}
                onValueChange={setAgreed}
                tintColors={{ true: '#3B82F6', false: '#6b7280' }}
              />
              <Text style={tw`ml-2 text-gray-300`}>
                Keep me logged in!
              </Text>
            </View>

          </ScrollView>

          <View style={tw`absolute bottom-16 left-5 right-5`}>
            <TouchableOpacity
              style={tw.style(`py-3 rounded-xl items-center`, email && password ? 'bg-[#2299fb]' : 'bg-gray-500')}
              onPress={signInHandler}
              disabled={!email || !password}
            >
              <Text style={tw`text-white font-semibold text-base`}>Submit</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`absolute bottom-5 left-0 right-0 items-center`}>
            <Text style={tw`text-gray-400`}>
              New account?{' '}
              <Text style={tw`text-blue-400`} onPress={() => handleNavigate(AppRoutes.CreateWallet)}>
                Signup
              </Text>{' '}or{' '}
              <Text style={tw`text-blue-400`} onPress={() => handleNavigate(AppRoutes.ResetPassword)}>
                Reset Password
              </Text>
            </Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </>
  );
}

export default ImportWallet;
