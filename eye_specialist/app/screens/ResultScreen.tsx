import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../constants/types'; // make sure this type exists and includes Result, Education, and Main

type Props = NativeStackScreenProps<RootStackParamList, 'Result'>;

export default function ResultScreen({ route, navigation }: Props) {
  const { result } = route.params;

  const isEye = result.result !== 'Not an eye';
  const confidencePercent = (result.confidence * 100).toFixed(2); // fixed multiplier

  const getDetails = () => {
    switch (result.result) {
      case 'Cataract':
        return {
          icon: 'eye',
          color: '#8e44ad',
          message:
            'Cataracts may cause blurry vision or glare. Early diagnosis and surgery can restore vision.',
          action: 'We recommend scheduling an appointment with an eye specialist.',
          extra:
            'Visit the Education tab to learn more about cataract symptoms, causes, and treatment options.',
        };
      case 'Glaucoma':
        return {
          icon: 'eye-off',
          color: '#f39c12',
          message:
            'Glaucoma can lead to irreversible vision loss and often shows no early signs.',
          action: 'Immediate consultation with an ophthalmologist is strongly advised.',
          extra:
            'Head over to the Education tab for more information on glaucoma and how it’s managed.',
        };
      case 'Normal':
        return {
          icon: 'checkmark-circle',
          color: '#27ae60',
          message: 'Your scan does not show signs of Cataract or Glaucoma.',
          action:
            'Keep up with regular eye checkups to stay informed about your eye health.',
          extra:
            'For tips on maintaining healthy vision, visit the Education tab.',
        };
      default:
        return {
          icon: 'close-circle',
          color: '#e74c3c',
          message: 'This image does not appear to contain an eye.',
          action: 'Try uploading a clearer photo showing a well-lit eye.',
          extra:
            'Need help? Learn how to capture a good eye image in the Settings tab.',
        };
    }
  };

  const { icon, color, message, action, extra } = getDetails();

  return (
    <SafeAreaView >
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Ionicons name={icon as any} size={80} color={color} style={styles.icon} />
        <Text style={[styles.resultLabel, { color }]}>
          {isEye ? result.result : 'Not an Eye'}
        </Text>

        {isEye && (
          <Text style={styles.confidenceText}>
            Confidence: {confidencePercent}%
          </Text>
        )}

        <Text style={styles.messageText}>{message}</Text>
        <Text style={styles.actionText}>{action}</Text>
        <Text style={styles.extraText}>{extra}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Education')}
        >
          <Ionicons name="book-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Learn More About This</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: '#3498db' }]}
          onPress={() => navigation.navigate('Main')}
        >
          <Ionicons name="home-outline" size={20} color="#fff" />
          <Text style={styles.buttonText}>Return to Home</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 50,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#f2f6fa',
    flexGrow: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 25,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 6,
  },
  icon: {
    marginBottom: 15,
  },
  resultLabel: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
    textTransform: 'capitalize',
  },
  confidenceText: {
    fontSize: 18,
    color: '#444',
    marginBottom: 15,
  },
  messageText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 10,
  },
  actionText: {
    fontSize: 15,
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#888',
    marginBottom: 10,
  },
  extraText: {
    fontSize: 15,
    textAlign: 'center',
    color: '#555',
    marginBottom: 25,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2ecc71',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    marginLeft: 10,
    fontSize: 16,
    fontWeight: '500',
  },
});
