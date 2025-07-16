import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ToastAndroid,
  Clipboard,
} from 'react-native';
import TopNavbar from '../../components/TopNavbar';
import tw from 'twrnc';
import { useNavigation, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import { axiosInstance } from '../../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClipboardDocumentIcon } from 'react-native-heroicons/outline';

type DetailTransactionViaTagTransferRouteProp = RouteProp<
  RootStackParamList,
  AppRoutes.DetailTransactionViaTagTransfer
>;

type Props = {
  route: DetailTransactionViaTagTransferRouteProp;
};

const DetailTransactionViaTagTransfer: React.FC<Props> = ({ route }) => {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { data } = route.params;

  const [transaction, setTransaction] = useState<any[]>([]);
  // To track last copied string, prevent duplicate toasts for same value repeatedly
  const lastCopiedValue = useRef<string | null>(null);

  const handleCopy = (value: string) => {
    if (lastCopiedValue.current === value) return; // prevent duplicate toast for same value

    Clipboard.setString(value);
    lastCopiedValue.current = value;
    ToastAndroid.show('Copied!', ToastAndroid.SHORT);

    // Reset after 1.5s so user can copy again later and see toast
    setTimeout(() => {
      lastCopiedValue.current = null;
    }, 1500);
  };

  useEffect(() => {
    const fetchTransaction = async () => {
      try {
        const token = await AsyncStorage.getItem("accessToken");
        const response = await axiosInstance.get(`/accounts/fiat/tag/transactions/${data}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response?.status === 200) {
          setTransaction(response?.data?.data || []);
        }
      } catch (error: any) {
        console.error("Transaction fetch error:", error?.response?.data?.message);
      }
    };

    fetchTransaction();
  }, []);

  return (
    <View style={tw`flex-1 bg-[#020618]`}>
      <TopNavbar title="Transaction Detail" />
      <ScrollView style={tw`p-4 mb-12`}>
        {transaction.map((tx, index) => (
          <View key={index} style={tw`mb-2 p-4 bg-gray-900 rounded-xl`}>
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={tw`text-gray-400 text-sm`}>Type:</Text>
              <Text style={tw`text-white text-sm`}>{tx.type}</Text>
            </View>
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={tw`text-gray-400 text-sm`}>Amount:</Text>
              <Text style={tw`text-white text-sm`}>₦{parseFloat(tx.amount).toLocaleString()}</Text>
            </View>
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={tw`text-gray-400 text-sm`}>Status:</Text>
              <Text style={tw`text-white text-sm`}>{tx.status}</Text>
            </View>
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={tw`text-gray-400 text-sm`}>Reason:</Text>
              <Text style={tw`text-white text-sm`}>{tx.reason}</Text>
            </View>

            {/* Charges - Free */}
            <View style={tw`flex-row justify-between mb-1`}>
              <Text style={tw`text-gray-400 text-sm`}>Charges:</Text>
              <Text style={tw`text-white text-sm`}>Free</Text>
            </View>

            {/* Reference with Copy */}
            <View style={tw`flex-row justify-between items-center mb-1`}>
              <Text style={tw`text-gray-400 text-sm`}>Reference:</Text>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-white text-sm mr-2`}>
                  {tx.reference?.slice(0, 7)}...
                </Text>
                <TouchableOpacity onPress={() => handleCopy(tx.reference)}>
                  <ClipboardDocumentIcon color="white" size={16} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Internal Ref with Copy */}
            <View style={tw`flex-row justify-between items-center`}>
              <Text style={tw`text-gray-400 text-sm`}>Internal Ref:</Text>
              <View style={tw`flex-row items-center`}>
                <Text style={tw`text-white text-sm mr-2`}>
                  {tx.internal_ref?.slice(0, 7)}...
                </Text>
                <TouchableOpacity onPress={() => handleCopy(tx.internal_ref)}>
                  <ClipboardDocumentIcon color="white" size={16} />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Buttons Container */}
      <View style={tw`absolute bottom-1 left-4 right-4`}>
        <TouchableOpacity
          style={tw`bg-blue-600 py-3 rounded-xl my-2`}
          onPress={() => navigation.navigate(AppRoutes.Home)}
        >
          <Text style={tw`text-white text-center font-semibold`}>Back to Home</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={tw`bg-red-600 py-3 rounded-xl my-2`}
          onPress={() => navigation.navigate(AppRoutes.ReportTransaction, {data})}
        >
          <Text style={tw`text-white text-center font-semibold`}>Report Transaction</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DetailTransactionViaTagTransfer;
