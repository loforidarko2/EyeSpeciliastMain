import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

export default function TermsofService() {
  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Terms of Service</Text>

      <Text style={styles.text}>By using Eye Specialist, you agree to the following terms:</Text>

      <Text style={styles.sectionTitle}>1. Usage</Text>
      <Text style={styles.text}>
        This app provides eye health suggestions based on uploaded images. It does not replace
        medical diagnosis. Always consult a licensed professional.
      </Text>

      <Text style={styles.sectionTitle}>2. User Responsibility</Text>
      <Text style={styles.text}>
        You are responsible for keeping your login credentials safe. Do not upload images you do not
        have the rights to.
      </Text>

      <Text style={styles.sectionTitle}>3. Liability</Text>
      <Text style={styles.text}>
        We are not liable for medical decisions made based on app predictions. Use at your own discretion.
      </Text>

      <Text style={styles.sectionTitle}>4. Changes</Text>
      <Text style={styles.text}>
        We reserve the right to update these terms. Continued use of the app constitutes agreement
        to the latest terms.
      </Text>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 16, color: '#1a73e8' },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', marginTop: 20, marginBottom: 8, color: '#222' },
  text: { fontSize: 14, color: '#555', lineHeight: 20 },
});
