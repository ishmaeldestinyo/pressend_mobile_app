import React, { useState, useRef, useEffect } from 'react';
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Platform,
  ToastAndroid,
  Alert,
} from 'react-native';
import tw from 'twrnc';

import {
  CheckIcon,
  WifiIcon,
} from 'react-native-heroicons/outline';
import * as Keychain from 'react-native-keychain';
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
import { FormatAmount, GetAmountScale } from '../../utils/formatAmount';
import { useAxiosWithNetworkCheck } from '../../api/useAxiosWithNetworkCheck';
import PalmprintModal from '../../components/PalmprintModal';
import FingerprintModal from '../../components/FingerprintModal';
import PaymentPinModal from '../../components/PaymentPinModal';
import PaymentModeModal from '../../components/PaymentModeModal';

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
  const checkBankNetworkStatus = async () => {
    try {

      const response = await axiosInstance.get(`/accounts/fiat/bank/network-status/?bank_code=${bankCode}`);

      if (response?.status == 200) {
        if (response?.data?.network_status == 0) {
          setBankNetworkMsg("");
          return;
        }
        setBankNetworkMsg(`${bank} has ${response?.data?.network_status}% successful rate`);
      }

    } catch (error: any) {
      console.log(error!.response?.data?.message);

    } finally {
    }

  }


  useEffect(() => {
    const loadPinFromKeychain = async () => {
      try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
          // Assuming PIN is stored as "1234"
          setPin(credentials.password.split(''));
        }
      } catch (err) {
        console.error('Failed to load PIN from Keychain', err);
      }
    };

    loadPinFromKeychain();
  }, []);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const [showSuccess, setShowSuccess] = useState(false);

  const { axiosRequest } = useAxiosWithNetworkCheck();

  const [loading, setLoading] = useState(false);

  const [beneficiary, setBeneficiary] = useState('');

  const [invalidAcctError, setInvalidAcctError] = useState('');

  const [recipientCode, setRecipientCode] = useState('');

  const handleTransferRecipient = async () => {
    try {

      const response = await axiosRequest({
        url: '/accounts/fiat/bank/recipient',
        method: "POST",
        data: { bank_code: bankCode, account_number: account, description: note },
        headers: {
          Authorization: `Bearer ${await AsyncStorage.getItem("accessToken")}`
        }
      })

      if (!response) {
        setLoading(false);
        return;
      }

      if (response && response?.status == 201) {
        setRecipientCode(response?.data?.recipient?.recipient_code);
        setBeneficiary(response?.data?.recipient?.details?.account_name);
      } else {
        setRecipientCode(response?.data?.recipient?.recipient_code || ' ');
        setBeneficiary(response?.data?.recipient?.details?.account_name || ' ');
        setInvalidAcctError(response?.data?.message);
        return;

      }

    } catch (error: any) {

      if (error?.response?.status == 401) {
        navigation.navigate(AppRoutes.ImportWallet);
      }
      setInvalidAcctError(error?.response?.data?.message);

    } finally {
      setLoading(false);
    }
  }

  const prevBankCodeRef = useRef(bankCode);
  const prevAccountRef = useRef(account);


  useEffect(() => {
    const prevBankCode = prevBankCodeRef.current;
    const prevAccount = prevAccountRef.current;

    const bankChanged = prevBankCode !== bankCode;
    const accountIsTenDigits = account.length === 10;
    const accountChanged = prevAccount !== account;

    // Always check bank status if bank or bankCode changed
    if (bank && bankCode && bankChanged) {
      checkBankNetworkStatus();
    }

    // Run handleTransferRecipient only when:
    // - bankCode changed OR
    // - account just reached 10 digits (and changed)
    if (bank && bankCode && accountIsTenDigits && (bankChanged || accountChanged)) {
      handleTransferRecipient();
    }

    // Update refs
    prevBankCodeRef.current = bankCode;
    prevAccountRef.current = account;
  }, [bank, bankCode, account]);



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

        if (!recipientCode) {
          setError("Please confirm recipient!");
          return;
        }

        const response = await axiosRequest({
          method: "POST",
          url: '/accounts/fiat/bank/transfer',
          data: { amount, recipient_code: recipientCode, reason: note, payment_pin: pin.join('') },
          headers: {
            Authorization: `Bearer ${await AsyncStorage.getItem("accessToken")}`
          }
        })

        console.log(response?.data);

        if (!response) {
          setLoading(false);
          return;
        }

        setShowPinModal(false);
        setTimeout(() => {
          setShowSuccess(false); // hide animation
        }, 2500);

        navigation.navigate(AppRoutes.DetailTransactionViaTagTransfer, { data: response?.data?.reference });

      } else {
        // crypto payment
      }
    } catch (error: any) {
      setError(error?.response?.data?.message || error?.response?.message);
      setShowPreview(false);
    } finally {
      setShowPreview(false);
      setShowPinModal(true);
      setLoading(false);
    }
  };


  const handleAuthenticated = async () => {
    const credentials = await Keychain.getGenericPassword();

    var message = 'Please setup your payment pin';

    if (credentials) {
      const pin = credentials.password;

      await submitPin();

    } else {
      if (Platform.OS === 'android') {

        ToastAndroid.show(message, ToastAndroid.SHORT);
      } else {
        Alert.alert(message || 'Notice', message);
      }
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

    const accessToken = await AsyncStorage.getItem("accessToken");
    try {

      if (mode == PaymentMode.TAG) {

        if (!tag || tag.length < 3) {
          setTagnameError("Please enter a valid tagname");
          return;
        }

        const response = await axiosRequest({
          method: "GET",
          url: `/accounts/tag/${tag}`,
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
      } else if (mode == PaymentMode.FIAT) {
        if (!bank) {
          setError("Please select recipient's bank");
          return;
        }
        setShowPreview(true);

      }

    } catch (error: any) {
      setTagnameError(error?.response?.data?.message)
    } finally {
      setLoading(false);
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
                setInvalidAcctError={setInvalidAcctError}
                invalidAcctError={invalidAcctError}
                bank={bank}
                setBeneficiary={setBeneficiary}
                beneficiary={beneficiary}
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
        <PaymentModeModal
          showPreview={showPreview}
          setShowPreview={setShowPreview}
          tag={tag}
          currency={currency}
          amount={amount}
          note={note}
          navigation={navigation}
          confirmationMethod={confirmationMethod}
          setConfirmationMethod={setConfirmationMethod}
          setShowPinModal={setShowPinModal}
          setShowFingerprintModal={setShowFingerprintModal}
          setShowPalmprintModal={setShowPalmprintModal}
        />

        {/* PIN Modal with Number Pad */}
        <PaymentPinModal
          showPinModal={showPinModal}
          setShowPinModal={setShowPinModal} tooltipMessage={tooltipMessage} showSuccess={showSuccess} pin={pin} handlePinButtonPress={handlePinButtonPress} submitPin={submitPin} handlePinBackspace={handlePinBackspace}
        />

        {/* Fingerprint Modal */}
        <FingerprintModal setShowFingerprintModal={setShowFingerprintModal} showFingerprintModal={showFingerprintModal} onAuthenticated={handleAuthenticated} />

        {/* Palmprint Modal */}
        <PalmprintModal showPalmprintModal={showPalmprintModal} setShowPalmprintModal={setShowPalmprintModal} />

      </View>
    </>
  );
}

export default TransferAssetList;
