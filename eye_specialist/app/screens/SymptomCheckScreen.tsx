import React, { useState } from 'react';
import { View, Text, ScrollView, Switch, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useTheme } from '../../constants/ThemeContext';

type SymptomKeys =
  | 'eyePain'
  | 'headaches'
  | 'redEyes'
  | 'doubleVision'
  | 'blurredVision'
  | 'lowVision'
  | 'tunnelVision'
  | 'cloudedVision'
  | 'nightTrouble'
  | 'glareSensitivity'
  | 'brightLightNeed'
  | 'halos'
  | 'prescriptionChanges'
  | 'colorFading'
  | 'doubleVisionOneEye'
  | 'hyphema'
  | 'bulgingEyes'
  | 'nauseaVomiting'
  | 'suddenVisionLoss'
  | 'floaters'
  | 'flashingLights';

type SymptomsState = Record<SymptomKeys, boolean>;

export default function SymptomCheckScreen() {
  const [symptoms, setSymptoms] = useState<SymptomsState>({
    eyePain: false,
    headaches: false,
    redEyes: false,
    doubleVision: false,
    blurredVision: false,
    lowVision: false,
    tunnelVision: false,
    cloudedVision: false,
    nightTrouble: false,
    glareSensitivity: false,
    brightLightNeed: false,
    halos: false,
    prescriptionChanges: false,
    colorFading: false,
    doubleVisionOneEye: false,
    hyphema: false,
    bulgingEyes: false,
    nauseaVomiting: false,
    suddenVisionLoss: false,
    floaters: false,
    flashingLights: false,
  });
  const { colors } = useTheme();

  const [result, setResult] = useState<string>('');

  const toggle = (key: SymptomKeys) => {
    setSymptoms((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const analyze = () => {
    const s = symptoms;

    if (
      s.hyphema ||
      s.bulgingEyes ||
      s.nauseaVomiting ||
      s.suddenVisionLoss ||
      s.flashingLights ||
      s.floaters
    ) {
      setResult(
        '🚨 EMERGENCY: Symptoms match acute Glaucoma. Seek IMMEDIATE medical attention.'
      );
      return;
    }

    const cataractScore =
      Number(s.cloudedVision) +
      Number(s.nightTrouble) +
      Number(s.glareSensitivity) +
      Number(s.brightLightNeed) +
      Number(s.halos) +
      Number(s.prescriptionChanges) +
      Number(s.colorFading) +
      Number(s.doubleVisionOneEye);

    const glaucomaScore =
      Number(s.eyePain) +
      Number(s.headaches) +
      Number(s.redEyes) +
      Number(s.doubleVision) +
      Number(s.blurredVision) +
      Number(s.lowVision) +
      Number(s.tunnelVision);

    if (glaucomaScore >= 4 && glaucomaScore > cataractScore) {
      setResult(
        '⚠️ Symptoms suggest possible **Glaucoma**. Consult an eye specialist.'
      );
    } else if (cataractScore >= 4 && cataractScore > glaucomaScore) {
      setResult(
        '⚠️ Symptoms suggest possible **Cataract**. Consult an eye specialist.'
      );
    } else {
      setResult(
        'ℹ️ Symptoms are mixed or unclear. Please consult an eye specialist for a detailed evaluation.'
      );
    }
  };

  const symptomList: { key: SymptomKeys; label: string }[] = [
    { key: 'eyePain', label: 'Eye pain or pressure' },
    { key: 'headaches', label: 'Headaches' },
    { key: 'redEyes', label: 'Red or bloodshot eyes' },
    { key: 'doubleVision', label: 'Double vision (both eyes)' },
    { key: 'blurredVision', label: 'Blurred vision' },
    { key: 'lowVision', label: 'Gradually developing low vision' },
    { key: 'tunnelVision', label: 'Tunnel vision or blind spots' },
    { key: 'cloudedVision', label: 'Clouded, blurred or dim vision' },
    { key: 'nightTrouble', label: 'Trouble seeing at night' },
    { key: 'glareSensitivity', label: 'Sensitivity to light and glare' },
    { key: 'brightLightNeed', label: 'Need for brighter light' },
    { key: 'halos', label: 'Seeing halos around lights' },
    { key: 'prescriptionChanges', label: 'Frequent prescription changes' },
    { key: 'colorFading', label: 'Fading or yellowing of colors' },
    { key: 'doubleVisionOneEye', label: 'Double vision in one eye' },
    { key: 'hyphema', label: 'Blood in front of iris (hyphema)' },
    { key: 'bulgingEyes', label: 'Bulging/enlarged eyeballs (buphthalmos)' },
    { key: 'nauseaVomiting', label: 'Nausea and vomiting with eye pain' },
    { key: 'suddenVisionLoss', label: 'Sudden vision loss' },
    { key: 'floaters', label: 'Sudden increase in floaters' },
    { key: 'flashingLights', label: 'Flashing lights (photopsias)' },
  ];

  return (
    <SafeAreaView style={[styles.container, {backgroundColor: colors.background}]}>
    <ScrollView contentContainerStyle={[styles.container, {backgroundColor: colors.background}]}>
      {symptomList.map(({ key, label }) => (
        <View key={key} style={styles.symptomRow}>
          <Text style={[styles.symptomLabel, { color: colors.text }]}>{label}</Text>
          <Switch
            value={symptoms[key]}
            onValueChange={() => toggle(key)}
           trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={symptoms[key] ? colors.card : colors.icon}
          />
        </View>
      ))}

      <TouchableOpacity style={[styles.analyzeButton, { backgroundColor: colors.primary }]} onPress={analyze}>
        <Text style={[styles.analyzeButtonText, { color: colors.text }]}>
          Analyze Symptoms</Text>
      </TouchableOpacity>

      {result !== '' && (
        <View style={[styles.resultBox, { backgroundColor: colors.card }]}>
          <Text style={[styles.resultText, { color: colors.text }]}>{result}</Text>
        </View>
      )}
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    paddingBottom: 120,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 24,
    textAlign: 'center',
  },
  symptomRow: {
    padding: 16,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  symptomLabel: {
    flex: 1,
    fontSize: 15,
  },
  analyzeButton: {
    marginTop: 30,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  analyzeButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resultBox: {
    marginTop: 30,
    padding: 20,
    borderRadius: 12,
  },
  resultText: {
    fontSize: 16,
    lineHeight: 22,
    textAlign: 'center',
  },
});
