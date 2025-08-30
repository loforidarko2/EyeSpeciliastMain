import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { RootStackParamList } from '../../constants/types';
import { auth } from '../../configs/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';

type LoginScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isResetting, setIsResetting] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const userCredential = await auth.signInWithEmailAndPassword(email, password);
      console.log('Login success:', userCredential.user);
      navigation.replace('Main');
    } catch (error: any) {
      let message = 'Something went wrong. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No user found with this email.';
      } else if (error.code === 'auth/wrong-password') {
        message = 'Incorrect password.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Invalid email format.';
      }

      Alert.alert('Login Failed', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!resetEmail.trim()) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }

    if (!/\S+@\S+\.\S+/.test(resetEmail)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setIsResetting(true);
    try {
      await auth.sendPasswordResetEmail(resetEmail);
      Alert.alert(
        'Password Reset Email Sent',
        `A password reset link has been sent to ${resetEmail}. Please check your email or junk mail and follow the instructions to reset your password.`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowForgotModal(false);
              setResetEmail('');
            }
          }
        ]
      );
    } catch (error: any) {
      let message = 'Something went wrong. Please try again.';
      if (error.code === 'auth/user-not-found') {
        message = 'No account found with this email address.';
      } else if (error.code === 'auth/invalid-email') {
        message = 'Please enter a valid email address.';
      } else if (error.code === 'auth/too-many-requests') {
        message = 'Too many requests. Please try again later.';
      }
      Alert.alert('Reset Failed', message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eye Specialist</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.passwordInput}
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!passwordVisible}
        />
        <TouchableOpacity onPress={() => setPasswordVisible(!passwordVisible)}>
          <Text style={styles.toggleText}>{passwordVisible ? 'Hide' : 'Show'}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={isLoading}>
        <Text style={styles.buttonText}>{isLoading ? 'Logging in...' : 'Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.forgotPasswordButton}
        onPress={() => {
          setResetEmail(email); // Pre-fill with current email
          setShowForgotModal(true);
        }}
      >
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.linkText}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>

      {/* Forgot Password Modal */}
      <Modal
        visible={showForgotModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowForgotModal(false)}
      >
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {/* Header */}
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Reset Password</Text>
                <TouchableOpacity 
                  onPress={() => setShowForgotModal(false)}
                  style={styles.closeButton}
                >
                  <Ionicons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {/* Description */}
              <Text style={styles.modalDescription}>
                Enter your email address and we'll send you a link to reset your password.
              </Text>

              {/* Email Input */}
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your email"
                value={resetEmail}
                onChangeText={setResetEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoFocus
              />

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity 
                  style={styles.cancelButton}
                  onPress={() => setShowForgotModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[styles.resetButton, isResetting && styles.disabledButton]}
                  onPress={handleForgotPassword}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <Text style={styles.resetButtonText}>Send Reset Link</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a73e8', textAlign: 'center', marginBottom: 40 },
  input: {
    height: 50, borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    paddingHorizontal: 15, marginBottom: 15, fontSize: 16,
  },
  passwordContainer: {
    flexDirection: 'row', alignItems: 'center', borderWidth: 1,
    borderColor: '#ddd', borderRadius: 8, paddingHorizontal: 10, marginBottom: 15,
  },
  passwordInput: { flex: 1, height: 50, fontSize: 16 },
  toggleText: { color: '#1a73e8', fontWeight: '500', marginLeft: 10 },
  button: {
    backgroundColor: '#1a73e8', padding: 15, borderRadius: 8,
    alignItems: 'center', marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  forgotPasswordButton: {
    alignItems: 'center',
    marginTop: 15,
    paddingVertical: 10,
  },
  forgotPasswordText: {
    color: '#1a73e8',
    fontSize: 14,
    fontWeight: '500',
  },
  linkText: { color: '#1a73e8', textAlign: 'center', marginTop: 20, fontSize: 14 },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 24,
    paddingBottom: 40,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1e293b',
  },
  closeButton: {
    padding: 4,
  },
  modalDescription: {
    fontSize: 16,
    color: '#64748b',
    lineHeight: 24,
    marginBottom: 24,
  },
  modalInput: {
    height: 50,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    marginBottom: 24,
    backgroundColor: '#f8fafc',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#1a73e8',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.6,
  },
});
