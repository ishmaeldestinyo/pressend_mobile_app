import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  ActivityIndicator,
  TouchableOpacity,
  Modal,
  ScrollView,
  Pressable,
} from 'react-native';
import axios from 'axios';
import tw from 'twrnc';
import { MagnifyingGlassIcon } from 'react-native-heroicons/outline';

interface Bank {
  name: string;
  code: string;
}

interface FiatTransferCardProps {
  bank: string;
  setBank: (value: string) => void;

  bankCode: string;
  setBankCode: (value: string) => void;

  account: string;
  setAccount: (value: string) => void;

  note: string;
  setNote: (value: string) => void;
  
}

const FiatTransferCard: React.FC<FiatTransferCardProps> = ({
  bank,
  setBank,
  bankCode,
  setBankCode,
  account,
  setAccount,
  note,
  setNote,
}) => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [filteredBanks, setFilteredBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [bankModalVisible, setBankModalVisible] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');

  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await axios.get('https://api.paystack.co/bank');
        if (res.data.status) {
          setBanks(res.data.data);
          setFilteredBanks(res.data.data);
        }
      } catch (error) {
        console.warn('Error fetching banks:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanks();
  }, []);

  // Filter banks when searchTerm changes
  useEffect(() => {
    if (!searchTerm) {
      setFilteredBanks(banks);
    } else {
      const filtered = banks.filter((b) =>
        b.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredBanks(filtered);
    }
  }, [searchTerm, banks]);

  const beneficiary = bank && account.length === 10 ? 'John Doe' : '';

  return (
    <View style={tw`bg-gray-900 p-4 rounded-xl mb-6`}>

      {/* Bank Picker Trigger */}
      <Text style={tw`text-white mb-2`}>Bank</Text>
      {loading ? (
        <ActivityIndicator color="white" style={tw`my-2`} />
      ) : (
        <>
          <TouchableOpacity
            onPress={() => {
              setBankModalVisible(true);
              setSearchTerm(''); // reset search when modal opens
              setFilteredBanks(banks);
            }}
            style={tw`bg-gray-800 py-3 px-5 rounded mb-4 border border-gray-700`}
          >
            <Text style={tw`text-white`}>
              {bank || 'Select bank'}
            </Text>
          </TouchableOpacity>

          {/* Bank Modal */}
          <Modal
            visible={bankModalVisible}
            animationType="slide"
            transparent
            onRequestClose={() => setBankModalVisible(false)}
          >
            <Pressable
              style={tw`flex-1 bg-black/60`}
              onPress={() => setBankModalVisible(false)}
            >
              <View style={tw`absolute bottom-0 w-full h-2/3 bg-gray-900 rounded-t-2xl p-4`}>
                <Text style={tw`text-white text-lg font-bold mb-4 text-center`}>Select Bank</Text>

                {/* Search Input */}
                <MagnifyingGlassIcon style={tw`text-gray-500 absolute top-18  z-50 right-8`}/> 
                <TextInput
                  value={searchTerm}
                  onChangeText={setSearchTerm}
                  placeholder="Search banks..."
                  placeholderTextColor="gray"
                  style={tw`bg-gray-800 text-white rounded px-4 py-2 mb-4`}
                  autoFocus
                />

                <ScrollView contentContainerStyle={tw`pb-16`}>
                  {filteredBanks.length > 0 ? (
                    filteredBanks.map((b) => (
                      <TouchableOpacity
                        key={b.code}
                        onPress={() => {
                          setBank(b.name);
                          setBankCode(b.code);
                          setBankModalVisible(false);
                        }}
                        style={tw`py-3 px-4 border-b border-gray-800`}
                      >
                        <Text style={tw`text-white`}>{b.name}</Text>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <Text style={tw`text-gray-400 text-center mt-4`}>
                      No banks found.
                    </Text>
                  )}
                </ScrollView>
              </View>
            </Pressable>
          </Modal>
        </>
      )}

      {/* Account Number Input */}
      <Text style={tw`text-white mb-2`}>Account Number</Text>
      <TextInput
        value={account}
        onChangeText={(text) => {
          const digitsOnly = text.replace(/\D/g, '');
          setAccount(digitsOnly);
        }}
        placeholder="0123456789"
        placeholderTextColor="gray"
        keyboardType="number-pad"
        maxLength={10}
        style={tw`bg-gray-800 text-white rounded px-5 py-2 mb-4`}
      />

      {/* Beneficiary display */}
      {beneficiary ? (
        <Text style={tw`text-green-400 mb-4`}>Beneficiary: {beneficiary}</Text>
      ) : null}

      {/* Note Input */}
      <Text style={tw`text-white mb-2`}>Note (optional)</Text>
      <TextInput
        value={note}
        onChangeText={setNote}
        placeholder="Message to recipient"
        placeholderTextColor="gray"
        multiline
        numberOfLines={3}
        style={tw`bg-gray-800 text-white rounded px-5 py-2`}
      />
    </View>
  );
};

export default FiatTransferCard;
