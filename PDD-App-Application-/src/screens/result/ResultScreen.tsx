import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Dimensions,
} from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { GaugeChart } from '../../components/charts/GaugeChart';
import { ShapBarChart } from '../../components/charts/ShapBarChart';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { theme, Typography, Spacing, Radius, Disease, DiseaseKey } from '../../utils/theme';
import { Prediction } from '../../store/predictionStore';
import { reportService } from '../../services/endpoints';

export const ResultScreen = ({ route, navigation }: any) => {
  const { prediction } = route.params as { prediction: Prediction };
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const insets = useSafeAreaInsets();

  const disease = prediction.disease as DiseaseKey;
  const diseaseInfo = Disease[disease];
  const isPositive = prediction.result === 'positive';

  // Fallbacks for older history documents that did not save these fields in MongoDB
  const nextSteps = prediction.next_steps || [];
  const shapTop3 = prediction.shap_top3 || (prediction as any).shap_values || {};

  useEffect(() => {
    const isHighRisk =
      prediction.probability >= 85 &&
      (disease === 'lung_cancer' || disease === 'kidney');
    if (isHighRisk) {
      setTimeout(() => setEmergencyVisible(true), 800);
    }
  }, []);

  const confidenceColor =
    prediction.confidence === 'high'
      ? theme.semantic.danger
      : prediction.confidence === 'medium'
      ? theme.semantic.warning
      : theme.semantic.success;

  const handleReport = async () => {
    if (!prediction.prediction_id) {
      Alert.alert('Error', 'Save the prediction first to generate a report.');
      return;
    }
    setGeneratingReport(true);
    try {
      await reportService.generate(prediction.prediction_id);
      Alert.alert('Report', 'PDF report generated successfully.');
    } catch {
      Alert.alert('Error', 'Could not generate report. Check your connection.');
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" translucent={false} backgroundColor={theme.background.primary} />

      {/* Modern Compact Header */}
      <View style={[styles.headerContainer, { paddingTop: insets.top }]}>
        <ScreenHeader onBack={() => navigation.goBack()} />
      </View>

      {/* Content sheet */}
      <ScrollView
        style={styles.sheet}
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 100 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetCategory}>{diseaseInfo?.label?.toUpperCase() ?? prediction.disease.toUpperCase()} — ANALYSIS RESULT</Text>
        </View>

        {/* Result summary card */}
        <Animated.View entering={FadeInUp.duration(500).springify()} style={styles.resultCard}>
          <View style={styles.gaugeWrapper}>
            <GaugeChart probability={prediction.probability} />
          </View>
          <View style={styles.resultBadgesRow}>
            <View style={[styles.resultBadge, { backgroundColor: isPositive ? theme.semantic.danger + '18' : theme.semantic.success + '18', borderColor: isPositive ? theme.semantic.danger + '44' : theme.semantic.success + '44' }]}>
              <Feather
                name={isPositive ? 'alert-circle' : 'check-circle'}
                size={12}
                color={isPositive ? theme.semantic.danger : theme.semantic.success}
              />
              <Text style={[styles.resultBadgeText, { color: isPositive ? theme.semantic.danger : theme.semantic.success }]}>
                {prediction.result.toUpperCase()}
              </Text>
            </View>
            <View style={[styles.resultBadge, { backgroundColor: confidenceColor + '18', borderColor: confidenceColor + '44' }]}>
              <Feather name="bar-chart-2" size={12} color={confidenceColor} />
              <Text style={[styles.resultBadgeText, { color: confidenceColor }]}>
                {prediction.confidence.toUpperCase()} CONFIDENCE
              </Text>
            </View>
          </View>
        </Animated.View>

        {/* What This Means */}
        <Animated.View entering={FadeInDown.delay(100).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>INTERPRETATION</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.interpretationText}>{prediction.interpretation}</Text>
          </View>
        </Animated.View>

        {/* SHAP Factors */}
        {shapTop3 && Object.keys(shapTop3).length > 0 && (
          <Animated.View entering={FadeInDown.delay(200).springify()} style={styles.section}>
            <Text style={styles.sectionLabel}>TOP CONTRIBUTING FACTORS</Text>
            <View style={styles.sectionCard}>
              <ShapBarChart data={shapTop3} />
            </View>
          </Animated.View>
        )}

        {/* Recommended Actions */}
        <Animated.View entering={FadeInDown.delay(300).springify()} style={styles.section}>
          <Text style={styles.sectionLabel}>RECOMMENDED ACTIONS</Text>
          <View style={styles.sectionCard}>
            {nextSteps.map((step, i) => (
              <View key={i} style={styles.stepRow}>
                <View style={styles.stepNum}>
                  <Text style={styles.stepNumText}>{i + 1}</Text>
                </View>
                <Text style={styles.stepText}>{step}</Text>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* Actions */}
        <Animated.View entering={FadeInDown.delay(400).springify()} style={styles.actions}>
          <Button
            label="Generate PDF Report"
            onPress={handleReport}
            loading={generatingReport}
            variant="outline"
          />
          <View style={{ height: Spacing.sm }} />
          <Button
            label="View History"
            onPress={() => navigation.navigate('History')}
            variant="ghost"
          />
        </Animated.View>
      </ScrollView>

      {/* Emergency Modal */}
      <Modal visible={emergencyVisible} transparent animationType="fade">
        <View style={styles.emergencyOverlay}>
          <View style={styles.emergencyCard}>
            <View style={styles.emergencyIconWrap}>
              <Feather name="alert-circle" size={40} color={theme.semantic.danger} />
            </View>
            <Text style={styles.emergencyTitle}>High Risk Detected</Text>
            <Text style={styles.emergencyMessage}>
              Your prediction indicates very high risk ({Math.round(prediction.probability)}%).{'\n'}
              Please seek immediate medical attention.
            </Text>
            <TouchableOpacity
              style={styles.emergencyCall}
              onPress={() => {
                Alert.alert('Emergency', 'Dialing 108...');
                setEmergencyVisible(false);
              }}
            >
              <Feather name="phone" size={16} color={theme.text.primary} style={{ marginRight: 8 }} />
              <Text style={styles.emergencyCallText}>Call Emergency (108)</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.emergencyAck}
              onPress={() => setEmergencyVisible(false)}
            >
              <Text style={styles.emergencyAckText}>I understand — dismiss</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background.primary },
  headerContainer: {
    backgroundColor: theme.background.primary,
    borderBottomWidth: 0.5,
    borderBottomColor: theme.border.subtle,
    paddingBottom: 4,
  },

  // Sheet
  sheet: {
    flex: 1,
    backgroundColor: theme.background.primary,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  sheetHeader: {
    paddingTop: 20,
    marginBottom: Spacing.xl,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 32,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.border.default,
    marginBottom: Spacing.lg,
  },
  sheetCategory: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 2,
    textAlign: 'center',
  },

  // Result card
  resultCard: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  gaugeWrapper: {
    marginBottom: Spacing.md,
  },
  resultBadgesRow: {
    flexDirection: 'row',
    gap: 8,
  },
  resultBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderWidth: 1,
  },
  resultBadgeText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    letterSpacing: 0.5,
  },

  // Sections
  section: {
    marginBottom: Spacing.xl,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 2.5,
    marginBottom: Spacing.sm,
  },
  sectionCard: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xl,
    padding: 20,
    borderWidth: 1,
    borderColor: theme.border.subtle,
  },
  interpretationText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.md,
    color: theme.text.primary,
    lineHeight: Typography.fontSize.md * 1.65,
  },

  // Steps
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  stepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.surface.highlight,
    borderWidth: 1,
    borderColor: theme.border.default,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 1,
  },
  stepNumText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.accent,
  },
  stepText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    color: theme.text.secondary,
    flex: 1,
    lineHeight: Typography.fontSize.base * 1.65,
  },

  actions: { marginBottom: Spacing.xl },

  // Emergency modal
  emergencyOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  emergencyCard: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xxl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: theme.semantic.danger,
    borderWidth: 1,
    borderColor: theme.border.default,
  },
  emergencyIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: theme.semantic.danger + '18',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.lg,
  },
  emergencyTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.xl,
    color: theme.semantic.danger,
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  emergencyMessage: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.base,
    color: theme.text.secondary,
    textAlign: 'center',
    lineHeight: Typography.fontSize.base * 1.65,
    marginBottom: Spacing.xl,
  },
  emergencyCall: {
    backgroundColor: theme.semantic.danger,
    borderRadius: Radius.xl,
    paddingVertical: 16,
    paddingHorizontal: Spacing.xl,
    width: '100%',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  emergencyCallText: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.base,
    color: theme.text.primary,
  },
  emergencyAck: { paddingVertical: Spacing.sm },
  emergencyAckText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
    letterSpacing: 0.5,
  },
});
