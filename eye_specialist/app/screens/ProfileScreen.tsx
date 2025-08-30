import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import { auth, db } from '../../configs/firebaseConfig';
import { signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { Feather, Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type RootStackParamList = {
  Login: undefined;
  PersonalInfo: undefined;
  ChangePass: undefined;
  Notification: undefined;
  HelpCenter: undefined;
  PrivacyPolicy: undefined;
  TermsofService: undefined;
};

type ProfileScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

interface ProfileScreenProps {
  navigation: ProfileScreenNavigationProp;
}

interface UserData {
  name?: string;
  photoURL?: string;
}

interface UserStats {
  totalScans: number;
  daysActive: number;
  healthScore: number;
}

interface ImageAsset {
  uri: string;
}

const ProfileScreen: React.FC<ProfileScreenProps> = ({ navigation }) => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [uploading, setUploading] = useState<boolean>(false);
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [userStats, setUserStats] = useState<UserStats>({
    totalScans: 0,
    daysActive: 0,
    healthScore: 100,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return navigation.navigate('Login');

        const docSnap = await getDoc(doc(db, 'users', user.uid));
        if (docSnap.exists()) setUserData(docSnap.data() as UserData);

        // Fetch history stats
        const q = query(
          collection(db, 'history'),
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );

        const historySnap = await getDocs(q);
        const scans = historySnap.docs.map(doc => doc.data());
        const total = scans.length;
        const firstScan = (scans.at(-1)?.createdAt?.toDate?.() as Date) || new Date();
        const days = Math.floor((Date.now() - firstScan.getTime()) / (1000 * 60 * 60 * 24));
        const health = Math.round(
          (scans.filter(s => s.prediction === 'normal').length / (total || 1)) * 100
        );

        setUserStats({ totalScans: total, daysActive: days, healthScore: health });
      } catch (err: any) {
        Alert.alert('Error', err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [navigation]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission required', 'Photo access needed');

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });
    if (!result.canceled && result.assets) {
      uploadImage(result.assets[0]);
    }
  };

  const uploadImage = async (imageAsset: ImageAsset) => {
    try {
      setUploading(true);
      const base64 = await FileSystem.readAsStringAsync(imageAsset.uri, { encoding: 'base64' });
      const imageData = `data:image/jpeg;base64,${base64}`;
      if (!auth.currentUser?.uid) return;

      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: imageData });
      setUserData(prev => (prev ? { ...prev, photoURL: imageData } : { photoURL: imageData }));
      Alert.alert('Success', 'Profile picture updated');
    } catch (e: any) {
      Alert.alert('Error uploading image', e.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (e: any) {
      Alert.alert('Logout Failed', e.message);
    }
  };

  const renderRow = (icon: React.ReactNode, label: string, onPress: () => void) => (
    <TouchableOpacity style={styles.row} onPress={onPress}>
      <View style={styles.rowLeft}>
        {icon}
        <Text style={styles.rowText}>{label}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#ccc" />
    </TouchableOpacity>
  );

  if (loading) return <View style={styles.center}><ActivityIndicator size="large" /></View>;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <TouchableOpacity onPress={pickImage}>
          {uploading ? (
            <ActivityIndicator size="large" />
          ) : userData?.photoURL ? (
            <Image source={{ uri: userData.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={50} color="#fff" />
            </View>
          )}
        </TouchableOpacity>
        <Text style={styles.name}>{userData?.name || 'User'}</Text>
        <Text style={styles.email}>{auth.currentUser?.email}</Text>
      </View>

      <View style={styles.statsBox}>
        <Stat title="Total Scans" value={userStats.totalScans} />
        <Stat title="Days Active" value={userStats.daysActive} />
        <Stat title="Health Score" value={`${userStats.healthScore}%`} />
      </View>

      <Text style={styles.sectionTitle}>Account Settings</Text>
      {renderRow(<Feather name="user" size={20} color="#555" />, 'Personal Info', () => navigation.navigate('PersonalInfo'))}
      {renderRow(<Feather name="lock" size={20} color="#555" />, 'Change Password', () => navigation.navigate('ChangePass'))}
      {renderRow(<Feather name="bell" size={20} color="#555" />, 'Notifications', () => navigation.navigate('Notification'))}

      <Text style={styles.sectionTitle}>App Preferences</Text>
      <View style={styles.row}>
        <View style={styles.rowLeft}>
          <Feather name={darkMode ? 'moon' : 'sun'} size={20} color="#555" />
          <Text style={styles.rowText}>Dark Mode</Text>
        </View>
        <Switch value={darkMode} onValueChange={setDarkMode} />
      </View>

      <Text style={styles.sectionTitle}>Support & Legal</Text>
      {renderRow(<Feather name="help-circle" size={20} color="#555" />, 'Help & Support', () => navigation.navigate('HelpCenter'))}
      {renderRow(<Feather name="shield" size={20} color="#555" />, 'Privacy Policy', () => navigation.navigate('PrivacyPolicy'))}
      {renderRow(<Feather name="file-text" size={20} color="#555" />, 'Terms of Service', () => navigation.navigate('TermsofService'))}

      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Feather name="log-out" size={20} color="#fff" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>

      <Text style={styles.version}>Eye Specialist v1.0.0</Text>
    </ScrollView>
  );
};

const Stat: React.FC<{ title: string; value: string | number }> = ({ title, value }) => (
  <View style={styles.stat}>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{title}</Text>
  </View>
);

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f8f9fa' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { alignItems: 'center', marginBottom: 20 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#1a73e8', alignItems: 'center', justifyContent: 'center' },
  name: { fontSize: 20, fontWeight: '600', marginTop: 10 },
  email: { fontSize: 14, color: '#555' },
  statsBox: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 20 },
  stat: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#1a73e8' },
  statLabel: { fontSize: 12, color: '#777' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginVertical: 10, color: '#1a1a1a' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, borderBottomColor: '#eee', borderBottomWidth: 1 },
  rowLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  rowText: { fontSize: 14, color: '#333' },
  signOutButton: { backgroundColor: '#e53935', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 8, marginTop: 30 },
  signOutText: { color: '#fff', marginLeft: 10, fontWeight: 'bold' },
  version: { textAlign: 'center', color: '#aaa', fontSize: 12, marginTop: 20 },
});
