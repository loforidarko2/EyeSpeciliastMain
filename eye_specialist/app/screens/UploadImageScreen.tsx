import React, { useState, useEffect } from 'react';
import {View,Image,Text,StyleSheet,TouchableOpacity,ActivityIndicator,Alert,Linking,} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../configs/firebaseConfig';
import firebase from 'firebase/compat/app';
import { Feather } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../constants/types';
import { useTheme } from '../../constants/ThemeContext';
import { useThemeColors } from '../../constants/Colors';

const API_URL = __DEV__
  ? 'http://172.20.10.3:8000/predict'
  : 'https://172.20.10.3:8000/predict';

type Props = NativeStackScreenProps<RootStackParamList, 'Upload'>;

const UploadImageScreen: React.FC<Props> = ({ navigation, route }) => {
  const [imageUri, setImageUri] = useState<string | null>(route.params?.capturedImage || null);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const { colors } = useTheme();
  //const colors = useThemeColors();


  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => setIsOnline(!!state.isConnected));
    return () => unsubscribe();
  }, []);

  const requestPermission = async (type: 'camera' | 'gallery') => {
    const permission =
      type === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        `Please enable ${type} access in your device settings.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Open Settings', onPress: () => Linking.openSettings() },
        ]
      );
      return false;
    }
    return true;
  };

  const handleNavigateToRules = (destination: 'camera' | 'upload') => {
    navigation.navigate('Rules', { destination });
  };

  const handleImagePick = async (fromCamera = false) => {
    const granted = await requestPermission(fromCamera ? 'camera' : 'gallery');
    if (!granted) return;

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 1 });

    if (!result.canceled && result.assets?.length > 0) {
      setImageUri(result.assets[0].uri);
    } else {
      Alert.alert('No image selected.');
    }
  };

  const handlePrediction = async () => {
    if (!imageUri) return Alert.alert('Select an image first.');
    if (!isOnline) return Alert.alert('Offline', 'You must be connected to the internet.');

    setLoading(true);
    const formData = new FormData();
    formData.append('file', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'upload.jpg',
    } as any);

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'multipart/form-data' },
        body: formData,
      });

      const text = await res.text();
      const json = JSON.parse(text);
      if (!json.prediction || json.confidence === undefined) {
        throw new Error('Invalid response from server.');
      }

      await saveHistory(json);
      navigation.navigate('Result', {
        result: { result: json.prediction, confidence: json.confidence },
      });
    } catch (err: any) {
      Alert.alert('Prediction Failed', err.message);
    } finally {
      setLoading(false);
    }
  };

  const saveHistory = async (data: { prediction: string; confidence: number }) => {
    const user = auth.currentUser;
    const entry = {
      userId: user?.uid || 'guest',
      imageUri,
      prediction: data.prediction,
      confidence: data.confidence,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      type: 'image_analysis',
    };

    if (!user) return await cacheOffline(entry);

    try {
      await db.collection('history').add(entry);
    } catch {
      await cacheOffline(entry);
    }
  };

  const cacheOffline = async (entry: any) => {
    try {
      const existing = await AsyncStorage.getItem('pendingHistory');
      const entries = existing ? JSON.parse(existing) : [];
      entries.push(entry);
      await AsyncStorage.setItem('pendingHistory', JSON.stringify(entries));
    } catch (err) {
      console.warn('Local cache failed:', err);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <TouchableOpacity
        style={[styles.imageContainer, { backgroundColor: colors.surface, borderColor: colors.border }]}
        onPress={() => handleNavigateToRules('upload')}
        disabled={loading}
      >
        {imageUri ? (
          <Image source={{ uri: imageUri }} style={styles.image} />
        ) : (
          <Feather name="image" size={40} color={colors.iconMuted} />
        )}
        <Text style={[styles.placeholderText, { color: colors.textMuted }]}>
          {imageUri ? 'Tap to change image' : 'Tap to select image'}
        </Text>
      </TouchableOpacity>

      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.primary }]}
          onPress={() => navigation.navigate('Rules', { destination: 'camera' })}
          disabled={loading}
        >
          <Feather name="camera" size={24}  color={colors.surface} />
          <Text style={[styles.actionText, { color: colors.surface }]}>Take Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: colors.success }]}
          onPress={handlePrediction}
          disabled={!imageUri || loading}
        >
          {loading ? (
            <ActivityIndicator color={colors.surface} />
          ) : (
            <>
              <Feather name="search" size={24} color={colors.surface} />
              <Text style={[styles.actionText, { color: colors.surface }]}>Analyze</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {!isOnline && (
        <Text style={[styles.offlineText, { color: colors.error }]}>
          You're offline. Internet is required for predictions.</Text>
      )}

      <TouchableOpacity onPress={() => navigation.navigate('Symptoms' as never)}>
        <Text style={[styles.symptomText, { color: colors.primary }]}>
          Check Symptoms Instead</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 240,
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 2,
    marginBottom: 24,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
  },
  placeholderText: {
    fontSize: 14,
    marginTop: 8,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 14,
    borderRadius: 14,
    elevation: 2,
  },
  actionText: {
    fontWeight: 'bold',
    marginLeft: 8,
  },
  symptomText: {
    marginTop: 20,
    textAlign: 'center',
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  offlineText: {
    textAlign: 'center',
    marginBottom: 10,
  },
});

export default UploadImageScreen;
