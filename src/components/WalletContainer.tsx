import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  PaperAirplaneIcon,
  ArrowDownTrayIcon,
  BanknotesIcon,
} from 'react-native-heroicons/outline';
import { Colors } from '../constants/colors';

import ListTokens, { Token } from './ListTokens';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AppRoutes, RootStackParamList } from '../constants/routes';
import { useAuth } from '../context/userContext';

type WalletContainerProps = {
  tokens: Token[];
  scrollY: Animated.Value;
  showTag: boolean,
  setShowTag: (val: boolean) => void
};

const ASSETS = ['NGN', 'USDT', 'SOL'];

const usdtIcon = require('../../assets/images/usdt.png');
const solIcon = require('../../assets/images/sol.png');

export default function WalletContainer({ tokens, scrollY, setShowTag, showTag }: WalletContainerProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [assetIndex, setAssetIndex] = useState(0);

  const { authUser } = useAuth();

  const screenWidth = Dimensions.get('window').width;
  const isSmall = screenWidth < 360;

  const currentAsset = ASSETS[assetIndex];
  const cycleAsset = () => setAssetIndex((i) => (i + 1) % ASSETS.length);

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <View style={styles.wrapper}>
      {/* ── Wallet Card ───────────────────────────── */}
      <View style={styles.fullCard}>
        {/* Top Row */}
        <View style={styles.topRow}>
          <View style={styles.balanceLeft}>
            {showTag ? (
              authUser?.account_id?.ng_balance !== undefined ? (
                <Text style={styles.balanceText}>
                  {formatBalance(currentAsset, authUser.account_id.ng_balance)}
                </Text>
              ) : (
                <ActivityIndicator size="small" color={Colors.accent} />
              )
            ) : (
              <Text style={styles.balanceText}>•••••••••••</Text>
            )}
            <TouchableOpacity onPress={cycleAsset} style={styles.assetPickerInline}>
              <Text style={styles.assetText}>{currentAsset}</Text>
              <ChevronDownIcon size={16} color={Colors.accent} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate(AppRoutes.ListTransaction)}
            style={styles.historyButton}
          >
            <Text style={styles.historyText}>Transaction</Text>
            <ChevronRightIcon size={14} color={Colors.accent} />
          </TouchableOpacity>
        </View>

        {/* Action Grid */}
        <View
          style={[
            styles.actionGrid,
            isSmall && { flexWrap: 'wrap', justifyContent: 'space-between' },
          ]}
        >
          <ActionItem
            onPress={() => navigation.navigate(AppRoutes.TransferAssetList)}
            label="Transfer"
            Icon={PaperAirplaneIcon}
            iconStyle={{ transform: [{ rotate: '-45deg' }] }}
          />
          <ActionItem
            onPress={() => navigation.navigate(AppRoutes.RecieveAssetsList)}
            label="Receive"
            Icon={ArrowDownTrayIcon}
          />
          <ActionItem
            onPress={() => navigation.navigate(AppRoutes.WithdrawAssetList)}
            label="Swap"
            Icon={BanknotesIcon}
          />
        </View>
      </View>

      {/* ── Scrollable Token List ────────────── */}
      <View style={{ marginTop: 14, flex: 1 }}>
        <ListTokens tokens={tokens} scrollY={scrollY} />
      </View>
    </View>
  );
}

const ActionItem = ({
  label,
  Icon,
  iconStyle,
  onPress,
}: {
  label: string;
  Icon: React.ComponentType<{ color?: string; size?: number; style?: any }>;
  iconStyle?: any;
  onPress: () => void;
}) => (
  <TouchableOpacity onPress={onPress} style={styles.actionItem} activeOpacity={0.85}>
    <View style={styles.actionIconWrap}>
      <Icon size={22} color={Colors.primary} style={iconStyle} />
    </View>
    <Text style={styles.actionLabel}>{label}</Text>
  </TouchableOpacity>
);

// Updated to return React element for USDT and SOL
const formatBalance = (asset: string, ng_balance?: number): React.ReactNode => {
  switch (asset) {
    case 'NGN':
      return (
        <Text style={styles.balanceText}>
          ₦{(ng_balance || 0).toLocaleString('en-NG', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </Text>
      );
    case 'USDT':
      return (
        <View style={styles.assetRow}>
          <Image source={usdtIcon} style={styles.assetIcon} />
          <Text style={styles.balanceText}>0.00</Text>
        </View>
      );
    case 'SOL':
      return (
        <View style={styles.assetRow}>
          <Image source={solIcon} style={styles.assetIcon} />
          <Text style={styles.balanceText}>0.00</Text>
        </View>
      );
    default:
      return <Text style={styles.balanceText}>0.00</Text>;
  }
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 20,
    flex: 1,
  },
  fullCard: {
    backgroundColor: '#ffffff10',
    borderRadius: 14,
    padding: 16,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  balanceText: {
    color: Colors.textColor,
    fontSize: 20,
    fontWeight: '700',
  },
  assetPickerInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#ffffff15',
  },
  assetText: {
    color: Colors.accent,
    fontSize: 10,
  },
  historyButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyText: {
    color: Colors.accent,
    fontSize: 11,
    marginRight: 4,
  },
  actionGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
  },
  actionItem: {
    alignItems: 'center',
    width: 100,
    marginBottom: 20,
  },
  actionIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#ffffff10',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  actionLabel: {
    color: Colors.accent,
    fontSize: 10,
    fontWeight: '500',
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  assetIcon: {
    width: 19,
    borderRadius: 100,
    height: 19,
    resizeMode: 'contain',
  },
});
