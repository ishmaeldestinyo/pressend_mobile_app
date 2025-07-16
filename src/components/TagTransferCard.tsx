import React from 'react';
import { View, Text, TextInput } from 'react-native';
import tw from 'twrnc';

type TagTransferCardProps = {
  tag: string;
  setTag: (text: string) => void;
  note: string;
  setNote: (text: string) => void;
  setTagnameError: (text: string) => void;
  tagnameError: string;
};

function TagTransferCard({ tag, setTag, note, setNote, tagnameError, setTagnameError }: TagTransferCardProps) {
  return (
    <View style={tw`bg-gray-900 p-4 rounded-xl mb-6`}>
      <Text style={tw`text-white mb-2`}>Recipient Tag</Text>
      <TextInput
        value={tag}
        onChangeText={(text) => {
          // Remove invalid characters (allow letters and numbers only)
          let filtered = text.replace(/[^a-zA-Z0-9]/g, '');

          // Enforce first letter only at the start
          if (filtered.length > 0) {
            // If first char is not a letter, remove it
            if (!/^[a-zA-Z]/.test(filtered[0])) {
              filtered = filtered.substring(1);
            }
          }

          setTag(filtered);
          setTagnameError('');
        }}
        placeholder="@username"
        placeholderTextColor="gray"
        autoCapitalize="none"
        style={tw`bg-gray-800 text-white rounded px-4 py-2 ${tagnameError ? '' : 'mb-4'}`}
      />

      {tagnameError ? <Text style={tw`text-red-500 text-[13px] mt-2 mb-4`}>{tagnameError}</Text> : null}

      <Text style={tw`text-white mb-2`}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Message to recipient"
        placeholderTextColor="gray"
        multiline
        numberOfLines={3}
        style={tw`bg-gray-800 text-white rounded px-3 py-2`} // increased px-4 → px-5
      />

    </View>
  );
}

export default TagTransferCard;
