import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  FadeInDown,
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { usePredictionStore } from '../../store/predictionStore';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/ui/ScreenHeader';
import { theme, Typography, Spacing, Radius, DiseaseKey, Disease } from '../../utils/theme';

const { height, width } = Dimensions.get('window');

interface SelectedFile {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
}

// Custom disease metadata for displaying helpful details on the UI
const DISEASE_DETAILS: Record<DiseaseKey, {
  description: string;
  symptoms: string[];
  preventions: string[];
  keyMarkers: string[];
}> = {
  diabetes: {
    description: "A chronic health condition that affects how your body turns food into energy. AI analyzes markers like Glucose, HbA1c, Insulin, and BMI.",
    symptoms: ["Increased thirst & urination", "Unexplained weight loss", "Fatigue & blurry vision"],
    preventions: ["Maintain a balanced low-sugar diet", "30 mins of daily exercise", "Regular HbA1c screenings"],
    keyMarkers: ["Fasting Glucose", "HbA1c Level", "BMI (Body Mass Index)"],
  },
  kidney: {
    description: "Chronic Kidney Disease (CKD) involves gradual loss of kidney function. AI analyzes serum chemistry and filtration markers.",
    symptoms: ["Swelling in feet/ankles", "Fatigue & shortness of breath", "Changes in urination frequency"],
    preventions: ["Manage blood pressure & blood sugar", "Limit high-sodium & processed foods", "Stay hydrated & avoid excessive painkillers"],
    keyMarkers: ["Serum Creatinine", "Blood Urea Nitrogen (BUN)", "Albumin / GFR"],
  },
  parkinsons: {
    description: "A progressive nervous system disorder affecting movement. AI analyzes voice acoustic markers, speech fluctuations, and tremors.",
    symptoms: ["Tremors or shaking", "Rigid muscles & slowed movement", "Speech & voice volume changes"],
    preventions: ["Regular aerobic exercise", "Diet rich in Omega-3 fatty acids", "Cognitive & coordination tasks"],
    keyMarkers: ["Vocal Jitter & Shimmer", "Fundamental Frequency (F0)", "Harmonic-to-Noise Ratio"],
  },
  lung_cancer: {
    description: "A cancer that starts in the lungs, strongly linked to lifestyle factors. AI maps symptoms, family history, and lifestyle profiles.",
    symptoms: ["Persistent cough or coughing blood", "Shortness of breath & chest pain", "Hoarseness & wheezing"],
    preventions: ["Avoid smoking and second-hand smoke", "Avoid occupational carcinogens", "Air filtration in high-pollution areas"],
    keyMarkers: ["Symptom patterns", "Smoking history", "Environmental exposures"],
  },
  thyroid: {
    description: "Hormonal imbalances caused by hyperthyroidism or hypothyroidism. AI evaluates blood thyroid panel values.",
    symptoms: ["Unexplained weight changes", "Fatigue or hyper-activity", "Sensitivity to cold or heat"],
    preventions: ["Ensure adequate dietary iodine", "Regular thyroid blood panels", "Stress management"],
    keyMarkers: ["TSH (Thyroid Stimulating Hormone)", "Free T3", "Free T4 / FTI"],
  },
};

