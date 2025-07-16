import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import tw from 'twrnc';

import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { CheckIcon } from 'react-native-heroicons/solid';

import TopNavbar from '../../components/TopNavbar';
import { PaymentMode } from '../../utils/paymentUtil';
import CryptoTransferCard from '../../components/CryptoTransferCard';
import FiatTransferCard from '../../components/FiatTransferCard';
import TagTransferCard from '../../components/TagTransferCard';

function RecieveAssetsList() {
  const [mode, setMode] = useState(PaymentMode.CRYPTO);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD'); // debit currency

  const handleSubmit = () => {
    console.log({ mode, amount, currency });
    // ⬆️ replace with real submit logic
  };

  /* Helper to render the correct card once, then animate on change */
  const renderCard = () => {
    switch (mode) {
      case PaymentMode.CRYPTO:
        return <CryptoTransferCard />;
      case PaymentMode.FIAT:
        return <FiatTransferCard />;
      case PaymentMode.TAG:
        return <TagTransferCard />;
      default:
        return null;
    }
  };

  return (
    <View style={tw`bg-[#020618] flex-1`}>
      {/* Top bar */}
      <TopNavbar title="Recieve" />

      {/* Scrollable content */}
      <ScrollView contentContainerStyle={tw`p-4 pb-32`}>
        {/* ─── Mode of Transfer Tabs ───────────────────────────── */}
        <View style={tw`flex-row mb-4`}>
          {Object.values(PaymentMode).map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMode(m)}
              style={tw`flex-1 mx-1 py-3 rounded relative ${
                mode === m ? 'bg-blue-500' : 'bg-gray-700'
              } items-center justify-center`}
            >
              {/* Check‑mark only on selected tab */}
              {mode === m && (
                <View
                  style={tw`absolute top-1 left-1 bg-green-500 rounded-full p-0.5`}
                >
                  <CheckIcon size={10} color="white" />
                </View>
              )}
              <Text style={tw`text-white text-xs`}>{m}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Amount & Currency Inputs ───────────────────────── */}
        <Text style={tw`text-white mb-1`}>Amount</Text>
        <View style={tw`flex-row items-center mb-6`}>
          <TextInput
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="gray"
            keyboardType="decimal-pad"
            style={tw`flex-1 bg-gray-800 text-white rounded-l px-4 py-2`}
          />
          <TextInput
            value={currency}
            onChangeText={setCurrency}
            placeholder="CUR"
            placeholderTextColor="gray"
            style={tw`w-20 bg-gray-700 text-white text-center rounded-r px-2 py-2`}
          />
        </View>

        {/* ─── Card that fades in/out when mode changes ────────── */}
        <Animated.View
          key={mode}              // key forces re‑mount on mode change
          entering={FadeIn}
          exiting={FadeOut}
        >
          {renderCard()}
        </Animated.View>
      </ScrollView>

      {/* ─── Submit Button fixed to bottom ────────────────────── */}
      <View style={tw`absolute bottom-4 left-4 right-4`}>
        <TouchableOpacity
          onPress={handleSubmit}
          style={tw`bg-blue-600 rounded-full py-4 items-center`}
        >
          <Text style={tw`text-white font-bold text-sm`}>Preview</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default RecieveAssetsList;
