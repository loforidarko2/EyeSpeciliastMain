import React from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function HelpCenter() {
  return (
    <SafeAreaView style={styles.container}>
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Help Center</Text>

      <View style={styles.item}>
        <Feather name="help-circle" size={18} color="#1a73e8" />
        <Text style={styles.question}>How do I scan my eyes?</Text>
        <Text style={styles.answer}>
          Go to the Home screen and tap "Take Photo" or "Upload Photo" to analyze your eyes.
        </Text>
      </View>

      <View style={styles.item}>
        <Feather name="lock" size={18} color="#1a73e8" />
        <Text style={styles.question}>Is my data secure?</Text>
        <Text style={styles.answer}>
          Yes, we use secure authentication and encrypted Firestore storage to keep your data safe.
        </Text>
      </View>

      <View style={styles.item}>
        <Feather name="user" size={18} color="#1a73e8" />
        <Text style={styles.question}>How do I change my profile info?</Text>
        <Text style={styles.answer}>
          Navigate to Profile → Personal Info → Edit Profile to update your name and photo.
        </Text>
      </View>

      <Text style={styles.note}>Still need help? Contact us</Text>
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 20, color: '#1a73e8' },
  item: { marginBottom: 20 },
  question: { fontSize: 16, fontWeight: 'bold', marginTop: 10, color: '#111' },
  answer: { fontSize: 14, color: '#555', marginTop: 4 },
  note: { fontSize: 13, color: '#777', marginTop: 30, textAlign: 'center' },
});
