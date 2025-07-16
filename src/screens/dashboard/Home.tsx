import React, { useEffect, useRef } from 'react';
import { Animated, View } from 'react-native';
import tw from 'twrnc';

import HomeNavbar from '../../components/HomeNavbar';
import WalletContainer from '../../components/WalletContainer';
import BottomHomeNavigation from '../../components/BottomHomeNavigation';
import { Token } from '../../components/ListTokens';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import { axiosInstance } from '../../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../../context/userContext';
import { useAxiosWithNetworkCheck } from '../../api/useAxiosWithNetworkCheck';

function Home() {
  const { authUser, setAuthUser } = useAuth();

  const scrollY = useRef(new Animated.Value(0)).current;
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const defaultTokens: Token[] = [
    { symbol: 'BTC', name: 'Bitcoin', logo: require('../../../assets/images/btc.png'), balance: '0.24', value: '$16,300' },
    { symbol: 'ETH', name: 'Ethereum', logo: require('../../../assets/images/eth.png'), balance: '1.5', value: '$4,000' },
    { symbol: 'SOL', name: 'Solana', logo: require('../../../assets/images/sol.png'), balance: '10', value: '$950' },
    { symbol: 'USDT', name: 'Tether', logo: require('../../../assets/images/usdt.png'), balance: '500', value: '$500' },
    { symbol: 'NGN', name: 'Naira', logo: require('../../../assets/images/naira.png'), balance: '250000', value: '₦250,000' },
    { symbol: 'NGN', name: 'Naira', logo: require('../../../assets/images/naira.png'), balance: '250000', value: '₦250,000' },
  ];

    const { axiosRequest } = useAxiosWithNetworkCheck();

  useEffect(() => {
    const getAuthProfile = async () => {
      try {
        const accessToken = await AsyncStorage.getItem("accessToken");

        if (!accessToken) {
          navigation.replace(AppRoutes.ImportWallet);
          return;
        }

        const response = await axiosRequest({
          method: "GET",
          url: "/auth/me",
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        
        if (response && response.status === 200 && response.data) {
          setAuthUser(response.data);
        } else {
          setAuthUser(null);
          navigation.replace(AppRoutes.ImportWallet);
        }

      } catch (error) {
        setAuthUser(null);
        navigation.replace(AppRoutes.ImportWallet);
      }
    };

    getAuthProfile();
  }, [navigation, setAuthUser]);

  return (
    <>
      <View style={tw`bg-[#020618] flex-1 pt-0`}>
        <HomeNavbar />
        <WalletContainer tokens={defaultTokens} scrollY={scrollY} />
      </View>
      <BottomHomeNavigation scrollY={scrollY} threshold={24} />
    </>
  );
}

export default Home;
