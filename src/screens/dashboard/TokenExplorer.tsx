import { useState } from 'react';
import { TextInput, View } from 'react-native';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';
import tw from 'twrnc';

function TokenExplorer() {
  const [search, setSearch] = useState('');

  return (
    <View style={tw`flex-1 bg-[#020618] px-4 py-4`}>
      <View style={tw`flex-row items-center bg-[#0e1329] rounded-full px-4 py-0`}>
        <MagnifyingGlassIcon size={20} color="gray" />
        <TextInput
          placeholder="Search Tokens | Hash | CA..."
          placeholderTextColor="gray"
          style={tw`ml-3 flex-1 text-white`}
          value={search}
          onChangeText={setSearch}
        />
      </View>
    </View>
  );
}

export default TokenExplorer;
