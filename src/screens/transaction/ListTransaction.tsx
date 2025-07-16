import React, { useEffect, useState } from 'react';
import {
  Image,
  Pressable,
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
import { axiosInstance } from '../../api/axiosConfig';
import LoadingModal from '../../components/LoadingModal';
import { Colors } from '../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import {
  ArrowLeftIcon,
  ChevronUpDownIcon,
  MagnifyingGlassIcon,
  MagnifyingGlassMinusIcon,
  ReceiptPercentIcon,
  StopCircleIcon,
  StopIcon,
} from 'react-native-heroicons/outline';
import { XMarkIcon } from 'react-native-heroicons/solid';
import { useAxiosWithNetworkCheck } from '../../api/useAxiosWithNetworkCheck';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { FormatAmount } from '../../utils/formatAmount';

function ListTransaction() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchBar, setSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Animation value for input width
  const inputWidth = useSharedValue(0);

  // Animated style for input width (0% to 90%)
  const animatedInputStyle = useAnimatedStyle(() => {
    return {
      width: `${inputWidth.value}%`,
    };
  });

  const { axiosRequest } = useAxiosWithNetworkCheck();

  useEffect(() => {
    const listTransactions = async () => {
      setLoading(true);
      try {
        const response = await axiosRequest({
          method: "GET",
          url: "/accounts/transactions/me",
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("accessToken")}`
          }
        })
        if (response && response?.status === 200) {
          setTransactions(response?.data?.data);
        }

        return null;

      } catch (error: any) {
        console.log(error?.response?.data?.message || error?.message);
      } finally {
        setLoading(false);
      }
    };

    listTransactions();
  }, []);

  const handleStartSearch = () => {
    setSearchBar(true);
    inputWidth.value = withTiming(90, { duration: 500 }); // Animate to 90% width
  };

  const handleCancelSearch = () => {
    inputWidth.value = withTiming(0, { duration: 500 });
    setTimeout(() => {
      setSearchBar(false);
      setSearchQuery('');
    }, 200);
  };

  const [openSort, setOpenSort] = useState(false);

  const sortByItem = ["Date", "Failed", "Successful"];

  return (
    <>
      {loading && <LoadingModal />}
      <View style={tw`flex-1 bg-[#020618]`}>
        <View style={tw`relative items-center justify-center border-b border-gray-900 py-3 px-4`}>
          {searchBar ? (
            <View style={tw`flex-row items-center w-full`}>
              <Animated.View style={[tw`bg-[#10172F] pl-2 rounded flex-1`, animatedInputStyle]}>
                <TextInput
                  style={tw`text-black px-3 py-1`}
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
              {/* Go Back Icon - Absolute Left */}
              <TouchableOpacity
                onPress={() => navigation.canGoBack() && navigation.goBack()}
                style={tw`absolute left-4`}
                hitSlop={8}
              >
                <ArrowLeftIcon size={24} color={Colors.textColor} />
              </TouchableOpacity>

              {/* Title - Centered */}
              <Text style={tw`text-white text-base`}>Transaction history</Text>

              {/* Search Icon - Absolute Right */}
              <View
                style={tw`absolute right-4 flex-row gap-3`}
              >
                <TouchableOpacity
                  hitSlop={8}
                  onPress={handleStartSearch}
                >
                  <MagnifyingGlassIcon size={20} style={tw`text-gray-200`} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOpenSort(!openSort)} activeOpacity={0.7} style={tw`flex-row items-center`}>
                  <ChevronUpDownIcon size={20} color="white" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>

        <View style={tw`absolute bg-gray-900 ${openSort ? 'block' : 'hidden'}   z-50 top-12 right-4 rounded-b-lg`}>
          {sortByItem && sortByItem.length > 0 && sortByItem.map((item, key) => {
            return (
              <TouchableOpacity activeOpacity={0.6} key={key} style={tw`py-1 px-2 ${key == (item.length - 1) ? 'border-b-none' : 'border-b'}  my-1`}>
                <Text style={tw`text-white text-[10px] text-center`}>{item}</Text>
              </TouchableOpacity>
            )
          })}
        </View>


        {/* Transaction list + search filtering logic can go here */}
        {
          transactions && transactions.length > 0 ? (
            <ScrollView showsVerticalScrollIndicator={false}>
              {transactions && transactions.map((transaction, key) => (
                <TouchableOpacity onPress={() => navigation.navigate(AppRoutes.DetailTransactionViaTagTransfer, {
                  data: transaction?.reference || transaction?.
                    internal_ref
                })} activeOpacity={0.6} style={tw`flex-row border-b border-gray-900 relative py-2 justify-between items-center px-5`}>
                  {
                    transaction?.has_dispute || transaction.dispute_comment ? <View style={tw`absolute top-2 right-20 `}>
                      <Text style={tw`text-red-700 text-[10px]`}>Reported</Text>
                    </View> : null
                  }
                  <View style={tw`flex-row justify-start gap-2 items-center`}>
                    {/* logo and title */}
                    <Image source={require("../../../assets/images/avatar.png")} style={tw`w-9 h-9 rounded-full`} />
                    <View>
                      <Text style={tw`text-white text-[10px]`}>{transaction?.type == "OUTGOING" ? 'Transfer to ' : 'Recieved from '}{transaction?.recipient?.bank_name ? transaction?.recipient?.bank_name : 'Pressend'}</Text>
                      <Text style={tw`text-[#ffffff99] text-[10px] mt-1 `}>{transaction?.updatedAt}</Text>
                    </View>
                  </View>

                  <View>
                    <Text style={tw`text-white text-right text-[10px]`}>{transaction?.type == "OUTGOING" ? "-" : "+"}{" "}{transaction?.currency === "NGN" ? '₦' : transaction?.currency}{FormatAmount(`${transaction?.amount}`)}</Text>
                    <Text style={tw`${transaction?.status == "success" ? "text-green-500" : transaction?.status == "failed" ? "text-red-500" : 'text-orange-600'} text-right text-[10px] mt-1 `}>{transaction?.status}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) :
            <View style={tw`w-fit mx-auto mt-44`}>
              <MagnifyingGlassIcon style={tw`text-gray-700 w-fit mx-auto`} size={44} />
              <Text style={tw`text-gray-600 text-[12px]`}>No Transaction found!</Text>
            </View>
        }

      </View>
    </>
  );
}

export default ListTransaction;
