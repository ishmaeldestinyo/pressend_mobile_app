import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  FlatList,
  TouchableOpacity,
  useWindowDimensions,
  SafeAreaView,
} from 'react-native';
import LottieView from 'lottie-react-native';
import tw from 'twrnc';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import { ArrowRightIcon } from 'react-native-heroicons/outline';
import AsyncStorage from '@react-native-async-storage/async-storage';

const data = [
  {
    lottie: require('../../../assets/lotties/f3.json'),
    title: 'Send, Buy, Receive & Swap',
    subtitle: 'Manage all your fiat and crypto transactions from one powerful wallet.',
  },
  {
    lottie: require('../../../assets/lotties/f4.json'),
    title: 'Biometric Security',
    subtitle: 'Secure your account with palmprint verification for fast and safe access.',
  },
  {
    lottie: require('../../../assets/lotties/f5.json'),
    title: 'Transact Anywhere, Anytime',
    subtitle: 'Enjoy unlimited access to funds and services — globally and instantly.',
  },
];

const SLIDE_INTERVAL_MS = 4000;

const Onboarding = () => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { width } = useWindowDimensions();
  const scrollX = useRef(new Animated.Value(0)).current;
  const flatListRef = useRef<FlatList>(null);
  const [current, setCurrent] = useState(0);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;

  const animateIn = () => {
    fadeAnim.setValue(0);
    slideAnim.setValue(20);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  useEffect(() => {
    animateIn();
  }, [current]);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (current + 1) % data.length;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrent(next);
    }, SLIDE_INTERVAL_MS);

    return () => clearInterval(timer);
  }, [current]);

  const onViewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems[0]?.index !== undefined) {
      setCurrent(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const renderItem = ({ item }: any) => (
    <View style={[styles.slide, { width }]}>
      <LottieView source={item.lottie} autoPlay loop style={tw`w-4/5 h-full`} />
      <Animated.View
        style={[
          tw`px-6 mt-8 mb-8`,
          { opacity: fadeAnim, transform: [{ translateY: slideAnim }] },
        ]}
      >
        <Text style={tw`text-white text-2xl font-bold text-center mb-3`}>
          {item.title}
        </Text>
        <Text style={tw`text-white text-base text-center opacity-70`}>
          {item.subtitle}
        </Text>
      </Animated.View>
    </View>
  );

  const TRACK_W = width * 0.36;
  const BAR_W = TRACK_W / data.length;

  const translateX = scrollX.interpolate({
    inputRange: [0, width * (data.length - 1)],
    outputRange: [0, BAR_W * (data.length - 1)],
    extrapolate: 'clamp',
  });

  const handleSkip = () => {
    navigation.navigate(AppRoutes.CreateWallet);
  };

  const handleNavigate = (target: keyof RootStackParamList) => {
    navigation.navigate(target);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: Colors.backgroundColor }]}>
      <View style={tw`flex-1 justify-between pb-6`}>
        {/* Skip Button */}
        <View style={tw`flex-row mt-0 justify-end px-4 pt-0`}>
          {current < data.length - 1 && (
            <TouchableOpacity
              onPress={handleSkip}
              style={tw`flex-row justify-start gap-2 border-b items-center border-gray-700 p-2 rounded`}
            >
              <Text style={tw`text-sm text-white opacity-80 text-gray-400`}>Skip</Text>
              <ArrowRightIcon style={tw`opacity-80 text-gray-400`} />
            </TouchableOpacity>
          )}
        </View>

        {/* Slides */}
        <Animated.FlatList
          ref={flatListRef}
          data={data}
          horizontal
          pagingEnabled
          bounces={false}
          showsHorizontalScrollIndicator={false}
          keyExtractor={(_, i) => i.toString()}
          renderItem={renderItem}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: scrollX } } }],
            { useNativeDriver: false }
          )}
          onViewableItemsChanged={onViewableItemsChanged}
          viewabilityConfig={viewConfig}
        />

        {/* Progress Indicator */}
        <View style={tw`items-center`}>
          <View
            style={[
              tw`overflow-hidden rounded-full bg-white/12`,
              { width: TRACK_W, height: 6 },
            ]}
          >
            <Animated.View
              style={{
                height: '100%',
                width: BAR_W,
                backgroundColor: Colors.primary,
                borderRadius: 100,
                transform: [{ translateX }],
              }}
            />
          </View>
        </View>

        {/* Action Buttons */}
        <View style={tw`mt-6 px-6`}>
          <TouchableOpacity
            onPress={() => handleNavigate(AppRoutes.CreateWallet)}
            style={[
              tw`rounded-xl py-3 mb-3 items-center`,
              { backgroundColor: Colors.primary },
            ]}
          >
            <Text style={[tw`font-semibold text-base`, { color: '#fff' }]}>
              Create account
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleNavigate(AppRoutes.ImportWallet)}
            style={[
              tw`rounded-xl py-3 items-center border`,
              {
                borderColor: Colors.primary,
                backgroundColor: 'transparent',
              },
            ]}
          >
            <Text style={[tw`font-semibold text-base`, { color: Colors.primary }]}>
              Login
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
});

export default Onboarding;
