// [No change to imports or top boilerplate — keep as-is]
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
  useWindowDimensions,
} from 'react-native';
import Checkbox from '@react-native-community/checkbox';
import tw from 'twrnc';
import Animated, {
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
  FingerPrintIcon,
  UserIcon,
} from 'react-native-heroicons/outline';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAxiosWithNetworkCheck } from '../../api/useAxiosWithNetworkCheck';

interface InputErrors {
  email?: string;
  password?: string;
  otherError?: string;
  firstName?: string;
  lastName?: string;
}

function CreateWallet() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { height } = useWindowDimensions();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<InputErrors>({});
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const firstNameShake = useSharedValue(0);
  const lastNameShake = useSharedValue(0);
  const emailShake = useSharedValue(0);
  const passwordShake = useSharedValue(0);

  const getShakeStyle = (shakeVal: any) =>
    useAnimatedStyle(() => ({
      transform: [{ translateX: shakeVal.value }],
    }));

  const handleNavigate = (target: keyof RootStackParamList) => {
    navigation.navigate(target);
  };

  const shake = (field: 'first_name' | 'last_name' | 'email' | 'password') => {
    const sv =
      field === 'first_name'
        ? firstNameShake
        : field === 'last_name'
          ? lastNameShake
          : field === 'email'
            ? emailShake
            : passwordShake;

    sv.value = withSequence(
      withTiming(-8, { duration: 50 }),
      withTiming(8, { duration: 50 }),
      withTiming(-5, { duration: 50 }),
      withTiming(5, { duration: 50 }),
      withTiming(0, { duration: 50 })
    );
  };

  const { axiosRequest } = useAxiosWithNetworkCheck();

  const firstNameStyle = getShakeStyle(firstNameShake);
  const lastNameStyle = getShakeStyle(lastNameShake);
  const emailStyle = getShakeStyle(emailShake);
  const passwordStyle = getShakeStyle(passwordShake);

  const validate = () => {
    const newErrors: InputErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required';
      shake('first_name');
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      shake('last_name');
    }

    if (!email) {
      newErrors.email = 'Email is required';
      shake('email');
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
      newErrors.email = 'Invalid email format';
      shake('email');
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

  const signupHandler = async () => {
    if (!agreed || !validate()) return;

    setLoading(true);
    try {
      const device_info = await getDeviceDetails();

      const response = await axiosRequest({
        method: 'POST',
        url: '/auth',
        data: {
          first_name: firstName,
          last_name: lastName,
          email,
          password,
          device_info,
          country_code: 'NG',
        },
      });

      if (!response) {
        setLoading(false);
        return;
      }

      if (response && response!.status !== 201) {
        throw new Error(response!.data?.message || 'An error occurred');
      }

      if (response && response?.status === 201) {
        setShowSuccess(true);
        setShowSuccess(false);
        navigation.navigate(AppRoutes.OTPCode, { email });
      }

      return;

    } catch (error: any) {
      setLoading(false);
      const message =
        error?.response?.data?.message ||
        error?.message ||
        'An unexpected error occurred';
      setErrors(prev => ({ ...prev, otherError: message }));
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
          <ScrollView
            contentContainerStyle={[tw`px-5 pt-8`, { paddingBottom: height * 0.3 }]}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={tw`text-white text-xl font-bold text-center mb-2`}>
              Create Account
            </Text>
            <Text style={tw`text-white text-sm text-center mb-6`}>
              Let's get you started with a new account
            </Text>

            {/* First and Last Name (DO NOT TOUCH) */}
            <View style={tw`flex-row justify-between mb-4`}>
              <Animated.View style={[firstNameStyle, tw`flex-1 mr-2`]}>
                <View style={tw`relative`}>
                  <UserIcon size={20} color="#ccc" style={tw`absolute left-3 top-3`} />
                  <TextInput
                    placeholder="First Name"
                    placeholderTextColor="#9ca3af"
                    value={firstName}
                    onChangeText={(text) => {
                      setFirstName(text);
                      setErrors((prev) => ({ ...prev, firstName: '' }));
                    }}
                    style={tw`border border-[#3c4464] bg-[rgba(255,255,255,0.05)] text-white rounded-lg pl-10 py-2`}
                  />
                </View>
                <Text style={tw`text-red-500 mt-1 min-h-5`}>
                  {errors.firstName || ' '}
                </Text>
              </Animated.View>

              <Animated.View style={[lastNameStyle, tw`flex-1`]}>
                <View style={tw`relative`}>
                  <UserIcon size={20} color="#ccc" style={tw`absolute left-3 top-3`} />
                  <TextInput
                    placeholder="Last Name"
                    placeholderTextColor="#9ca3af"
                    value={lastName}
                    onChangeText={(text) => {
                      setLastName(text);
                      setErrors((prev) => ({ ...prev, lastName: '' }));
                    }}
                    style={tw`border border-[#3c4464] bg-[rgba(255,255,255,0.05)] text-white rounded-lg pl-10 py-2`}
                  />
                </View>
                <Text style={tw`text-red-500 mt-1 min-h-5`}>
                  {errors.lastName || ' '}
                </Text>
              </Animated.View>
            </View>

            <Animated.View style={[emailStyle, tw`mb-4`]}>
              <View style={tw`relative`}>
                <EnvelopeIcon size={20} color="#ccc" style={tw`absolute left-3 top-3`} />
                <TextInput
                  placeholder="Enter Email"
                  placeholderTextColor="#9ca3af"
                  value={email}
                  onChangeText={(text) => {
                    setEmail(text);
                    setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  style={tw`border border-[#3c4464] bg-[rgba(255,255,255,0.05)] text-white rounded-lg pl-10 py-2`}
                />
              </View>
              <Text style={tw`text-red-500 mt-1 min-h-5`}>
                {errors.email || ' '}
              </Text>
            </Animated.View>

            <Animated.View style={[passwordStyle, tw`mb-0`]}>
              <View style={tw`relative`}>
                <FingerPrintIcon size={20} color="#ccc" style={tw`absolute left-3 top-3`} />
                <TextInput
                  placeholder="Enter Password"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setErrors((prev) => ({ ...prev, password: '' }));
                  }}
                  secureTextEntry={!showPassword}
                  style={tw`border border-[#3c4464] bg-[rgba(255,255,255,0.05)] text-white rounded-lg pl-10 pr-10 py-2`}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={tw`absolute right-3 top-3`}
                >
                  {showPassword ? <EyeSlashIcon size={20} color="#ccc" /> : <EyeIcon size={20} color="#ccc" />}
                </TouchableOpacity>
              </View>
              <Text style={tw`text-red-500 mt-1 min-h-5`}>
                {errors.password || ' '}
              </Text>
            </Animated.View>

            {errors.otherError && (
              <Text style={tw`text-red-500 text-center mt-3`}>{errors.otherError}</Text>
            )}

            <View style={tw`flex-row items-center mt-4`}>
              <Checkbox
                value={agreed}
                onValueChange={setAgreed}
                tintColors={{ true: '#3B82F6', false: '#6b7280' }}
              />
              <Text style={tw`ml-2 text-gray-300`}>
                I agree to Pressend’s Terms and Conditions
              </Text>
            </View>
          </ScrollView>

          <View style={tw`absolute bottom-16 px-5 w-full`}>
            <TouchableOpacity
              style={tw.style(`py-3 rounded-xl items-center`, agreed ? 'bg-[#2299fb]' : 'bg-gray-500')}
              onPress={signupHandler}
              disabled={!agreed}
            >
              <Text style={tw`text-white font-semibold text-base`}>Sign up</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`absolute bottom-5 left-0 right-0 items-center`}>
            <Text style={tw`text-gray-400 text-center`}>
              <Text style={tw`text-blue-400`} onPress={() => handleNavigate(AppRoutes.ImportWallet)}>
                Login
              </Text>{' '}
              or{' '}
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

export default CreateWallet;
