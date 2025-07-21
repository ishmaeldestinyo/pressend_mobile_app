import React, { useState } from 'react';
import {
  View,
  Text,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  Platform,
  ToastAndroid,
  Share,
} from 'react-native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-clipboard/clipboard';
import tw from 'twrnc';
import TopNavbar from '../../components/TopNavbar';
import LoadingModal from '../../components/LoadingModal';
import { useAuth } from '../../context/userContext';

function RecieveAssetsList() {
  const layout = useWindowDimensions();
  const [loading, setLoading] = useState(false);
  const { authUser } = useAuth();
  const [copiedTooltip, setCopiedTooltip] = useState<string | null>(null);

  // Show copied message on Android Toast or iOS Alert
  const showCopied = (msg: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(msg, ToastAndroid.SHORT);
    } else {
      Alert.alert('Copied', msg);
    }
  };

  const handleCopy = (text: string, label: string) => {
    Clipboard.setString(text);
    showCopied(`${label} copied`);
  };

  const handleShare = async (message: string) => {
    try {
      await Share.share({ message });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  // Buttons component for Copy & Share
  const CopyShareRow = ({
    value,
    label,
  }: {
    value: string;
    label: string;
  }) => (
    <View style={tw`flex-row justify-center mt-3`}>
      <TouchableOpacity
        onPress={() => handleCopy(value, label)}
        style={tw`bg-white/20 px-4 py-2 rounded-full mr-3`}
      >
        <Text style={tw`text-white font-semibold`}>Copy</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => handleShare(`${label}: ${value}`)}
        style={tw`bg-white/20 px-4 py-2 rounded-full`}
      >
        <Text style={tw`text-white font-semibold`}>Share</Text>
      </TouchableOpacity>
    </View>
  );

  const CryptoQR = () => {
    const address = authUser?.wallet_address || '0x123...';
    return (
      <View style={tw`flex-1 justify-center items-center px-6`}>
        <Text style={tw`text-white text-xl font-bold mb-3`}>
          Scan to Receive Crypto
        </Text>
        <QRCode value={address} size={180} backgroundColor="white" />
        <Text style={tw`text-white mt-4 font-semibold`}>Your Wallet Address</Text>
        <Text style={tw`text-white text-xs text-center mt-1`}>{address}</Text>
        <CopyShareRow value={address} label="Wallet Address" />
        <Text style={tw`text-gray-400 text-xs mt-3 text-center`}>
          Use this QR to receive SOL tokens directly into your wallet.
        </Text>
      </View>
    );
  };

  const TagView = () => {
    const tag = `@${authUser?.account_id?.tagname || 'yourtag'}`;
    return (
      <View style={tw`flex-1 justify-center items-center px-6`}>
        <Text style={tw`text-white text-2xl font-bold`}>{tag}</Text>
        <CopyShareRow value={tag} label="Tag" />
        <Text style={tw`text-white mt-2 text-center text-sm`}>
          Share your unique tag with anyone to receive payments instantly and
          securely — no need to expose your wallet address.
        </Text>
      </View>
    );
  };

  const BankDetailView = () => {
    const bank = authUser?.account_id?.bank_detail || {};
    const detail = `Bank: ${bank.bank_name || 'N/A'}\nAcct No: ${
      bank.account_number || 'N/A'
    }\nAcct Name: ${bank.account_name || 'N/A'}`;
    return (
      <View style={tw`flex-1 justify-center items-center px-6`}>
        <Text style={tw`text-white text-xl font-bold mb-2`}>Receive to Your Bank</Text>
        <Text style={tw`text-white text-base`}>
          Bank: {bank.bank_name || 'N/A'}
        </Text>
        <Text style={tw`text-white text-base mt-1`}>
          Acct No: {bank.account_number || 'N/A'}
        </Text>
        <Text style={tw`text-white text-base mt-1`}>
          Acct Name: {bank.account_name || 'N/A'}
        </Text>
        <CopyShareRow value={detail} label="Bank Details" />
        <Text style={tw`text-gray-400 text-xs mt-3 text-center`}>
          Share your bank details only with trusted individuals.
        </Text>
      </View>
    );
  };

  const renderScene = SceneMap({
    crypto: CryptoQR,
    tag: TagView,
    bank: BankDetailView,
  });

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'crypto', title: 'Crypto' },
    { key: 'tag', title: 'Tag' },
    { key: 'bank', title: 'Bank' },
  ]);

  return (
    <>
      {loading && <LoadingModal />}
      <View style={tw`bg-[#020618] flex-1`}>
        <TopNavbar title="Receive" />
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={(props) => (
            <TabBar
              {...props}
              indicatorStyle={tw`bg-white`}
              style={tw`bg-[#020618]`}
              labelStyle={tw`text-white font-bold`}
            />
          )}
        />
      </View>
    </>
  );
}

export default RecieveAssetsList;
