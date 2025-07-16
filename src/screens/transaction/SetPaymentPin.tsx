import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import TopNavbar from '../../components/TopNavbar';
import tw from 'twrnc';
import LoadingModal from '../../components/LoadingModal';
import { axiosInstance } from '../../api/axiosConfig';
import Animated, { FadeInUp, FadeIn, FadeOut } from 'react-native-reanimated';
import LottieView from 'lottie-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SetPaymentPin = () => {
  const [pin, setPin] = useState<string[]>(['', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [tooltipMessage, setTooltipMessage] = useState('');

  const handlePinButtonPress = (num: string) => {
    const nextPin = [...pin];
    const emptyIndex = nextPin.findIndex((d) => d === '');
    if (emptyIndex !== -1) {
      nextPin[emptyIndex] = num;
      setPin(nextPin);
      if (error) setError('');
    }
  };

  const handlePinBackspace = () => {
    const nextPin = [...pin];
    const lastFilledIndex = nextPin.slice().reverse().findIndex((d) => d !== '');
    if (lastFilledIndex !== -1) {
      const idx = nextPin.length - 1 - lastFilledIndex;
      nextPin[idx] = '';
      setPin(nextPin);
      if (error) setError('');
    }
  };

  const submitPin = async () => {
    if (pin.some((d) => d === '')) {
      setError('Please enter a 4-digit PIN');
      return;
    }

    setError('');
    setTooltipMessage('');
    setLoading(true);

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await axiosInstance.post(
        '/accounts/set-payment-pin',
        { payment_pin: pin.join('') },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );

      if (response.status === 201) {
        setTooltipMessage(response.data.message || 'PIN set successfully!');
        setShowSuccess(true);
        setPin(['', '', '', '']);
        setTimeout(() => setShowSuccess(false), 2500);
        setTimeout(() => setTooltipMessage(''), 1000); // Hide tooltip after 1s
      } else {
        setError('Something went wrong, please try again.');
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || 'Failed to set PIN');
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
      <View style={tw`flex-1 bg-[#020618]`}>
        <TopNavbar title="Set Payment Pin" />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={tw`flex-1 px-6`}
        >
          <View style={tw`flex-1 justify-end`}>
            <ScrollView
              contentContainerStyle={tw`items-center`}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={tw`text-white text-xl mb-6 text-center`}>
                Enter your new 4-digit PIN
              </Text>

              {/* PIN Display */}
              <View
                style={tw`flex-row justify-between w-full max-w-xs ${
                  error ? '' : 'mb-6'
                }`}
              >
                {pin.map((digit, idx) => (
                  <View
                    key={idx}
                    style={tw`w-14 h-14 border border-[#3c4464] rounded-md items-center justify-center`}
                  >
                    <Text style={tw`text-white text-2xl`}>{digit ? '•' : ''}</Text>
                  </View>
                ))}
              </View>

              {error ? (
                <Text
                  style={tw`text-red-500 mt-4 mb-6 text-center w-full max-w-xs`}
                >
                  {error}
                </Text>
              ) : null}

              {/* Tooltip Message */}
              {tooltipMessage !== '' && (
                <Animated.View
                  entering={FadeIn}
                  exiting={FadeOut}
                  style={tw`mb-3 bg-[#1e3a8a] px-4 py-2 rounded-full`}
                >
                  <Text style={tw`text-white text-sm text-center`}>
                    {tooltipMessage}
                  </Text>
                </Animated.View>
              )}

              {/* Number Pad */}
              <View style={tw`flex-row flex-wrap justify-center max-w-xs`}>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <TouchableOpacity
                    key={num}
                    onPress={() => handlePinButtonPress(num.toString())}
                    style={tw`w-20 h-14 m-1 bg-gray-700 rounded-md items-center justify-center`}
                    activeOpacity={0.7}
                  >
                    <Text style={tw`text-white text-xl`}>{num}</Text>
                  </TouchableOpacity>
                ))}

                {/* Submit Button */}
                <TouchableOpacity
                  onPress={submitPin}
                  style={tw`w-20 h-14 m-1 bg-green-600 rounded-md items-center justify-center`}
                  activeOpacity={0.8}
                >
                  <Text style={tw`text-white text-[16px] font-bold`}>Submit</Text>
                </TouchableOpacity>

                {/* Zero Button */}
                <TouchableOpacity
                  onPress={() => handlePinButtonPress('0')}
                  style={tw`w-20 h-14 m-1 bg-gray-700 rounded-md items-center justify-center`}
                  activeOpacity={0.7}
                >
                  <Text style={tw`text-white text-xl`}>0</Text>
                </TouchableOpacity>

                {/* Backspace Button */}
                <TouchableOpacity
                  onPress={handlePinBackspace}
                  style={tw`w-20 h-14 m-1 bg-red-600 rounded-md items-center justify-center`}
                  activeOpacity={0.7}
                >
                  <Text style={tw`text-white text-xl`}>⌫</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </>
  );
};

export default SetPaymentPin;
