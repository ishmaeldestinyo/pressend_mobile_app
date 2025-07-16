import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Pressable,
} from 'react-native';
import tw from 'twrnc';

import Animated, {
  FadeIn,
  FadeInUp,
  FadeOut,
  SlideInUp,
  SlideOutDown,
} from 'react-native-reanimated';
import {
  CheckIcon,
  CheckCircleIcon,
  FingerPrintIcon,
  HandRaisedIcon,
  KeyIcon,
  BanknotesIcon,
  WifiIcon,
} from 'react-native-heroicons/outline';

import TopNavbar from '../../components/TopNavbar';
import { PaymentMode } from '../../utils/paymentUtil';
import CryptoTransferCard from '../../components/CryptoTransferCard';
import FiatTransferCard from '../../components/FiatTransferCard';
import TagTransferCard from '../../components/TagTransferCard';
import { useAuth } from '../../context/userContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppRoutes, RootStackParamList } from '../../constants/routes';
import { axiosInstance } from '../../api/axiosConfig';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LoadingModal from '../../components/LoadingModal';
import LottieView from 'lottie-react-native';
import { FormatAmount, GetAmountScale } from '../../utils/formatAmount';

function TransferAssetList() {
  const [mode, setMode] = useState(PaymentMode.CRYPTO);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('₦');
  const [tag, setTag] = useState('');
  const [note, setNote] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [error, setError] = useState('');
  const [tagnameError, setTagnameError] = useState('');
  const [confirmationMethod, setConfirmationMethod] = useState<string | null>(null);

  const [bank, setBank] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [account, setAccount] = useState('');

  const [showFingerprintModal, setShowFingerprintModal] = useState(false);
  const [showPalmprintModal, setShowPalmprintModal] = useState(false);

  const { authUser, setAuthUser } = useAuth();
  const [tooltipMessage, setTooltipMessage] = useState('');


  // PIN modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pin, setPin] = useState<string[]>(['', '', '', '']);

  // Helpers to set and handle PIN input
  const handlePinButtonPress = (num: string) => {
    const nextPin = [...pin];
    const emptyIndex = nextPin.findIndex((d) => d === '');
    if (emptyIndex !== -1) {
      nextPin[emptyIndex] = num;
      setPin(nextPin);
    }
  };

  const handlePinBackspace = () => {
    const nextPin = [...pin];
    const lastFilledIndex = nextPin.slice().reverse().findIndex((d) => d !== '');
    if (lastFilledIndex !== -1) {
      // convert reverse index to normal index
      const idx = nextPin.length - 1 - lastFilledIndex;
      nextPin[idx] = '';
      setPin(nextPin);
    }
  };

  const [bankNetworkMsg, setBankNetworkMsg] = useState('');

  // check bank network status
  useEffect(() => {
    const checkBankNetworkStatus = async () => {
      try {

        const response = await axiosInstance.get(`/accounts/fiat/bank/network-status?bank_code=${bankCode}`);

        if (response?.status == 200) {
          setBankNetworkMsg(`${bank} has ${response?.data?.network_status}% successful rate`);
        }

      } catch (error: any) {
        console.log(error!.response?.data?.message);

      } finally {
      }

    }

    checkBankNetworkStatus();

  }, [bank, bankCode])

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showSuccess, setShowSuccess] = useState(false);


  const [loading, setLoading] = useState(false);

  const submitPin = async () => {
    if (pin.some((d) => d === '')) {
      setError('Please enter a 4-digit PIN');
      return;
    }
    setError('');
    setPin(['', '', '', '']);

    try {

      const accessToken = await AsyncStorage.getItem("accessToken");

      if (mode == PaymentMode.TAG) {
        const response = await axiosInstance.post(
          "/accounts/fiat/tag-transfer",
          {
            recipient_tag: tag,
            amount: parseInt(amount),
            reason: note,
            payment_pin: pin.join(''),
          },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        if (response.status === 201) {
          setShowSuccess(true); // Show animation
          setPin(['', '', '', '']);

          const data = response?.data?.data;

          setAuthUser(data.sender);

          const internalRef = data?.internal_ref;

          // Delay navigation so user sees the Lottie animation
          setShowPinModal(false);
          setTimeout(() => {
            setShowSuccess(false); // hide animation
          }, 2500);

          navigation.navigate(AppRoutes.DetailTransactionViaTagTransfer, { data: internalRef });

        } else {
          setError('Something went wrong, please try again.');
        }
      }

      else if (mode == PaymentMode.FIAT) {

        // valide the bank and all other information about the user and the bank

        // get bank transfer_code

        // call the bank transfer code

      } else {
        // crypto payment
      }
    } catch (error: any) {
      setTagnameError(error?.response?.data?.message);
    } finally {
      setShowPinModal(true); // Optional: only if failure
      setLoading(false);
    }
  };



  const handleSubmit = async () => {
    const numAmount = parseFloat(amount);
    if (currency === '₦' && (isNaN(numAmount) || numAmount < 50)) {
      setError('Minimum transfer is ₦50');
      return;
    }

    if (currency === "₦" && parseInt(amount) > authUser!.account_id.ng_balance) {
      setError('Insufficient fund, please top-up!');
      return;
    }

    if (!tag || tag.length < 3) {
      setTagnameError("Please enter a valid tagname");
      return;
    }

    const accessToken = await AsyncStorage.getItem("accessToken");
    try {
      const response = await axiosInstance.get(`/accounts/tag/${tag}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      setError('');
      setTagnameError('');

      if (response?.status == 200) {
        setError('');
        setShowPreview(true);
        return;
      }

      setError(response?.data?.message);
      setShowPreview(false);
      return;

    } catch (error: any) {
      setTagnameError(error?.response?.data?.message)
    } finally {
      setLoading(false);
    }
  };

  const renderCard = () => {
    switch (mode) {
      case PaymentMode.CRYPTO:
        return <CryptoTransferCard />;
      case PaymentMode.FIAT:
        return <FiatTransferCard
          bank={bank}
          setBank={setBank}
          bankCode={bankCode}
          setBankCode={setBankCode}
          account={account}
          setAccount={setAccount}
          note={note}
          setNote={setNote}
        />;
      case PaymentMode.TAG:
        return (
          <TagTransferCard tagnameError={tagnameError} setTagnameError={setTagnameError} tag={tag} setTag={setTag} note={note} setNote={setNote} />
        );
      default:
        return null;
    }
  };

  const getHelpText = () => {
    switch (confirmationMethod) {
      case 'key':
        return 'Forgot pin?';
      case 'hand':
        return 'Reset palmprint';
      case 'fingerprint':
        return 'Set fingerprint';
      default:
        return '';
    }
  };

  const handleGetHelpText = () => {
    switch (confirmationMethod) {
      case 'key':
        navigation.navigate(AppRoutes.SetPaymentPin)
        return;
      case 'hand':
        navigation.navigate(AppRoutes.SetPalmprint)
        return;
      case 'fingerprint':
        navigation.navigate(AppRoutes.EnableFingerprint);
        return;
      default:
        return '';
    }
  };



  return (
    <>
      {loading && <LoadingModal />}

      <View style={tw`bg-[#020618] flex-1`}>
        <TopNavbar title="Transfer" />

        <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={tw`p-4 pb-32`}>
          <View style={tw`flex-row mb-4`}>
            {Object.values(PaymentMode).map((m) => (
              <TouchableOpacity
                key={m}
                onPress={() => setMode(m)}
                style={tw`flex-1 mx-1 py-3 rounded relative ${mode === m ? 'bg-blue-500' : 'bg-gray-700'
                  } items-center justify-center`}
              >
                {mode === m && (
                  <View style={tw`absolute top-1 left-1 bg-green-500 rounded-full p-0.5`}>
                    <CheckIcon size={10} color="white" />
                  </View>
                )}
                <Text style={tw`text-white text-xs`}>{m}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={tw`text-white mb-1`}>Amount</Text>
          <View style={tw`relative mb-6`}>
            <View style={tw`flex-row items-center`}>
              <TextInput
                value={amount}
                onChangeText={(text) => {
                  setError('');
                  setAmount(text.replace(/[^0-9.]/g, ''));
                }}
                placeholder="0.00"
                placeholderTextColor="gray"
                keyboardType="decimal-pad"
                style={tw`flex-1 bg-gray-800 text-transparent caret-white rounded-l px-4 py-2`}
              />
              <View pointerEvents="none" style={tw`absolute left-0 right-20 px-4 py-2`}>
                <Text style={tw`text-white`}>{FormatAmount(amount)}</Text>
              </View>
              <TextInput
                value={currency}
                onChangeText={setCurrency}
                placeholder="CUR"
                placeholderTextColor="gray"
                style={tw`w-20 bg-gray-700 text-white text-center rounded-r px-2 py-2`}
              />
            </View>

            {GetAmountScale(amount) && (
              <View style={tw`absolute left-16 -top-3 bg-gray-800 px-3 py-1 rounded-full shadow-md`}>
                <Text style={tw`text-white text-[11px]`}>{GetAmountScale(amount)}</Text>
              </View>
            )}


            {error ? <Text style={tw`text-red-500 text-[13px] mt-2`}>{error}</Text> : null}

            {currency === "₦" && parseInt(amount) > authUser!.account_id.ng_balance ? <Text style={tw`text-red-500 text-[13px] mt-2`}>Insufficient fund, please fund your account.</Text> : null}
          </View>

          {bankNetworkMsg && bank ? <View style={tw`flex-row justify-center  border border-gray-800 rounded p-1 gap-1 mb-4 mx-auto w-fit px-5 items-center`} >
            <WifiIcon style={tw`text-orange-400 `} size={16} />
            <Text style={tw`text-orange-400 text-center text-[12px]`}>{bankNetworkMsg}</Text>
          </View> : null}

          <View>
            <View style={{ display: mode === PaymentMode.CRYPTO ? 'flex' : 'none' }}>
              <CryptoTransferCard />
            </View>
            <View style={{ display: mode === PaymentMode.FIAT ? 'flex' : 'none' }}>
              <FiatTransferCard
                bank={bank}
                setBank={setBank}
                bankCode={bankCode}
                setBankCode={setBankCode}
                account={account}
                setAccount={setAccount}
                note={note}
                setNote={setNote}
              />
            </View>
            <View style={{ display: mode === PaymentMode.TAG ? 'flex' : 'none' }}>
              <TagTransferCard
                tagnameError={tagnameError}
                setTagnameError={setTagnameError}
                tag={tag}
                setTag={setTag}
                note={note}
                setNote={setNote}
              />
            </View>
          </View>

        </ScrollView>

        <View style={tw`absolute bottom-8 left-4 right-4`}>
          <TouchableOpacity
            disabled={currency === "₦" && parseInt(amount) > authUser!.account_id.ng_balance}
            onPress={handleSubmit}
            style={tw` ${currency === "₦" && parseInt(amount) > authUser!.account_id.ng_balance ? 'bg-gray-500 ' : 'bg-blue-600'} rounded-full py-3 items-center`}
          >
            <Text style={tw`text-white font-bold text-sm`}>Preview</Text>
          </TouchableOpacity>
        </View>

        {/* Preview Modal */}
        <Modal visible={showPreview} transparent animationType="fade">
          <Pressable style={tw`flex-1 bg-black/50`}>
            <View style={tw`flex-1 justify-end`}>
              <Animated.View
                style={tw`w-full bg-[#020618] px-6 pt-4 pb-[40px] rounded-t-2xl`}
              >
                <Pressable
                  style={tw`absolute z-50 left-1/2 top-3`}
                  onPress={() => setShowPreview(false)}
                >
                  <View style={tw`h-1.5 rounded-full w-16 mx-auto bg-[#2299fb]`} />
                </Pressable>
                <Text style={tw`text-center mt-4 text-white font-bold text-2xl mb-4`}>
                  {currency}
                  {FormatAmount(amount)}
                </Text>

                {tag ? (
                  <View
                    style={tw`mb-2 flex-row py-2 border-b border-gray-900 justify-between`}
                  >
                    <Text style={tw`text-gray-400 mb-1`}>Tag</Text>
                    <Text style={tw`text-white`}>{tag}</Text>
                  </View>
                ) : null}

                {note ? (
                  <View
                    style={tw`mb-4 flex-row py-2 border-b border-gray-900 justify-between`}
                  >
                    <Text style={tw`text-gray-400 mb-1`}>Note</Text>
                    <Text style={tw`text-white`}>
                      {note.length > 5 ? note.slice(0, 7) + '...' : note}
                    </Text>
                  </View>
                ) : null}

                {confirmationMethod && (
                  <TouchableOpacity onPress={handleGetHelpText}>
                    <Text style={tw`text-blue-400 my-4 text-center`}>{getHelpText()}</Text>
                  </TouchableOpacity>
                )}

                <View style={tw`flex-row justify-evenly pt-5 items-center`}>
                  {[
                    { key: 'fingerprint', Icon: FingerPrintIcon },
                    { key: 'hand', Icon: HandRaisedIcon },
                    { key: 'key', Icon: KeyIcon },
                  ].map(({ key, Icon }) => {
                    const isSelected = confirmationMethod === key;
                    return (
                      <TouchableOpacity
                        key={key}
                        onPress={() => {
                          setConfirmationMethod(key);
                          setShowPreview(false);
                          if (key === 'key') setShowPinModal(true);
                          if (key === 'key') setShowPinModal(true);
                          if (key === 'fingerprint') setShowFingerprintModal(true);
                          if (key === 'hand') setShowPalmprintModal(true);

                        }}
                        style={tw`relative items-center justify-center p-3 rounded ${isSelected ? 'border border-[#2299fb]' : ''
                          }`}
                      >
                        {isSelected && (
                          <CheckCircleIcon
                            style={tw`text-[#2299fb] absolute top-0.5 right-0.5`}
                          />
                        )}
                        <Icon color="white" size={40} />
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </Animated.View>
            </View>
          </Pressable>
        </Modal>

        {/* PIN Modal with Number Pad */}
        <Modal visible={showPinModal} transparent animationType="fade">
          <Pressable
            style={tw`flex-1 bg-black/50`}
            onPress={() => setShowPinModal(false)}
          >
            <View style={tw`flex-1 justify-end`}>
              <Animated.View
                style={tw`bg-[#020618] rounded-t-2xl px-6 py-4 max-h-[70%]`}
              >
                <ScrollView
                  contentContainerStyle={tw`items-center`}
                  showsVerticalScrollIndicator={false}
                >
                  <Text style={tw`text-white text-lg text-center mb-4`}>Enter PIN</Text>

                  {/* Tooltip Message */}
                  {tooltipMessage !== '' && (
                    <Animated.View
                      entering={FadeIn}
                      exiting={FadeOut}
                      style={tw`mb-3 bg-[#1e3a8a] px-4 py-2 rounded-full`}
                    >
                      <Text style={tw`text-white text-sm text-center`}>
                        {tooltipMessage}
                      </Text>
                    </Animated.View>
                  )}
                  {showSuccess && (
                    <Animated.View
                      entering={FadeInUp.duration(400)}
                      style={tw`absolute z-50 bg-black/60 flex-1 justify-center items-center w-full h-full`}
                    >
                      <LottieView
                        source={require('../../../assets/lotties/f8.json')}
                        autoPlay
                        loop={false}
                        style={tw`w-4/5 h-72`}
                      />
                    </Animated.View>
                  )}

                  {/* PIN display */}
                  <View style={tw`flex-row justify-between mb-6 w-full px-7`}>
                    {pin.map((digit, idx) => (
                      <View
                        key={idx}
                        style={tw`w-14 h-14 border border-[#3c4464] rounded-md items-center justify-center`}
                      >
                        <Text style={tw`text-white text-2xl`}>
                          {digit ? '•' : ''}
                        </Text>
                      </View>
                    ))}
                  </View>

                  {/* Number pad */}
                  <View style={tw`flex-row flex-wrap justify-center w-full px-4`}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                      <TouchableOpacity
                        key={num}
                        onPress={() => handlePinButtonPress(num.toString())}
                        style={tw`w-20 h-14 m-1 bg-gray-700 rounded-md items-center justify-center`}
                      >
                        <Text style={tw`text-white text-xl`}>{num}</Text>
                      </TouchableOpacity>
                    ))}

                    {/* Pay button before 0 */}
                    <TouchableOpacity
                      onPress={submitPin}
                      style={tw`w-20 h-14 m-1 bg-green-600 rounded-md items-center justify-center`}
                    >
                      <Text style={tw`text-white text-[16px] font-bold`}>Pay</Text>
                    </TouchableOpacity>

                    {/* Zero button */}
                    <TouchableOpacity
                      onPress={() => handlePinButtonPress('0')}
                      style={tw`w-20 h-14 m-1 bg-gray-700 rounded-md items-center justify-center`}
                    >
                      <Text style={tw`text-white text-xl`}>0</Text>
                    </TouchableOpacity>

                    {/* Backspace button */}
                    <TouchableOpacity
                      onPress={handlePinBackspace}
                      style={tw`w-20 h-14 m-1 bg-red-600 rounded-md items-center justify-center`}
                    >
                      <Text style={tw`text-white text-xl`}>⌫</Text>
                    </TouchableOpacity>
                  </View>


                  <TouchableOpacity
                    onPress={submitPin}
                    style={tw`mt-6 bg-blue-600 rounded-full py-3 w-full items-center`}
                  >
                    <Text style={tw`text-white font-bold text-sm`}>Submit</Text>
                  </TouchableOpacity>
                </ScrollView>
              </Animated.View>
            </View>
          </Pressable>
        </Modal>

        {/* Fingerprint Modal */}
        <Modal visible={showFingerprintModal} transparent animationType="fade">
          <Pressable
            style={tw`flex-1 bg-black/50`}
            onPress={() => setShowFingerprintModal(false)}
          >
            <View style={tw`flex-1 justify-end`}>
              <Animated.View style={tw`bg-[#020618] rounded-t-2xl px-6 py-4 max-h-[40%]`}>
                <Text style={tw`text-white text-center text-lg mb-4`}>Fingerprint Confirmation</Text>
                {/* Your fingerprint modal content goes here */}
                <TouchableOpacity
                  onPress={() => setShowFingerprintModal(false)}
                  style={tw`bg-blue-600 rounded-full py-3 mt-4`}
                >
                  <Text style={tw`text-white text-center`}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Pressable>
        </Modal>

        {/* Palmprint Modal */}
        <Modal visible={showPalmprintModal} transparent animationType="fade">
          <Pressable
            style={tw`flex-1 bg-black/50`}
            onPress={() => setShowPalmprintModal(false)}
          >
            <View style={tw`flex-1 justify-end`}>
              <Animated.View style={tw`bg-[#020618] rounded-t-2xl px-6 py-4 max-h-[40%]`}>
                <Text style={tw`text-white text-center text-lg mb-4`}>Palmprint Confirmation</Text>
                {/* Your palmprint modal content goes here */}
                <TouchableOpacity
                  onPress={() => setShowPalmprintModal(false)}
                  style={tw`bg-blue-600 rounded-full py-3 mt-4`}
                >
                  <Text style={tw`text-white text-center`}>Close</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Pressable>
        </Modal>

      </View>
    </>
  );
}

export default TransferAssetList;
