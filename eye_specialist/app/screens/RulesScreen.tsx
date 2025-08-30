import React from 'react';
import {View,Text,StyleSheet,TouchableOpacity,ScrollView,SafeAreaView,Alert,} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Feather, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { RootStackParamList } from '../../constants/types';

type Props = NativeStackScreenProps<RootStackParamList, 'Rules'>;

const RulesScreen: React.FC<Props> = ({ navigation, route }) => {
  const { destination } = route.params || { destination: 'upload' };

  const handleContinue = async () => {
    if (destination === 'camera') {
      // Directly open camera
      try {
        const { granted } = await ImagePicker.requestCameraPermissionsAsync();
        if (!granted) {
          Alert.alert('Permission Required', 'Camera access is needed to take photos for eye analysis.');
          return;
        }
        const result = await ImagePicker.launchCameraAsync({ 
          allowsEditing: true, 
          aspect: [1, 1], 
          quality: 1
        });
        if (!result.canceled && result.assets?.length > 0) {
          navigation.navigate('Upload', { capturedImage: result.assets[0].uri });
        } else {
          navigation.navigate('Main', { screen: 'Home' });
        }
      } catch (error) {
        console.error('Camera error:', error);
        Alert.alert('Error', 'Failed to open camera. Please try again.');
        navigation.navigate('Main', { screen: 'Home' });
      }
    } else {
      // Directly open gallery
      try {
        const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!granted) {
          Alert.alert('Permission Required', 'Gallery access is needed to select photos for eye analysis.');
          return;
        }
        const result = await ImagePicker.launchImageLibraryAsync({ 
          allowsEditing: true, 
          aspect: [1, 1], 
          quality: 1
        });
        if (!result.canceled && result.assets?.length > 0) {
          // Navigate to result or processing screen with the image
          navigation.navigate('Upload', { capturedImage: result.assets[0].uri });
        } else {
          // Go back to home if user cancelled
          navigation.navigate('Main', { screen: 'Home' });
        }
      } catch (error) {
        console.error('Gallery error:', error);
        Alert.alert('Error', 'Failed to open gallery. Please try again.');
        navigation.navigate('Main', { screen: 'Home' });
      }
    }
  };

  const rules = [
    {
      icon: 'eye',
      title: 'Clear Eye Visibility',
      description: 'Ensure the entire eye is clearly visible in the frame without any obstructions.',
    },
    {
      icon: 'sun',
      title: 'Good Lighting',
      description: 'Take photos in well-lit conditions. Natural light works best, avoid harsh shadows.',
    },
    {
      icon: 'camera',
      title: 'Steady Shot',
      description: 'Hold the camera steady and avoid blurry images. Use both hands for stability.',
    },
    {
      icon: 'crop',
      title: 'Proper Framing',
      description: 'Center the eye in the frame. The eye should fill most of the image area.',
    },
    {
      icon: 'x-circle',
      title: 'Avoid Reflections',
      description: 'Minimize glare and reflections from glasses, screens, or bright lights.',
    },
    {
      icon: 'zoom-in',
      title: 'Close-up Focus',
      description: 'Get close enough to capture clear details of the eye structure.',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
       {/*} <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#1a73e8" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Photo Guidelines</Text>
          <View style={styles.placeholder} />
        </View> /*}

        {/* Main Content */}
        <View style={styles.content}>
          <View style={styles.introSection}>
            <MaterialIcons name="photo-camera" size={48} color="#1a73e8" />
            <Text style={styles.introTitle}>
              Get the Best Results
            </Text>
            <Text style={styles.introDescription}>
              Follow these guidelines to ensure accurate eye analysis and reliable results.
            </Text>
          </View>

          {/* Rules List */}
          <View style={styles.rulesContainer}>
            {rules.map((rule, index) => (
              <View key={index} style={styles.ruleItem}>
                <View style={styles.ruleIcon}>
                  <Feather name={rule.icon as any} size={24} color="#1a73e8" />
                </View>
                <View style={styles.ruleContent}>
                  <Text style={styles.ruleTitle}>{rule.title}</Text>
                  <Text style={styles.ruleDescription}>{rule.description}</Text>
                </View>
              </View>
            ))}
          </View>

          {/* Important Note */}
          <View style={styles.noteContainer}>
            <Feather name="info" size={20} color="#f59e0b" />
            <Text style={styles.noteText}>
              Following these guidelines helps ensure more accurate analysis results.
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Continue Button */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
          <Text style={styles.continueButtonText}>
            Continue to {destination === 'camera' ? 'Camera' : 'Upload'}
          </Text>
          <Feather name="arrow-right" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f5f9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  introSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  introTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1e293b',
    marginTop: 16,
    marginBottom: 8,
  },
  introDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
  },
  rulesContainer: {
    marginBottom: 24,
  },
  ruleItem: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  ruleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  ruleDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  noteText: {
    flex: 1,
    fontSize: 14,
    color: '#92400e',
    marginLeft: 12,
    lineHeight: 20,
  },
  bottomContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  continueButton: {
    backgroundColor: '#1a73e8',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
});

export default RulesScreen;
