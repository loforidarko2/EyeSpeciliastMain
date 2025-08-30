// HomeScreen.tsx
import React, { useEffect, useState } from 'react';
import {
  StyleSheet, Text, View, ScrollView,
  TouchableOpacity, ActivityIndicator, Alert, Image, SafeAreaView
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { NativeStackNavigationProp, NativeStackScreenProps } from '@react-navigation/native-stack';
import { auth, db } from '../../configs/firebaseConfig';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, Feather } from '@expo/vector-icons';
import firebase from 'firebase/compat/app';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../../constants/types';
import NotificationService from '../../services/NotificationService';
import { collection, query, where, onSnapshot } from 'firebase/firestore';

interface ScanEntry {
  id: string;
  primaryDetection: string;
  confidence: number;
  createdAt: Date;
  imageUrl: string;
}

interface UserStats {
  totalScans: number;
  lastScanDays: number;
  healthScore: number;
  recentScans: ScanEntry[];
}

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;
type RouteProps = NativeStackScreenProps<RootStackParamList, 'Main'>['route'];

const API_URL = __DEV__
  ? 'http://172.20.10.3.1:8000/predict'
  : 'https://172.20.10.3.1:8000/predict';

const HomeScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProps>();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [userStats, setUserStats] = useState<UserStats>({
    totalScans: 0,
    lastScanDays: 0,
    healthScore: 100,
    recentScans: [],
  });

  useEffect(() => {
    let unsubscribeHistory: (() => void) | null = null;

    const unsubscribeAuth = auth.onAuthStateChanged(user => {
      if (user) {
        db.collection('users').doc(user.uid).get()
          .then(doc => setUserData(doc.data()))
          .catch(console.log);

        unsubscribeHistory = db.collection('history')
          .where('userId', '==', user.uid)
          .orderBy('createdAt', 'desc')
          .onSnapshot(snapshot => {
            const allDocs = snapshot.docs;
            const allScans = allDocs.map(doc => doc.data());

            const total = allScans.length;
            const firstScanDate = allScans.at(-1)?.createdAt?.toDate?.() || new Date();
            const daysSinceFirst = Math.floor((Date.now() - firstScanDate.getTime()) / (1000 * 60 * 60 * 24));
            const healthScore = Math.round(
              (allScans.filter(s => s.prediction === 'normal').length / (total || 1)) * 100
            );

            const recentScans: ScanEntry[] = allDocs.slice(0, 5).map(doc => {
              const d = doc.data();
              return {
                id: doc.id,
                primaryDetection: d.prediction,
                confidence: d.confidence,
                createdAt: d.createdAt?.toDate?.() || new Date(),
                imageUrl: d.imageUrl,
              };
            });

            setUserStats({ totalScans: total, lastScanDays: daysSinceFirst, healthScore, recentScans });
            setLoading(false);
          }, error => {
            console.log('History fetch error:', error);
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const unsubscribeNet = NetInfo.addEventListener(state => setIsOnline(!!state.isConnected));

    // Listen for notifications
    let unsubscribeNotifications: (() => void) | null = null;
    if (auth.currentUser) {
      const notificationsRef = collection(db, 'notifications');
      const notificationsQuery = query(
        notificationsRef,
        where('userId', '==', auth.currentUser.uid)
      );
      
      unsubscribeNotifications = onSnapshot(notificationsQuery, (snapshot) => {
        // Filter unread notifications on client side
        const unreadCount = snapshot.docs.filter(doc => {
          const data = doc.data();
          return !data.isRead;
        }).length;
        setUnreadNotifications(unreadCount);
      });

      // Notification initialization disabled to prevent Firebase permission errors
      // TODO: Re-enable when Firebase permissions are properly configured
      // const initializeNotifications = async () => {
      //   try {
      //     const hasInitialized = await AsyncStorage.getItem(`notifications_initialized_${auth.currentUser?.uid}`);
      //     if (!hasInitialized && auth.currentUser) {
      //       const notificationService = NotificationService.getInstance();
      //       await notificationService.createSampleNotifications(auth.currentUser.uid);
      //       await AsyncStorage.setItem(`notifications_initialized_${auth.currentUser.uid}`, 'true');
      //     }
      //   } catch (error) {
      //     console.error('Error initializing notifications:', error);
      //   }
      // };
      // 
      // initializeNotifications();
    }

    return () => {
      unsubscribeAuth();
      unsubscribeNet();
      if (unsubscribeHistory) unsubscribeHistory();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, []);

  // Camera and gallery are now handled directly in RulesScreen

  const handlePrediction = async (image: ImagePicker.ImagePickerAsset) => {
    if (!image || !isOnline) return Alert.alert('Error', 'No image or no internet connection.');
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: image.uri,
        type: 'image/jpeg',
        name: 'upload.jpg',
      } as any);

      const res = await fetch(API_URL, { method: 'POST', body: formData });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`API responded with ${res.status}: ${errorText}`);
      }

      const json = await res.json();
      const uid = auth.currentUser?.uid;

      const entry = {
        userId: uid,
        imageUrl: image.uri,
        prediction: json.prediction,
        confidence: json.confidence,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        type: 'image_analysis',
      };

      if (uid) {
        await db.collection('history').add(entry);
      } else {
        const pending = JSON.parse(await AsyncStorage.getItem('pendingHistory') || '[]');
        pending.push(entry);
        await AsyncStorage.setItem('pendingHistory', JSON.stringify(pending));
      }

      navigation.navigate('Result', {
        result: {
          result: json.prediction,
          confidence: json.confidence,
        },
      });
    } catch (e: any) {
      console.error('Prediction Failed:', e);
      Alert.alert('Prediction Failed', e.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleTakePhoto = () => {
    navigation.navigate('Rules', { destination: 'camera' });
  };

  const handleUploadPhoto = () => {
    navigation.navigate('Rules', { destination: 'upload' });
  };

  // Camera and gallery functions removed - now handled directly in RulesScreen

  if (loading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" color="#1a73e8" /></View>;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            Hello, {userData?.name || userData?.email?.split('@')[0] || 'User'}!
          </Text>
          <Text style={styles.subGreeting}>How are your eyes today?</Text>
        </View>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.navigate('Notification')}>
          <Ionicons name="notifications-outline" size={22} color="#fff" />
          {unreadNotifications > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.badgeText}>
                {unreadNotifications > 99 ? '99+' : unreadNotifications.toString()}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Stats */}
      <View style={styles.statsContainer}>
        <StatCard title="Total Scans" value={userStats.totalScans} />
        <StatCard title="Days Ago" value={userStats.lastScanDays} />
        <StatCard title="Health Score" value={`${userStats.healthScore}%`} isHighlight />
      </View>

      {/* Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActions}>
        <ActionButton icon={<Feather name="camera" size={24} color="#fff" />} label="Take Photo" subLabel="Camera scan" onPress={handleTakePhoto} color="#1a73e8" />
        <ActionButton icon={<Feather name="upload" size={24} color="#fff" />} label="Upload Photo" subLabel="From gallery" onPress={handleUploadPhoto} color="#34a853" />
      </View>

      {/* Recent Results */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Results</Text>
          <TouchableOpacity onPress={() => navigation.navigate('History')}>
            <Text style={styles.viewAll}>View All</Text>
          </TouchableOpacity>
        </View>

        {userStats.recentScans.length > 0 ? userStats.recentScans.map((scan, i) => (
          <View key={i} style={styles.scanItem}>
            <Image source={{ uri: scan.imageUrl }} style={styles.scanThumb} />
            <View style={styles.scanInfo}>
              <Text style={styles.scanText}>
                {scan.primaryDetection === 'normal' ? 'Normal Eye' : `${scan.primaryDetection} Detected`}
              </Text>
              <Text style={styles.scanDate}>{scan.createdAt.toLocaleDateString()}</Text>
            </View>
            <Text style={[styles.scanConfidence, { color: scan.primaryDetection === 'normal' ? '#34a853' : '#e37400' }]}>
              {Math.round(scan.confidence * 100)}%
            </Text>
          </View>
        )) : (
          <View style={styles.noScan}>
            <Feather name="eye" size={32} color="#999" />
            <Text style={styles.noScanText}>No scans yet. Take your first eye photo!</Text>
          </View>
        )}
      </View>

      {/* Tip */}
      <View style={styles.tipCard}>
        <View style={styles.tipIcon}>
          <Feather name="feather" size={24} color="#1a73e8" />
        </View>
        <View>
          <Text style={styles.tipTitle}>20-20-20 Rule</Text>
          <Text style={styles.tipDescription}>
            Every 20 minutes, look at something 20 feet away for 20 seconds to reduce eye strain.
          </Text>
        </View>
      </View>

      {/* Warning */}
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>
          Important: This app is not a substitute for professional medical advice. Always consult an eye specialist for accurate diagnosis and treatment.
        </Text>
      </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({ title, value, isHighlight }) => (
  <View style={styles.statCard}>
    <Text style={[styles.statValue, isHighlight && { color: '#34a853' }]}>{value}</Text>
    <Text style={styles.statLabel}>{title}</Text>
  </View>
);

const ActionButton = ({ icon, label, subLabel, onPress, color }) => (
  <TouchableOpacity style={[styles.actionButton, { backgroundColor: color }]} onPress={onPress}>
    {icon}
    <Text style={styles.actionLabel}>{label}</Text>
    <Text style={styles.actionSub}>{subLabel}</Text>
  </TouchableOpacity>
);

export default HomeScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9', padding: 16, marginTop: 30 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#1a73e8', borderRadius: 20, padding: 20, marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  greeting: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  subGreeting: { fontSize: 14, color: '#cbe1ff' },
  iconButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#ef4444',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
    textAlign: 'center',
  },
  statsContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold' },
  statLabel: { fontSize: 12, color: '#6b7280' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, color: '#111827' },
  quickActions: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  actionButton: { flex: 1, alignItems: 'center', padding: 16, marginHorizontal: 5, borderRadius: 16, elevation: 3 },
  actionLabel: { fontSize: 14, fontWeight: 'bold', color: '#fff', marginTop: 4 },
  actionSub: { fontSize: 12, color: '#dbeafe' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 24 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  cardTitle: { fontWeight: 'bold', fontSize: 16, color: '#111827' },
  viewAll: { color: '#1a73e8', fontSize: 14 },
  scanItem: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  scanThumb: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  scanInfo: { flex: 1 },
  scanText: { fontWeight: '500', color: '#111827' },
  scanDate: { fontSize: 12, color: '#6b7280' },
  scanConfidence: { fontWeight: 'bold' },
  noScan: { alignItems: 'center', paddingVertical: 20 },
  noScanText: { color: '#9ca3af', fontSize: 14, marginTop: 10, textAlign: 'center' },
  tipCard: { flexDirection: 'row', backgroundColor: '#e0f2fe', borderRadius: 16, padding: 16, marginBottom: 24, alignItems: 'center' },
  tipIcon: { width: 48, height: 48, backgroundColor: '#bae6fd', borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  tipTitle: { fontWeight: 'bold', fontSize: 14, color: '#1e3a8a', marginBottom: 4 },
  tipDescription: { color: '#1e40af', fontSize: 12 },
  warningBox: { padding: 16, backgroundColor: '#fff3cd', borderRadius: 8, borderWidth: 1, borderColor: '#ffeeba', marginBottom: 40 },
  warningText: { fontSize: 12, color: '#856404', lineHeight: 16 },
});
