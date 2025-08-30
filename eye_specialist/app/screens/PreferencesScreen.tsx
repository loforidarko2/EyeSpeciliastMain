import React, { useState, useEffect, useLayoutEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../../configs/firebaseConfig';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { RootStackParamList } from '../../constants/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Preferences'>;

interface UserPreferences {
  notifications: {
    scanReminders: boolean;
    healthTips: boolean;
    resultAlerts: boolean;
    systemUpdates: boolean;
    emailNotifications: boolean;
  };
  privacy: {
    dataCollection: boolean;
    analytics: boolean;
    crashReports: boolean;
  };
  app: {
    autoSave: boolean;
    highQualityImages: boolean;
    offlineMode: boolean;
    biometricAuth: boolean;
  };
}

const defaultPreferences: UserPreferences = {
  notifications: {
    scanReminders: true,
    healthTips: true,
    resultAlerts: true,
    systemUpdates: true,
    emailNotifications: false,
  },
  privacy: {
    dataCollection: true,
    analytics: true,
    crashReports: true,
  },
  app: {
    autoSave: true,
    highQualityImages: true,
    offlineMode: false,
    biometricAuth: false,
  },
};

const PreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={resetToDefaults} style={{ marginRight: 16 }}>
          <Feather name="refresh-cw" size={20} color="#64748b" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'userPreferences', auth.currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const data = userDoc.data() as UserPreferences;
          setPreferences({ ...defaultPreferences, ...data });
        }
      } else {
        const storedPreferences = await AsyncStorage.getItem('userPreferences');
        if (storedPreferences) {
          const parsed = JSON.parse(storedPreferences);
          setPreferences({ ...defaultPreferences, ...parsed });
        }
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const savePreferences = async (newPreferences: UserPreferences) => {
    setSaving(true);
    try {
      if (auth.currentUser) {
        const userDocRef = doc(db, 'userPreferences', auth.currentUser.uid);
        await setDoc(userDocRef, newPreferences, { merge: true });
      } else {
        await AsyncStorage.setItem('userPreferences', JSON.stringify(newPreferences));
      }
    } catch (error) {
      console.error('Error saving preferences:', error);
      Alert.alert('Error', 'Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updatePreference = (category: keyof UserPreferences, key: string, value: boolean) => {
    const newPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [key]: value,
      },
    };
    setPreferences(newPreferences);
    savePreferences(newPreferences);
  };

  const resetToDefaults = () => {
    Alert.alert(
      'Reset Preferences',
      'Are you sure you want to reset all preferences to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => {
            setPreferences(defaultPreferences);
            savePreferences(defaultPreferences);
          },
        },
      ]
    );
  };

  const renderSectionHeader = (title: string, description?: string) => (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {description && (
        <Text style={styles.sectionDescription}>{description}</Text>
      )}
    </View>
  );

  const renderPreferenceItem = (
    icon: React.ReactNode,
    title: string,
    description: string,
    value: boolean,
    onToggle: (value: boolean) => void,
    disabled: boolean = false
  ) => (
    <View style={[styles.preferenceItem, disabled && styles.disabledItem]}>
      <View style={styles.preferenceIcon}>
        {icon}
      </View>
      <View style={styles.preferenceContent}>
        <Text style={[styles.preferenceTitle, disabled && styles.disabledText]}>
          {title}
        </Text>
        <Text style={[styles.preferenceDescription, disabled && styles.disabledText]}>
          {description}
        </Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled || saving}
        trackColor={{ false: '#f1f5f9', true: '#bfdbfe' }}
        thumbColor={value ? '#1a73e8' : '#94a3b8'}
      />
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text>Loading preferences...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Notifications Section */}
        {renderSectionHeader(
          'Notifications',
          'Manage how and when you receive notifications'
        )}
        <View style={styles.section}>
          {renderPreferenceItem(
            <Feather name="camera" size={20} color="#1a73e8" />,
            'Scan Reminders',
            'Get reminded to take regular eye scans',
            preferences.notifications.scanReminders,
            (value) => updatePreference('notifications', 'scanReminders', value)
          )}
          {renderPreferenceItem(
            <Feather name="heart" size={20} color="#34a853" />,
            'Health Tips',
            'Receive daily eye health tips and advice',
            preferences.notifications.healthTips,
            (value) => updatePreference('notifications', 'healthTips', value)
          )}
          {renderPreferenceItem(
            <Feather name="check-circle" size={20} color="#fbbc04" />,
            'Result Alerts',
            'Get notified when scan results are ready',
            preferences.notifications.resultAlerts,
            (value) => updatePreference('notifications', 'resultAlerts', value)
          )}
          {renderPreferenceItem(
            <Feather name="bell" size={20} color="#64748b" />,
            'System Updates',
            'Important app updates and announcements',
            preferences.notifications.systemUpdates,
            (value) => updatePreference('notifications', 'systemUpdates', value)
          )}
          {renderPreferenceItem(
            <Feather name="mail" size={20} color="#ea4335" />,
            'Email Notifications',
            'Receive notifications via email',
            preferences.notifications.emailNotifications,
            (value) => updatePreference('notifications', 'emailNotifications', value)
          )}
        </View>

        {/* Privacy Section */}
        {renderSectionHeader(
          'Privacy & Data',
          'Control how your data is used and shared'
        )}
        <View style={styles.section}>
          {renderPreferenceItem(
            <Feather name="database" size={20} color="#8b5cf6" />,
            'Data Collection',
            'Allow anonymous usage data collection',
            preferences.privacy.dataCollection,
            (value) => updatePreference('privacy', 'dataCollection', value)
          )}
          {renderPreferenceItem(
            <Feather name="bar-chart" size={20} color="#06b6d4" />,
            'Analytics',
            'Help improve the app with usage analytics',
            preferences.privacy.analytics,
            (value) => updatePreference('privacy', 'analytics', value)
          )}
          {renderPreferenceItem(
            <Feather name="alert-triangle" size={20} color="#f59e0b" />,
            'Crash Reports',
            'Automatically send crash reports to help fix bugs',
            preferences.privacy.crashReports,
            (value) => updatePreference('privacy', 'crashReports', value)
          )}
        </View>

        {/* App Settings Section */}
        {renderSectionHeader(
          'App Settings',
          'Customize your app experience'
        )}
        <View style={styles.section}>
          {renderPreferenceItem(
            <Feather name="save" size={20} color="#10b981" />,
            'Auto Save',
            'Automatically save scan results',
            preferences.app.autoSave,
            (value) => updatePreference('app', 'autoSave', value)
          )}
          {renderPreferenceItem(
            <Feather name="image" size={20} color="#f97316" />,
            'High Quality Images',
            'Use higher quality for better analysis (uses more storage)',
            preferences.app.highQualityImages,
            (value) => updatePreference('app', 'highQualityImages', value)
          )}
          {renderPreferenceItem(
            <Feather name="wifi-off" size={20} color="#64748b" />,
            'Offline Mode',
            'Enable basic functionality without internet',
            preferences.app.offlineMode,
            (value) => updatePreference('app', 'offlineMode', value)
          )}
          {renderPreferenceItem(
            <Feather name="lock" size={20} color="#dc2626" />,
            'Biometric Authentication',
            'Use fingerprint or face ID to secure the app',
            preferences.app.biometricAuth,
            (value) => updatePreference('app', 'biometricAuth', value),
            true
          )}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Changes are saved automatically. Some settings may require app restart to take effect.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  preferenceItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  disabledItem: {
    opacity: 0.5,
  },
  preferenceIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  preferenceContent: {
    flex: 1,
    marginRight: 12,
  },
  preferenceTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  preferenceDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 18,
  },
  disabledText: {
    color: '#94a3b8',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default PreferencesScreen;