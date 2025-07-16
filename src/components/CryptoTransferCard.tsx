import React, { useState } from 'react';
import { View, Text, TextInput } from 'react-native';
import tw from 'twrnc';

function CryptoTransferCard() {
  const [address, setAddress] = useState('');
  const [note,    setNote]    = useState('');

  return (
    <View style={tw`bg-gray-900 p-4 rounded-xl mb-6`}>
      <Text style={tw`text-white mb-2`}>Wallet Address</Text>
      <TextInput
        value={address}
        onChangeText={setAddress}
        placeholder="0x..."
        placeholderTextColor="gray"
        autoCapitalize="none"
        style={tw`bg-gray-800 text-white rounded px-4 py-2 mb-4`}
      />

      <Text style={tw`text-white mb-2`}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Message to recipient"
        placeholderTextColor="gray"
        multiline
        numberOfLines={6}
        style={tw`bg-gray-800 text-white rounded px-4 py-2`}
      />
    </View>
  );
}

export default CryptoTransferCard;
