import { useState, useRef } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Animated,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
} from 'react-native-heroicons/outline';
import tw from 'twrnc';
import LoadingModal from '../../components/LoadingModal';
import { axiosInstance } from '../../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/userContext';

function SetTagname() {
  const [search, setSearch] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {authUser, setAuthUser} = useAuth();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  const isValidTag = /^[a-zA-Z][a-zA-Z0-9]{5,}$/.test(search.trim());

  const handleSubmit = async () => {
    if (!isValidTag || isSubmitting) return;

    setIsSubmitting(true);
    setLoading(true);
    setMessage('');
    setIsAvailable(null);

    try {
      const accessToken = await AsyncStorage.getItem('accessToken');

      const response = await axiosInstance.post(
        '/accounts/set-tag',
        { tagname: search.trim() },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.status === 200) {
        setIsAvailable(true);
        setAuthUser(response?.data?.data);
        showMessage(response.data.message || 'Tag successfully set!');
      } else {
        setIsAvailable(false);
        showMessage('Something went wrong.');
      }
    } catch (error: any) {
      const msg =
        error?.response?.data?.message ||
        'Tagname is unavailable or invalid.';
      setIsAvailable(false);
      showMessage(msg);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
    }
  };

  const showMessage = (msg: string) => {
    setMessage(msg);
    fadeAnim.setValue(0);

    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          setMessage('');
          setIsAvailable(null);
        });
      }, 2500);
    });
  };

  return (
    <>
      {loading && <LoadingModal />}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={tw`flex-1 bg-[#020618] px-4 py-6`}
      >
        <View>
          <View
            style={tw`flex-row items-center bg-[#0e1329] rounded-full px-4 py-0.5`}
          >
            <MagnifyingGlassIcon size={20} color="gray" />
            <TextInput
              placeholder="Enter a unique tag..."
              placeholderTextColor="gray"
              style={tw`ml-3 flex-1 text-white`}
              value={search}
              onChangeText={(text) => {
                setSearch(text);
                setMessage('');
                setIsAvailable(null);
              }}
              autoCapitalize="none"
            />
            <TouchableOpacity
              disabled={!isValidTag || isSubmitting}
              onPress={handleSubmit}
              style={tw`ml-3 ${!isValidTag ? 'opacity-30' : ''}`}
            >
              <PaperAirplaneIcon
                size={20}
                color={isValidTag ? 'white' : 'gray'}
              />
            </TouchableOpacity>
          </View>

          {/* Tooltip Below with Fade Animation */}
          {message !== '' && (
            <Animated.View
              style={[
                tw`mt-2 px-3 w-fit mx-auto py-2 rounded-md self-start`,
                {
                  backgroundColor: '#0b1120',
                  opacity: fadeAnim,
                },
              ]}
            >
              <Text
                style={tw`text-xs ${
                  isAvailable ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {message}
              </Text>
            </Animated.View>
          )}
        </View>
      </KeyboardAvoidingView>
    </>
  );
}

export default SetTagname;
