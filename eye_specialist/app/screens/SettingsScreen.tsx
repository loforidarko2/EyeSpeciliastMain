import React, { useState, useEffect, useContext } from 'react';
import {View,Text,StyleSheet,TouchableOpacity,ActivityIndicator,Alert,Switch,ScrollView,SafeAreaView,} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../../configs/firebaseConfig';
import { ThemeContext } from '../../constants/ThemeContext';
import { useTheme } from '../../constants/ThemeContext';

type RootStackParamList = {
  Login: undefined;
  Profile: undefined;
  Preferences: undefined;
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
  TermsofService: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface UserData {
  name?: string;
  photoURL?: string;
  [key: string]: any;
}

export default function SettingsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  const { mode, setMode } = useContext(ThemeContext);
  const { isDark, toggleTheme, colors } = useTheme();

  const handleThemeToggle = () => {
    if (mode === 'auto') setMode('light');
    else if (mode === 'light') setMode('dark');
    else setMode('auto');
  };

  const getThemeLabel = () => {
    if (mode === 'auto') return 'Auto (System)';
    return mode.charAt(0).toUpperCase() + mode.slice(1);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          navigation.navigate('Login');
          return;
        }

        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          Alert.alert('Error', 'User data not found');
        }
      } catch (error: any) {
        Alert.alert('Error', error.message || 'Unknown error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert('Confirm Logout', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          try {
            await signOut(auth);
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          } catch (error: any) {
            Alert.alert('Logout Error', error.message || 'Unknown error');
          }
        },
      },
    ]);
  };

  const renderItem = (
    icon: React.ReactNode,
    label: string,
    onPress: () => void,
    isSwitch = false,
    switchValue = false,
    onSwitchChange: () => void = () => {}
  ) => (
    <TouchableOpacity
      style={[styles.item, { borderBottomColor: colors.border }]}
      onPress={!isSwitch ? onPress : undefined}
      activeOpacity={isSwitch ? 1 : 0.6}
    >
      <View style={styles.itemLeft}>
        {icon}
        <Text style={[styles.itemLabel, { color: colors.text }]}>{label}</Text>
      </View>
      {isSwitch ? (
        <Switch value={switchValue} onValueChange={onSwitchChange} />
      ) : (
        <Ionicons name="chevron-forward" size={18} color={colors.icon} />
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.center, { backgroundColor: colors.background }]}>
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Account */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Account</Text>
          {renderItem(
            <Feather name="user" size={18} color={colors.icon} />,
            'View Profile',
            () => navigation.navigate('Profile')
          )}
        </View>

        {/* App Settings */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>App Settings</Text>
          {renderItem(
            <Feather name="sun" size={18} color={colors.icon} />,
            `Theme: ${getThemeLabel()}`,
            handleThemeToggle
            
          )}
          {renderItem(
            <Feather name="settings" size={18} color={colors.icon} />,
            'Preferences',
            () => navigation.navigate('Preferences')
          )}
        </View>

        {/* Support */}
        <View style={[styles.section, { backgroundColor: colors.card }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Support</Text>
          {renderItem(
            <Feather name="help-circle" size={18} color={colors.icon} />,
            'Help Center',
            () => navigation.navigate('HelpCenter')
          )}
          {renderItem(
            <Feather name="shield" size={18} color={colors.icon} />,
            'Privacy Policy',
            () => navigation.navigate('PrivacyPolicy')
          )}
          {renderItem(
            <Feather name="file-text" size={18} color={colors.icon} />,
            'Terms of Service',
            () => navigation.navigate('TermsofService')
          )}
        </View>

        {/* Logout */}
        <TouchableOpacity style={[styles.logoutButton, { backgroundColor: colors.danger }]} onPress={handleLogout}>
          <Feather name="log-out" size={18} color="#fff" />
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={[styles.version, { color: colors.subtle }]}>Eye Specialist v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    marginTop: 50,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    borderRadius: 10,
    marginBottom: 20,
    paddingVertical: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 16,
    paddingBottom: 6,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  itemLabel: {
    fontSize: 15,
  },
  logoutButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  logoutText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 8,
    fontSize: 16,
  },
  version: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 12,
  },
});
