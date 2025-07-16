import React from 'react';
import {
  View,
  Text,
  Animated,     // ⬅️ add
  Image,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';
import { ChevronUpDownIcon } from 'react-native-heroicons/outline';
import ListSortedItem from './ListSortedItem';

export type Token = {
  symbol: string;
  name: string;
  logo: any;
  balance: string;
  value: string;
};

type Props = {
  tokens: Token[];
  scrollY: Animated.Value;   // ⬅️ expect it
};

export default function ListTokens({ tokens, scrollY }: Props) {
  return (
    <View style={tw`bg-[#0A1126	] rounded-t-2xl pt-3`}>
      {/* Header stays static */}
      <ListSortedItem title='Tokens' />

      {/* Scrollable list feeds scrollY */}
      <Animated.FlatList
        data={tokens}
        keyExtractor={(item) => item.symbol}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
        contentContainerStyle={tw`pb-7 px-2`}
        renderItem={({ item }) => (
          <View style={tw`flex-row border-b border-gray-900 items-center justify-between px-0 pb-3 mb-3`}>
            <View style={tw`flex-row items-center`}>
              <Image source={item.logo} style={tw`w-8 h-8 rounded-full mr-3`} />
              <View>
                <Text style={tw`text-white text-xs font-semibold`}>{item.symbol}</Text>
                <Text style={tw`text-green-500 mt-0.5 text-xs lowercase`}>
                  {item.value}
                </Text>
              </View>
            </View>

            <View style={tw`items-end`}>
              <Text style={tw`text-white text-xs font-semibold`}>{item.balance}</Text>
              <Text style={tw`text-gray-400 text-xs`}>{item.value}</Text>
            </View>
          </View>
        )}
      />
    </View>
  );
}
