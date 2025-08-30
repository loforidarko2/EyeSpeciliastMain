import React from 'react';
import { View, Text, ScrollView, StyleSheet, SafeAreaView } from 'react-native';

export default function PrivacyPolicy() {
  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Privacy Policy</Text>
      <Text style={styles.text}>
        EyeCare AI respects your privacy. We collect limited data necessary to provide our service,
        including your email, scan history, and basic usage metrics.
      </Text>

      <Text style={styles.sectionTitle}>What We Collect</Text>
      <Text style={styles.text}>
        - Your name and email (used for authentication){'\n'}
        - Images you scan (not stored unless authorized){'\n'}
        - Prediction results (stored in your history){'\n'}
      </Text>

      <Text style={styles.sectionTitle}>How It's Used</Text>
      <Text style={styles.text}>
        Your data helps us personalize your experience and improve our model. We do not sell your
        data or share it with third parties.
      </Text>

      <Text style={styles.sectionTitle}>Your Rights</Text>
      <Text style={styles.text}>
        You can delete your account or request data removal by contacting us at:
        privacy@eyecareai.com.
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
