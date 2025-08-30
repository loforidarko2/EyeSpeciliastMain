import React from 'react';
import {View,Text,StyleSheet,TouchableOpacity,Image,ImageSourcePropType,} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../constants/types'; // Adjust path as needed
import { useNavigation } from '@react-navigation/native';

// Define props type using navigation stack
type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Landing'>;

export default function LandingScreen() {
  const navigation = useNavigation<NavigationProp>();

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/eye1.png') as ImageSourcePropType}
        style={styles.image}
        resizeMode="contain"
      />
      <Text style={styles.title}>Welcome to Eye Specialist</Text>
      <Text style={styles.subtitle}>Scan. Detect. Protect your vision.</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>

      <View style={styles.links}>
        <TouchableOpacity onPress={() => navigation.navigate('PrivacyPolicy')}>
          <Text style={styles.linkText}>Privacy Policy</Text>
        </TouchableOpacity>
        <Text style={styles.divider}>·</Text>
        <TouchableOpacity onPress={() => navigation.navigate('TermsofService')}>
          <Text style={styles.linkText}>Terms of Service</Text>
        </TouchableOpacity>
        <Text style={styles.divider}>·</Text>
        <TouchableOpacity onPress={() => navigation.navigate('HelpCenter')}>
          <Text style={styles.linkText}>Help Center</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  image: {
    width: 250,
    height: 250,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1a73e8',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#1a73e8',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    marginTop: 24,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  links: {
    flexDirection: 'row',
    marginTop: 30,
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 6,
  },
  linkText: {
    color: '#1a73e8',
    fontSize: 13,
  },
  divider: {
    color: '#ccc',
    marginHorizontal: 6,
  },
});
