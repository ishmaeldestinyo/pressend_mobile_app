import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Animated,
  Dimensions,
  Pressable,
  ToastAndroid,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import {
  BellIcon,
  QrCodeIcon,
  EyeIcon,
  EyeSlashIcon,
  Bars3BottomLeftIcon,
  ArrowLeftIcon,
  HomeIcon,
  Cog6ToothIcon,
  ArrowPathIcon,
  ArrowRightOnRectangleIcon,
} from 'react-native-heroicons/outline';
import { useNavigation } from '@react-navigation/native';
import { Colors } from '../constants/colors';
import { useAuth } from '../context/userContext';
import { AppRoutes } from '../constants/routes';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

export default function HomeNavbar() {
  const [showTag, setShowTag] = useState(true);
  const [copied, setCopied] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);
  const slideAnim = useRef(new Animated.Value(-SCREEN_WIDTH)).current;
  const { authUser } = useAuth();
  const navigation = useNavigation();

  const singleTapTimeout = useRef<NodeJS.Timeout | null>(null);
  const lastTap = useRef<number>(0);

  const handleCopyTagname = () => {
    const tag = authUser?.account_id?.tagname;
    if (!tag) return;
    Clipboard.setString(tag);
    setCopied(true);
    ToastAndroid.show('Tag copied!', ToastAndroid.SHORT);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleTagPress = () => {
    const now = Date.now();
    if (lastTap.current && now - lastTap.current < 300) {
      // Double tap detected
      if (singleTapTimeout.current) clearTimeout(singleTapTimeout.current);
      handleCopyTagname();
    } else {
      // First tap — delay single tap to wait for possible double
      singleTapTimeout.current = setTimeout(() => {
        navigation.navigate(AppRoutes.SetTagname);
      }, 300);
    }
    lastTap.current = now;
  };

  const openMenu = () => {
    setMenuVisible(true);
    Animated.timing(slideAnim, {
      toValue: 0,
      duration: 250,
      useNativeDriver: true,
    }).start();
  };

  const closeMenu = () => {
    Animated.timing(slideAnim, {
      toValue: -SCREEN_WIDTH,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setMenuVisible(false));
  };

  const menuItems = [
    {
      label: 'Home',
      icon: <HomeIcon size={20} color="#fff" />,
      route: AppRoutes.Home,
    },
    {
      label: 'Settings',
      icon: <Cog6ToothIcon size={20} color="#fff" />,
      route: AppRoutes.SecurityDashboard,
    },
    {
      label: 'Transactions',
      icon: <ArrowPathIcon size={20} color="#fff" />,
      route: AppRoutes.ListTransaction,
    },
    {
      label: 'Logout',
      icon: <ArrowRightOnRectangleIcon size={20} color="#fff" />,
      action: async () => {
        await AsyncStorage.removeItem('accessToken');
        navigation.navigate(AppRoutes.ImportWallet);
      },
    },
  ];

  return (
    <>
      {/* ── Top Bar ───────────────────────────── */}
      <View style={styles.container}>
        <View style={styles.leftSection}>
          <TouchableOpacity onPress={openMenu}>
            <Bars3BottomLeftIcon size={26} color={Colors.textColor} />
          </TouchableOpacity>

          <View style={styles.tagWrapper}>
            <Pressable onPress={handleTagPress}>
              <View>
                <Text style={styles.tagText}>
                  {showTag
                    ? authUser?.account_id?.tagname || authUser?.phone || '@anonymous'
                    : '•••••••••••'}
                </Text>
                {copied && <Text style={styles.copiedTooltip}>Copied</Text>}
              </View>
            </Pressable>

            <TouchableOpacity onPress={() => setShowTag(!showTag)}>
              {showTag ? (
                <EyeSlashIcon size={16} color={Colors.accent} />
              ) : (
                <EyeIcon size={16} color={Colors.accent} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.rightIcons}>
          <TouchableOpacity style={{ marginRight: 16 }}>
            <BellIcon size={24} color={Colors.textColor} onPress={() => {
              navigation.navigate(AppRoutes.ListTransaction)
            }} />
          </TouchableOpacity>
          <TouchableOpacity>
            <QrCodeIcon size={24} color={Colors.textColor} />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Sidebar ───────────────────────────── */}
      {menuVisible && (
        <>
          <Pressable style={styles.backdrop} onPress={closeMenu} />
          <Animated.View
            style={[styles.sidebar, { transform: [{ translateX: slideAnim }] }]}
          >
            <View style={styles.navbar}>
              <TouchableOpacity onPress={closeMenu} hitSlop={8}>
                <ArrowLeftIcon size={20} color={Colors.textColor} />
              </TouchableOpacity>
              <Text style={styles.navTitle}>My Profile</Text>
              <View style={{ width: 24 }} />
            </View>

            <View style={styles.menuContent}>
              <View style={styles.menuList}>
                {menuItems.map((item, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.menuItem}
                    onPress={() => {
                      if (item.route) {
                        navigation.navigate(item.route as never);
                      } else if (item.action) {
                        item.action();
                      }
                      closeMenu();
                    }}
                  >
                    <View style={styles.menuItemRow}>
                      {item.icon}
                      <Text style={styles.menuItemText}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.versionText}>Version 1.0.0</Text>
            </View>
          </Animated.View>
        </>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.backgroundColor,
    zIndex: 10,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    gap: 6,
  },
  tagText: {
    color: Colors.accent,
    fontSize: 12,
    fontWeight: '500',
  },
  copiedTooltip: {
    position: 'absolute',
    top: -16,
    left: 0,
    backgroundColor: '#333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    fontSize: 10,
    color: '#fff',
  },
  rightIcons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backdrop: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: '20%',
    height: SCREEN_HEIGHT,
    backgroundColor: 'rgba(0,0,0,0.3)',
    zIndex: 99,
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    backgroundColor: '#020618',
    zIndex: 100,
    paddingTop: 10,
    paddingHorizontal: 24,
    elevation: 10,
    justifyContent: 'space-between',
  },
  navbar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  navTitle: {
    fontSize: 16,
    color: Colors.textColor,
    fontWeight: '600',
  },
  menuContent: {
    flex: 1,
    justifyContent: 'space-between',
  },
  menuList: {
    gap: 24,
  },
  menuItem: {
    paddingVertical: 4,
  },
  menuItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    color: '#ccc',
    fontSize: 12,
    marginBottom: 50,
  },
});
