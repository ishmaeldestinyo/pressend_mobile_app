import React, { useRef, useEffect, useCallback } from 'react';
import { Animated, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation, CommonActions } from '@react-navigation/native';
import tw from 'twrnc';
import {
  HomeIcon,
  GlobeAltIcon,
  CreditCardIcon,
  Cog6ToothIcon,
} from 'react-native-heroicons/outline';
import { AppRoutes } from '../constants/routes';

type Props = {
  scrollY: Animated.Value;
  threshold: number;
};

const TABS = [
  { label: 'Home',     route: AppRoutes.Home,        Icon: HomeIcon },
  { label: 'Explorer', route: AppRoutes.Explorer,    Icon: GlobeAltIcon },
  { label: 'Billpay',  route: AppRoutes.BillPayment, Icon: CreditCardIcon },
  { label: 'Settings', route: AppRoutes.SecurityDashboard,    Icon: Cog6ToothIcon },
];

export default function BottomHomeNavigation({ scrollY, threshold }: Props) {
  const navigation = useNavigation();
  const translateY = useRef(new Animated.Value(100)).current;
  const hideTimer = useRef<NodeJS.Timeout | null>(null);

  const showBar = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    // Reset hide timer
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(hideBar, 4000);
  }, []);

  const hideBar = useCallback(() => {
    Animated.timing(translateY, {
      toValue: 100,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      if (value > threshold) {
        showBar();
      }
    });

    return () => {
      scrollY.removeListener(id);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, [scrollY, threshold, showBar]);

  const handlePress = (route: string) => {
    navigation.dispatch(CommonActions.navigate({ name: route }));
    showBar();
  };

  return (
    <Animated.View
      style={[
        styles.container,
        tw`bg-[#020618] border border-gray-800`,
        { transform: [{ translateY }] },
      ]}
    >
      {TABS.map(({ label, route, Icon }) => (
        <TouchableOpacity
          key={label}
          onPress={() => handlePress(route)}
          activeOpacity={0.8}
          style={tw`flex-1 items-center py-2`}
        >
          <Icon size={26} color="white" />
        </TouchableOpacity>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 20,
    right: 20,
    bottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    ...tw`flex-row shadow-lg px-2`,
  },
});
