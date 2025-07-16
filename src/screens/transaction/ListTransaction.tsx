import React, { useEffect, useState } from 'react';
import {
  Image,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import tw from 'twrnc';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import LoadingModal from '../../components/LoadingModal';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import {
  ArrowLeftIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
} from 'react-native-heroicons/outline';
import { XMarkIcon } from 'react-native-heroicons/solid';
import { useAxiosWithNetworkCheck } from '../../api/useAxiosWithNetworkCheck';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormatAmount } from '../../utils/formatAmount';
import { formatDateWithOrdinalAndTime } from '../../utils/dateFormatter';

function ListTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBar, setSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openSort, setOpenSort] = useState(false);
  const [sortBy, setSortBy] = useState('Date');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const inputWidth = useSharedValue(0);

  const animatedInputStyle = useAnimatedStyle(() => ({
    width: `${inputWidth.value}%`,
  }));

  const { axiosRequest } = useAxiosWithNetworkCheck();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await axiosRequest({
        method: 'GET',
        url: '/accounts/transactions/me',
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem('accessToken')}`,
        },
      });
      if (response && response.status === 200) {
        setTransactions(response.data.data);
      }
    } catch (error: any) {
      console.log(error?.response?.data?.message || error?.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStartSearch = () => {
    setSearchBar(true);
    inputWidth.value = withTiming(90, { duration: 500 });
  };

  const handleCancelSearch = () => {
    inputWidth.value = withTiming(0, { duration: 500 });
    setTimeout(() => {
      setSearchBar(false);
      setSearchQuery('');
    }, 200);
  };

  // Added "Amount" here
  const sortByItems = ['Date', 'Failed', 'Successful', 'Amount'];

  // Filtering by search query, also includes amount now
  const filteredTransactions = transactions.filter((t) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      (t.reference?.toLowerCase().includes(q) ||
      t.internal_ref?.toLowerCase().includes(q) ||
      t.recipient?.bank_name?.toLowerCase().includes(q) ||
      t.reason?.toLowerCase().includes(q) ||
      t.amount.toString().includes(q)) // added amount as string search
    );
  });

  // Sorting logic including Amount
  const sortedTransactions = filteredTransactions.slice().sort((a, b) => {
    if (sortBy === 'Date') {
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    } else if (sortBy === 'Failed') {
      return (a.status === 'failed' ? 0 : 1) - (b.status === 'failed' ? 0 : 1);
    } else if (sortBy === 'Successful') {
      return (a.status === 'success' ? 0 : 1) - (b.status === 'success' ? 0 : 1);
    } else if (sortBy === 'Amount') {
      return b.amount - a.amount; // Descending by amount
    }
    return 0;
  });

  // Calculate totals
  const totals = {
    incoming: 0,
    outgoing: 0,
    incomingSuccess: 0,
    outgoingSuccess: 0,
    incomingFailed: 0,
    outgoingFailed: 0,
  };

  for (const t of sortedTransactions) {
    if (t.type === 'INCOMING') {
      totals.incoming += t.amount;
      if (t.status === 'success') totals.incomingSuccess += t.amount;
      else if (t.status === 'failed') totals.incomingFailed += t.amount;
    } else if (t.type === 'OUTGOING') {
      totals.outgoing += t.amount;
      if (t.status === 'success') totals.outgoingSuccess += t.amount;
      else if (t.status === 'failed') totals.outgoingFailed += t.amount;
    }
  }

  return (
    <>
      {loading && <LoadingModal />}
      <View style={tw`flex-1 bg-[#020618]`}>
        {/* Header */}
        <View style={tw`relative items-center justify-center border-b border-gray-900 py-3 px-4`}>
          {searchBar ? (
            <View style={tw`flex-row items-center w-full`}>
              <Animated.View style={[tw`bg-[#10172F] pl-2 rounded flex-1`, animatedInputStyle]}>
                <TextInput
                  style={tw`text-gray-200 px-3 py-1`}
                  placeholder="Search transactions"
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoFocus
                />
              </Animated.View>
              <TouchableOpacity onPress={handleCancelSearch} style={tw`ml-3`}>
                <XMarkIcon size={22} style={tw`text-red-700`} />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <TouchableOpacity
                onPress={() => navigation.canGoBack() && navigation.goBack()}
                style={tw`absolute left-4`}
                hitSlop={8}
              >
                <ArrowLeftIcon size={24} color={Colors.textColor} />
              </TouchableOpacity>
              <Text style={tw`text-white text-base`}>Transaction history</Text>
              <View style={tw`absolute right-4 flex-row gap-3`}>
                <TouchableOpacity hitSlop={8} onPress={handleStartSearch}>
                  <MagnifyingGlassIcon size={20} style={tw`text-gray-200`} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setOpenSort(!openSort)}
                  activeOpacity={0.7}
                  style={tw`flex-row items-center`}
                >
                  <ChevronUpDownIcon size={20} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        {/* Sort dropdown */}
        <View
          style={tw`absolute bg-gray-900  ${openSort ? 'block' : 'hidden'} z-50 top-12 right-4 rounded-b-lg`}
        >
          {sortByItems.map((item, key) => (
            <TouchableOpacity
              activeOpacity={0.6}
              key={key}
              style={tw`py-1 px-2 ${key === sortByItems.length - 1 ? 'border-b-none' : 'border-b'} my-1`}
              onPress={() => {
                setSortBy(item);
                setOpenSort(false);
              }}
            >
              <Text style={tw`text-white text-[10px] text-center`}>{item}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Totals Summary */}
        <View style={tw`bg-[#10172F] px-4 py-2 border-b mb-1 border-gray-900`}>
          <View style={tw`flex-row flex-wrap justify-between`}>
            <View style={tw` mb-1`}>
              <Text style={tw`text-gray-300 text-[10px]`}>Incoming Successful:</Text>
              <Text style={tw`text-green-500 text-[11px]`}>₦{FormatAmount(totals.incomingSuccess.toString())}</Text>
            </View>
            <View style={tw` mb-1`}>
              <Text style={tw`text-gray-300 text-[10px]`}>Outgoing Successful:</Text>
              <Text style={tw`text-green-500 text-[11px]`}>₦{FormatAmount(totals.outgoingSuccess.toString())}</Text>
            </View>
            <View style={tw` mb-1`}>
              <Text style={tw`text-gray-300 text-[10px]`}>Outgoing Failed:</Text>
              <Text style={tw`text-red-500 text-[11px]`}>₦{FormatAmount(totals.outgoingFailed.toString())}</Text>
            </View>
          </View>
        </View>

        {/* Transactions List */}
        {sortedTransactions.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            {sortedTransactions.map((transaction, key) => (
              <TouchableOpacity
                key={key}
                onPress={() =>
                  navigation.navigate(AppRoutes.DetailTransactionViaTagTransfer, {
                    data: transaction?.recipient?.bank_name ? transaction.reference: transaction.internal_ref ,
                  })
                }
                activeOpacity={0.6}
                style={tw`flex-row border-b border-gray-900 relative py-2 justify-between items-center px-5`}
              >
                {(transaction.has_dispute || transaction.dispute_comment) && (
                  <View style={tw`absolute top-2 right-20`}>
                    <Text style={tw`text-red-700 text-[10px]`}>Reported</Text>
                  </View>
                )}
                <View style={tw`flex-row justify-start gap-2 items-center`}>
                  <Image
                    source={require('../../../assets/images/avatar.png')}
                    style={tw`w-9 h-9 rounded-full`}
                  />
                  <View>
                    <Text style={tw`text-white text-[10px]`}>
                      {transaction.type === 'OUTGOING' ? 'Transfer to ' : 'Received from '}
                      {transaction.recipient?.bank_name || 'Pressend'}
                    </Text>
                    <Text style={tw`text-[#ffffff99] text-[10px] mt-1`}>
                      {formatDateWithOrdinalAndTime(transaction.updatedAt)}
                    </Text>
                  </View>
                </View>

                <View>
                  <Text style={tw`text-white text-right text-[10px]`}>
                    {transaction.type === 'OUTGOING' ? '-' : '+'} {transaction.currency === 'NGN' ? '₦' : transaction.currency}
                    {FormatAmount(`${transaction.amount}`)}
                  </Text>
                  <Text
                    style={tw`${
                      transaction.status === 'success'
                        ? 'text-green-500'
                        : transaction.status === 'failed'
                        ? 'text-red-500'
                        : 'text-orange-600'
                    } text-right text-[10px] mt-1`}
                  >
                    {transaction.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <View style={tw`w-fit mx-auto mt-44`}>
            <MagnifyingGlassIcon style={tw`text-gray-700 w-fit mx-auto`} size={44} />
            <Text style={tw`text-gray-600 text-[12px]`}>No Transaction found!</Text>
          </View>
        )}
      </View>
    </>
  );
}

export default ListTransaction;
