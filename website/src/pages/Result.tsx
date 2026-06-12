import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictionStore, type Prediction } from '../store/predictionStore';
import { Disease, type DiseaseKey } from '../utils/theme';
import { GaugeChart } from '../components/charts/GaugeChart';
import { ShapBarChart } from '../components/charts/ShapBarChart';
import { reportService } from '../services/endpoints';
import { AlertCircle, FileText, ArrowLeft, Phone } from 'lucide-react';

export const Result: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { history, current, fetchHistory } = usePredictionStore();
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [emergencyVisible, setEmergencyVisible] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    // Attempt to find prediction in history or use current active prediction
    let found = history.find((p) => p.id === id || p.prediction_id === id);
    if (!found && current && (current.id === id || current.prediction_id === id)) {
      found = current;
    }
    
    if (found) {
      setPrediction(found);
      
      // Check for high-risk flags: probability >= 85% for specific conditions
      const disease = found.disease;
      const isHighRisk = found.probability >= 85 && (disease === 'lung_cancer' || disease === 'kidney');
      if (isHighRisk) {
        setTimeout(() => setEmergencyVisible(true), 800);
      }
    } else {
      // Re-fetch history in case it wasn't loaded
      fetchHistory().then(() => {
        const reFound = usePredictionStore.getState().history.find((p) => p.id === id || p.prediction_id === id);
        if (reFound) {
          setPrediction(reFound);
          const isHighRisk = reFound.probability >= 85 && (reFound.disease === 'lung_cancer' || reFound.disease === 'kidney');
          if (isHighRisk) {
            setTimeout(() => setEmergencyVisible(true), 800);
          }
        }
      });
    }
  }, [id, history, current, fetchHistory]);

  if (!prediction) {
    return (
      <div style={styles.loadingContainer}>
        <span style={styles.loadingText}>Fetching assessment results...</span>
      </div>
    );
  }

  const disease = prediction.disease as DiseaseKey;
  const diseaseInfo = Disease[disease];
  const isPositive = prediction.result === 'positive';

  const nextSteps = prediction.next_steps || [];
  const shapTop3 = prediction.shap_top3 || (prediction as any).shap_values || {};

  const confidenceColor =
    prediction.confidence === 'high'
      ? 'var(--danger)'
      : prediction.confidence === 'medium'
      ? 'var(--warning)'
      : 'var(--success)';

  const handleDownloadReport = async () => {
    const pId = prediction.prediction_id || prediction.id;
    if (!pId) return;

    setGeneratingReport(true);
    setReportError(null);

    try {
      const blob = await reportService.generate(pId);
      
      // Dynamic download creation in browser
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `HealthSense_${disease}_Report_${pId.substring(0, 6)}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setReportError('Could not generate PDF report. Check your connection.');
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Visual Overlay for High Risk Emergencies */}
      <AnimatePresence>
        {emergencyVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={styles.emergencyOverlay}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              style={styles.emergencyCard}
              className="glassmorphism"
            >
              <div style={styles.emergencyIconWrap}>
                <AlertCircle size={40} color="var(--danger)" />
              </div>
              <h2 style={styles.emergencyTitle}>High Risk Detected</h2>
              <p style={styles.emergencyMsg}>
                Your prediction indicates critical risk markers ({Math.round(prediction.probability)}% risk factor for {diseaseInfo?.label || disease}).<br />
                We advise immediate consultation with a qualified medical professional.
              </p>
              <a href="tel:108" style={styles.emergencyCallBtn}>
                <Phone size={16} style={{ marginRight: '8px' }} /> Call Emergency (108)
              </a>
              <button onClick={() => setEmergencyVisible(false)} style={styles.emergencyCloseBtn}>
                I understand — dismiss
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div style={styles.wrapper}>
        {/* Navigation back link */}
        <Link to="/dashboard" style={styles.backLink}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Dashboard
        </Link>

        {/* Header Title */}
        <div style={styles.header}>
          <span style={styles.tag}>
            {diseaseInfo?.label?.toUpperCase() || disease.toUpperCase()} — RISK SCAN
          </span>
          <h1 style={styles.title}>Analysis Result</h1>
        </div>

        <div style={styles.grid}>
          {/* Left Column: Gauge and interpretation */}
          <div style={styles.leftCol}>
            {/* Visual Gauge summary */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              style={styles.gaugeCard}
              className="glassmorphism"
            >
              <GaugeChart probability={prediction.probability} />

              <div style={styles.badgesRow}>
                <span style={{
                  ...styles.pill,
                  color: isPositive ? 'var(--danger)' : 'var(--success)',
                  background: isPositive ? 'rgba(192, 57, 43, 0.1)' : 'rgba(39, 174, 96, 0.1)',
                  borderColor: isPositive ? 'rgba(192, 57, 43, 0.2)' : 'rgba(39, 174, 96, 0.2)'
                }}>
                  {prediction.result.toUpperCase()} RISK INDICATORS
                </span>

                <span style={{
                  ...styles.pill,
                  color: confidenceColor,
                  background: `${confidenceColor}10`,
                  borderColor: `${confidenceColor}25`
                }}>
                  {prediction.confidence.toUpperCase()} CONFIDENCE
                </span>
              </div>
            </motion.div>

            {/* AI Text Interpretation */}
            <div style={styles.section}>
              <h3 style={styles.sectionLabel}>CLINICAL INTERPRETATION</h3>
              <div style={styles.textCard} className="glassmorphism">
                <p style={styles.interpretationText}>{prediction.interpretation}</p>
              </div>
            </div>
          </div>

          {/* Right Column: SHAP factors & Next Steps */}
          <div style={styles.rightCol}>
            {/* SHAP Indicators list */}
            {shapTop3 && Object.keys(shapTop3).length > 0 && (
              <div style={styles.section}>
                <h3 style={styles.sectionLabel}>TOP CONTRIBUTING BIOMARKERS</h3>
                <div style={styles.textCard} className="glassmorphism">
                  <ShapBarChart data={shapTop3} />
                </div>
              </div>
            )}

            {/* Actionable recommendations */}
            <div style={styles.section}>
              <h3 style={styles.sectionLabel}>RECOMMENDED NEXT STEPS</h3>
              <div style={styles.textCard} className="glassmorphism">
                <div style={styles.stepsList}>
                  {nextSteps.map((step, idx) => (
                    <div key={idx} style={styles.stepRow}>
                      <div style={styles.stepBadge}>
                        <span>{idx + 1}</span>
                      </div>
                      <p style={styles.stepText}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions panel */}
            <div style={styles.actionsPanel}>
              <button
                onClick={handleDownloadReport}
                disabled={generatingReport}
                style={styles.downloadBtn}
              >
                <FileText size={16} style={{ marginRight: '8px' }} />
                {generatingReport ? 'Generating PDF...' : 'Download Signed PDF Report'}
              </button>
              {reportError && <span style={styles.errorText}>{reportError}</span>}

              <Link to="/history" style={styles.historyBtn}>
                View Assessments History
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    background: 'var(--bg-primary)',
    minHeight: '100vh',
    padding: '4rem 2rem',
  },
  wrapper: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  backLink: {
    color: 'var(--text-secondary)',
    fontSize: '0.8125rem',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-mono)',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  tag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-accent)',
    letterSpacing: '2.5px',
  },
  title: {
    fontSize: '2.5rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: '-0.5px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '3rem',
    alignItems: 'flex-start',
  },
  leftCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  rightCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  gaugeCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2rem',
  },
  badgesRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    justifyContent: 'center',
  },
  pill: {
    fontSize: '0.6875rem',
    fontFamily: 'var(--font-mono)',
    padding: '4px 12px',
    borderRadius: 'var(--radius-sm)',
    border: '1px solid',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  textCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '2rem',
  },
  interpretationText: {
    fontSize: '0.9375rem',
    color: 'var(--text-primary)',
    lineHeight: '1.7',
  },
  stepsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  stepRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '1rem',
  },
  stepBadge: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    background: 'var(--surface-highlight)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-accent)',
    fontSize: '0.6875rem',
    fontFamily: 'var(--font-mono)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  stepText: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  actionsPanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  downloadBtn: {
    background: 'transparent',
    border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    fontWeight: '600',
    fontSize: '0.875rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'var(--transition-fast)',
    '&:hover': {
      background: 'var(--surface-highlight)',
    },
  } as any,
  historyBtn: {
    color: 'var(--text-secondary)',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    textDecoration: 'none',
    fontSize: '0.875rem',
    transition: 'var(--transition-fast)',
  },
  errorText: {
    fontSize: '0.8125rem',
    color: 'var(--danger)',
    fontFamily: 'var(--font-mono)',
    textAlign: 'center',
  },
  loadingContainer: {
    minHeight: '80vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.875rem',
  },
  emergencyOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '2rem',
  },
  emergencyCard: {
    maxWidth: '480px',
    width: '100%',
    borderRadius: 'var(--radius-xxl)',
    padding: '3rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    borderTop: '3px solid var(--danger)',
  },
  emergencyIconWrap: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'rgba(192, 57, 43, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1.5rem',
  },
  emergencyTitle: {
    fontSize: '1.5rem',
    color: 'var(--danger)',
    fontFamily: 'var(--font-display)',
    marginBottom: '1rem',
  },
  emergencyMsg: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.65',
    marginBottom: '2rem',
  },
  emergencyCallBtn: {
    background: 'var(--danger)',
    color: '#FFFFFF',
    fontWeight: '600',
    padding: '1rem 2rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    textDecoration: 'none',
    marginBottom: '1rem',
    boxShadow: '0 4px 12px rgba(192, 57, 43, 0.3)',
  },
  emergencyCloseBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    padding: '0.5rem',
    letterSpacing: '0.5px',
  },
};
export default Result;