export const PredictScreen = ({ route, navigation }: any) => {
  const initialDisease = (route.params?.disease as DiseaseKey) || 'diabetes';
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey>(initialDisease);
  const [file, setFile] = useState<SelectedFile | null>(null);
  
  const { predictWithReport, isLoading, error, clearError, history, fetchHistory } = usePredictionStore();
  const insets = useSafeAreaInsets();

  const details = DISEASE_DETAILS[selectedDisease];
  const diseaseInfo = Disease[selectedDisease];
  const diseaseName = diseaseInfo?.label ?? selectedDisease.replace('_', ' ');

  // Fetch prediction history on mount
  useEffect(() => {
    fetchHistory();
  }, []);

  // Update selected disease if route parameter changes
  useEffect(() => {
    if (route.params?.disease) {
      setSelectedDisease(route.params.disease);
      setFile(null); // Clear selected file when changing disease
    }
  }, [route.params?.disease]);

  const handlePickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['image/*', 'application/pdf'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.name,
          mimeType: asset.mimeType || 'image/jpeg',
          size: asset.size,
        });
        clearError();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to pick document.');
    }
  };

  const handleTakePhoto = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert('Permission Denied', 'Camera permission is required to snap reports.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        setFile({
          uri: asset.uri,
          name: asset.fileName || 'scanned_report.jpg',
          mimeType: asset.mimeType || 'image/jpeg',
          size: asset.fileSize,
        });
        clearError();
      }
    } catch (e) {
      Alert.alert('Error', 'Failed to capture photo.');
    }
  };

  const handleAnalyze = async () => {
    if (!file) {
      Alert.alert('No Report Selected', 'Please upload or snap a photo of a medical report first.');
      return;
    }

    await predictWithReport(selectedDisease, file.uri, file.mimeType, file.name);
    
    const result = usePredictionStore.getState().current;
    if (result) {
      navigation.navigate('Result', { prediction: result });
    } else {
      const activeError = usePredictionStore.getState().error;
      Alert.alert('Analysis Failed', activeError || 'Failed to analyze the medical report. Please verify the file is clear and try again.');
    }
  };

  // Helper to get formatted file size
  const getFileSize = (bytes?: number) => {
    if (!bytes) return '';
    const kb = bytes / 1024;
    return kb > 1024 ? `${(kb / 1024).toFixed(1)} MB` : `${kb.toFixed(0)} KB`;
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
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.sheetHeader}>
          <Text style={styles.sheetTitle}>AI Disease Predictor</Text>
          <Text style={styles.sheetSubtitle}>
            Select a target disease and upload your laboratory diagnostic report. Our advanced multimodal AI will extract values and evaluate your risk index instantly.
          </Text>
        </View>

        {/* Dynamic Horizontal Disease Selector */}
        <View style={styles.selectorWrapper}>
          <Text style={styles.sectionLabel}>Select Target Condition</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalTabs}
          >
            {(Object.keys(Disease) as DiseaseKey[]).map((key) => {
              const info = Disease[key];
              const isSelected = selectedDisease === key;
              return (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.tabButton,
                    isSelected && styles.tabButtonActive,
                    isSelected && { borderColor: info.color }
                  ]}
                  onPress={() => {
                    setSelectedDisease(key);
                    setFile(null); // Reset file on switch
                    clearError();
                  }}
                  activeOpacity={0.8}
                >
                  <Feather
                    name={info.icon as any}
                    size={14}
                    color={isSelected ? info.color : theme.text.tertiary}
                  />
                  <Text style={[styles.tabText, isSelected && styles.tabTextActive]}>
                    {info.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Beautiful Disease Details Card */}
        <Animated.View entering={FadeInDown.springify()} key={selectedDisease} style={styles.detailsCard}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconPill, { backgroundColor: diseaseInfo?.color + '22' }]}>
              <Feather name={diseaseInfo?.icon as any} size={14} color={diseaseInfo?.color} />
            </View>
            <Text style={[styles.detailsTitle, { color: diseaseInfo?.color }]}>{diseaseName}</Text>
          </View>
          
          <Text style={styles.detailsDesc}>{details.description}</Text>

          <View style={styles.detailsSplit}>
            <View style={styles.splitCol}>
              <Text style={styles.colTitle}>Common Symptoms</Text>
              {details.symptoms.map((s, idx) => (
                <Text key={idx} style={styles.colItem}>• {s}</Text>
              ))}
            </View>
            <View style={styles.splitCol}>
              <Text style={styles.colTitle}>Key AI Markers</Text>
              {details.keyMarkers.map((m, idx) => (
                <Text key={idx} style={styles.colItem}>• {m}</Text>
              ))}
            </View>
          </View>
        </Animated.View>

        {/* Upload & Scan Section */}
        <Text style={styles.sectionLabel}>Provide Diagnostic Report</Text>
        
        {!file ? (
          <View style={styles.uploadCardContainer}>
            <TouchableOpacity 
              style={styles.uploadCard} 
              onPress={handlePickDocument}
              activeOpacity={0.9}
            >
              <Feather name="file-text" size={32} color={theme.text.accent} style={styles.uploadIcon} />
              <Text style={styles.uploadTitle}>Upload Lab Report</Text>
              <Text style={styles.uploadSub}>Select a PDF or Image from your device</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.dividerLine} />
            </View>

            <TouchableOpacity 
              style={[styles.uploadCard, styles.cameraCard]} 
              onPress={handleTakePhoto}
              activeOpacity={0.9}
            >
              <Feather name="camera" size={32} color={theme.text.accent} style={styles.uploadIcon} />
              <Text style={styles.uploadTitle}>Snap Photo of Report</Text>
              <Text style={styles.uploadSub}>Use camera to scan physical paper documents</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Selected File Preview Card */
          <Animated.View entering={FadeInDown.duration(200)} style={styles.fileCard}>
            <View style={styles.fileIconWrap}>
              <Feather 
                name={file.mimeType.includes('pdf') ? "file" : "image"} 
                size={24} 
                color={theme.text.accent} 
              />
            </View>
            <View style={styles.fileInfo}>
              <Text style={styles.fileName} numberOfLines={1}>{file.name}</Text>
              <Text style={styles.fileSize}>
                {file.mimeType.toUpperCase()} {file.size ? `• ${getFileSize(file.size)}` : ''}
              </Text>
            </View>
            <TouchableOpacity 
              style={styles.fileRemove} 
              onPress={() => setFile(null)}
              activeOpacity={0.7}
            >
              <Feather name="x" size={18} color={theme.text.tertiary} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Prediction Trigger Button */}
        <View style={styles.buttonWrapper}>
          <Button 
            label={isLoading ? "Analyzing Clinical Data..." : "Run AI Report Analysis"} 
            onPress={handleAnalyze} 
            loading={isLoading} 
            disabled={!file || isLoading}
            size="lg" 
          />
        </View>

        {/* Clinical Medical Disclaimer Alert */}
        <View style={styles.disclaimerContainer}>
          <View style={styles.disclaimerHeader}>
            <Feather name="alert-triangle" size={14} color="#EF4444" />
            <Text style={styles.disclaimerTitle}>CLINICAL DISCLAIMER</Text>
          </View>
          <Text style={styles.disclaimerText}>
            This screening is powered entirely by artificial intelligence report analysis. Results represent statistical estimates of disease risk indicators extracted from your document and do NOT constitute a medical diagnosis, clinical referral, or treatment plan. Always consult a licensed healthcare professional or physician to interpret diagnostic test results and address persistent symptoms.
          </Text>
        </View>

        {/* Recent Scans (Embedded History) */}
        {history && history.length > 0 && (
          <View style={styles.historyContainer}>
            <View style={styles.historyHeader}>
              <Text style={styles.sectionLabel}>Recent Reports History</Text>
              <TouchableOpacity 
                onPress={() => navigation.navigate('HistoryList')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            {history.slice(0, 3).map((item) => {
              const itemInfo = Disease[item.disease as DiseaseKey];
              const dateStr = item.created_at 
                ? new Date(item.created_at).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })
                : 'Recent';
              const isPositive = item.result === 'positive';
              const riskColor = isPositive ? theme.semantic.danger : theme.semantic.success;

              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.historyItem}
                  onPress={() => navigation.navigate('Result', { prediction: item })}
                  activeOpacity={0.8}
                >
                  <View style={[styles.historyIconPill, { backgroundColor: itemInfo?.color + '15' }]}>
                    <Feather name={itemInfo?.icon as any || 'activity'} size={14} color={itemInfo?.color} />
                  </View>
                  <View style={styles.historyMeta}>
                    <Text style={styles.historyDisease}>{itemInfo?.label || item.disease.toUpperCase()}</Text>
                    <Text style={styles.historyDate}>{dateStr}</Text>
                  </View>
                  <View style={styles.historyRisk}>
                    <Text style={[styles.historyRiskVal, { color: riskColor }]}>
                      {Math.round(item.probability)}%
                    </Text>
                    <Text style={[styles.historyRiskLbl, { color: riskColor }]}>
                      {item.result.toUpperCase()}
                    </Text>
                  </View>
                  <Feather name="chevron-right" size={14} color={theme.text.tertiary} />
                </TouchableOpacity>
              );
            })}
          </View>
        )}

      </ScrollView>
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
    paddingTop: 0,
  },
  sheetHeader: {
    paddingTop: 20,
    marginBottom: Spacing.md,
  },
  sheetHandle: {
    width: 32,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: theme.border.default,
    alignSelf: 'center',
    marginBottom: Spacing.xl,
  },
  sheetTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.xxl,
    color: theme.text.primary,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  sheetSubtitle: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: theme.text.secondary,
    lineHeight: Typography.fontSize.sm * 1.55,
  },

  // Disease selector tabs
  sectionLabel: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: Spacing.sm,
    marginTop: Spacing.lg,
  },
  selectorWrapper: {
    marginBottom: Spacing.md,
  },
  horizontalTabs: {
    gap: 8,
    paddingRight: 20,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: Radius.full,
    borderWidth: 1,
    borderColor: theme.border.default,
    backgroundColor: theme.background.secondary,
  },
  tabButtonActive: {
    backgroundColor: theme.surface.highlight,
  },
  tabText: {
    fontFamily: Typography.fontFamily.label,
    fontSize: Typography.fontSize.sm,
    color: theme.text.tertiary,
  },
  tabTextActive: {
    color: theme.text.primary,
    fontWeight: 'bold',
  },

  // Disease Details Card
  detailsCard: {
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    marginBottom: Spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  iconPill: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.md,
    fontWeight: 'bold',
  },
  detailsDesc: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.sm,
    color: theme.text.secondary,
    lineHeight: Typography.fontSize.sm * 1.5,
    marginBottom: Spacing.md,
  },
  detailsSplit: {
    flexDirection: 'row',
    borderTopWidth: 0.5,
    borderTopColor: theme.border.subtle,
    paddingTop: Spacing.md,
    gap: 12,
  },
  splitCol: {
    flex: 1,
  },
  colTitle: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 9,
    color: theme.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  colItem: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 11,
    color: theme.text.secondary,
    marginBottom: 4,
  },

  // Upload card
  uploadCardContainer: {
    gap: Spacing.xs,
  },
  uploadCard: {
    backgroundColor: theme.background.secondary,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: theme.border.default,
    borderRadius: Radius.xl,
    paddingVertical: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraCard: {
    borderStyle: 'solid',
    backgroundColor: theme.background.secondary + 'dd',
  },
  uploadIcon: {
    marginBottom: 8,
  },
  uploadTitle: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.text.primary,
    marginBottom: 2,
  },
  uploadSub: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs,
    color: theme.text.tertiary,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
    gap: 12,
  },
  dividerLine: {
    flex: 0.25,
    height: 1,
    backgroundColor: theme.border.subtle,
  },
  dividerText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
  },

  // Selected file preview
  fileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.xl,
    borderWidth: 1.5,
    borderColor: theme.text.accent + '66',
    padding: Spacing.md,
    gap: 12,
  },
  fileIconWrap: {
    width: 44,
    height: 44,
    borderRadius: Radius.lg,
    backgroundColor: theme.surface.highlight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: theme.text.accent + '22',
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.base,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  fileSize: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.tertiary,
    marginTop: 2,
  },
  fileRemove: {
    padding: 8,
  },

  // Button
  buttonWrapper: {
    marginTop: Spacing.xl,
    marginBottom: Spacing.sm,
  },

  // Disclaimer card
  disclaimerContainer: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FEE2E2',
    borderRadius: Radius.lg,
    padding: Spacing.md,
    marginTop: Spacing.lg,
  },
  disclaimerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  disclaimerTitle: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    fontWeight: 'bold',
    color: '#991B1B',
    letterSpacing: 0.5,
  },
  disclaimerText: {
    fontFamily: Typography.fontFamily.body,
    fontSize: Typography.fontSize.xs - 1,
    color: '#7F1D1D',
    lineHeight: 15,
  },
  historyContainer: {
    marginTop: Spacing.xl,
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  viewAllText: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 10,
    color: theme.text.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.background.secondary,
    borderRadius: Radius.lg,
    padding: 12,
    borderWidth: 1,
    borderColor: theme.border.subtle,
    marginBottom: 8,
    gap: 12,
  },
  historyIconPill: {
    width: 32,
    height: 32,
    borderRadius: Radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyMeta: {
    flex: 1,
  },
  historyDisease: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.text.primary,
  },
  historyDate: {
    fontFamily: Typography.fontFamily.body,
    fontSize: 10,
    color: theme.text.tertiary,
    marginTop: 2,
  },
  historyRisk: {
    alignItems: 'flex-end',
  },
  historyRiskVal: {
    fontFamily: Typography.fontFamily.display,
    fontSize: Typography.fontSize.sm,
    fontWeight: 'bold',
  },
  historyRiskLbl: {
    fontFamily: Typography.fontFamily.mono,
    fontSize: 8,
    fontWeight: 'bold',
    letterSpacing: 0.5,
    marginTop: 1,
  },
});
