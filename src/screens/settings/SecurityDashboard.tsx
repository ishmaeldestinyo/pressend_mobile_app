import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import {
  FingerPrintIcon,
  HandRaisedIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  LockClosedIcon,
  FaceSmileIcon,
  ArrowLeftIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Colors } from '../../constants/colors';
import { RootStackParamList } from '../../constants/routes';
import TopNavbar from '../../components/TopNavbar';

type Item = {
  title: string;
  description: string;
  Icon: React.ComponentType<{ color?: string; size?: number }>;
};

const items: Item[] = [
  {
    title: 'Fingerprint',
    description: 'Use Touch‑ID for fast sign‑in.',
    Icon: FingerPrintIcon,
  },
  {
    title: 'Palmprint',
    description: 'Palm verification for higher limits.',
    Icon: HandRaisedIcon,
  },
  {
    title: 'Panic Mode',
    description: 'Quickly hide balances in emergencies.',
    Icon: ExclamationTriangleIcon,
  },
  {
    title: 'Payment PIN',
    description: '4‑digit PIN for each transaction.',
    Icon: KeyIcon,
  },
  {
    title: '2-Factor Auth',
    description: 'Add extra security using OTP codes.',
    Icon: LockClosedIcon,
  },
  {
    title: 'Face ID',
    description: 'Use facial recognition to unlock quickly.',
    Icon: FaceSmileIcon,
  },
];

export default function SecurityDashboard() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* ── Header / Navbar ───────────────────────────────────────────── */}
      <TopNavbar title='Security Center'/>

      {/* ── Grid ─────────────────────────────────────────────────────── */}
      <ScrollView
        contentContainerStyle={styles.gridWrapper}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.grid}>
          {items.map(({ title, description, Icon }) => (
            <TouchableOpacity
              key={title}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => {
                // TODO: add navigation or functionality here
              }}
            >
              <Icon color={Colors.primary} size={28} />
              <Text style={styles.cardTitle}>{title}</Text>
              <Text style={styles.cardDesc}>{description}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_GAP = 16;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.backgroundColor,
  },

  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },

  navTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textColor,
  },

  gridWrapper: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },

  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: CARD_GAP,
  },

  card: {
    width: '44%',
    backgroundColor: '#ffffff10',
    borderRadius: 14,
    paddingVertical: 20,
    paddingHorizontal: 12,
    alignItems: 'center',
  },

  cardTitle: {
    color: Colors.textColor,
    fontSize: 16,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },

  cardDesc: {
    color: Colors.accent,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
});
