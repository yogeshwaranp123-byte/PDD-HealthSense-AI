import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { usePredictionStore } from '../store/predictionStore';
import { Disease, type DiseaseKey } from '../utils/theme';
import {
  FileText,
  Upload,
  X,
  AlertTriangle,
  Activity,
  Droplet,
  Mic,
  Wind,
  Thermometer,
  ArrowRight,
  FileCheck
} from 'lucide-react';

const ICON_MAP = {
  Activity: Activity,
  Droplet: Droplet,
  Mic: Mic,
  Wind: Wind,
  Thermometer: Thermometer
};

export const Predict: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialDisease = (searchParams.get('disease') as DiseaseKey) || 'diabetes';

  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey>(initialDisease);
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const { predictWithReport, isLoading, error, clearError, history, fetchHistory } = usePredictionStore();

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  // Sync state if query parameters update
  useEffect(() => {
    const diseaseParam = searchParams.get('disease') as DiseaseKey;
    if (diseaseParam && Disease[diseaseParam]) {
      setSelectedDisease(diseaseParam);
      setFile(null);
      clearError();
    }
  }, [searchParams, clearError]);

  const handleDiseaseChange = (key: DiseaseKey) => {
    setSelectedDisease(key);
    setFile(null);
    clearError();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      clearError();
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      clearError();
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!file) return;

    await predictWithReport(selectedDisease, file);

    const result = usePredictionStore.getState().current;
    if (result) {
      navigate(`/result/${result.prediction_id || result.id}`);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = 1;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  };

  const details = Disease[selectedDisease];
  const IconComponent = ICON_MAP[details.icon as keyof typeof ICON_MAP] || Activity;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Title & Introduction */}
        <div style={styles.header}>
          <span style={styles.tag}>DIAGNOSTIC PIPELINE</span>
          <h1 style={styles.title}>AI Disease Predictor</h1>
          <p style={styles.subtitle}>
            Select a target disease and upload your laboratory diagnostic report. Our advanced multimodal AI will extract values and evaluate your risk index instantly.
          </p>
        </div>

        <div style={styles.grid}>
          {/* Left Column: Selector & Details */}
          <div style={styles.selectorCol}>
            <div style={styles.selectorWrapper}>
              <h3 style={styles.sectionLabel}>Select Target Condition</h3>
              <div style={styles.tabsContainer}>
                {(Object.keys(Disease) as DiseaseKey[]).map((key) => {
                  const info = Disease[key];
                  const isSelected = selectedDisease === key;
                  const TabIcon = ICON_MAP[info.icon as keyof typeof ICON_MAP] || Activity;

                  return (
                    <button
                      key={key}
                      onClick={() => handleDiseaseChange(key)}
                      style={{
                        ...styles.tabBtn,
                        borderColor: isSelected ? info.color : 'var(--border-default)',
                        background: isSelected ? 'var(--surface-highlight)' : 'var(--bg-secondary)',
                        color: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)'
                      }}
                    >
                      <TabIcon size={14} color={isSelected ? info.color : 'var(--text-tertiary)'} style={{ marginRight: '8px' }} />
                      {info.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Disease metadata info card */}
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedDisease}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                transition={{ duration: 0.3 }}
                style={styles.detailsCard}
                className="glassmorphism"
              >
                <div style={styles.cardHeader}>
                  <div style={{ ...styles.iconPill, background: `${details.color}15` }}>
                    <IconComponent size={16} color={details.color} />
                  </div>
                  <h3 style={{ ...styles.detailsTitle, color: details.color }}>{details.label}</h3>
                </div>

                <p style={styles.detailsDesc}>{details.description}</p>

                <div style={styles.detailsSplit}>
                  <div style={styles.splitCol}>
                    <h4 style={styles.colTitle}>Common Symptoms</h4>
                    <ul style={styles.colList}>
                      {details.symptoms.map((s, idx) => (
                        <li key={idx} style={styles.colItem}>• {s}</li>
                      ))}
                    </ul>
                  </div>
                  <div style={styles.splitCol}>
                    <h4 style={styles.colTitle}>Key AI Markers</h4>
                    <ul style={styles.colList}>
                      {details.keyMarkers.map((m, idx) => (
                        <li key={idx} style={styles.colItem}>• {m}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Column: Upload Box & Submit */}
          <div style={styles.uploadCol}>
            <h3 style={styles.sectionLabel}>Provide Diagnostic Report</h3>

            {/* File Dropzone */}
            {!file ? (
              <div
                onDragEnter={handleDrag}
                onDragOver={handleDrag}
                onDragLeave={handleDrag}
                onDrop={handleDrop}
                onClick={handleTriggerUpload}
                style={{
                  ...styles.dropzone,
                  borderColor: dragActive ? 'var(--text-accent)' : 'var(--border-default)',
                  background: dragActive ? 'var(--surface-highlight)' : 'var(--bg-secondary)',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".pdf, image/*"
                  style={{ display: 'none' }}
                />
                <Upload size={36} color="var(--text-accent)" style={{ marginBottom: '1rem' }} />
                <h4 style={styles.uploadTitle}>Drag & Drop lab report</h4>
                <p style={styles.uploadSub}>or click to select PDF or image files</p>
              </div>
            ) : (
              /* Selected file visual state card */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={styles.fileCard}
                className="glassmorphism"
              >
                <div style={styles.fileIconWrap}>
                  {file.type.includes('pdf') ? (
                    <FileText size={24} color="var(--text-accent)" />
                  ) : (
                    <FileCheck size={24} color="var(--text-accent)" />
                  )}
                </div>
                <div style={styles.fileInfo}>
                  <div style={styles.fileName} title={file.name}>
                    {file.name}
                  </div>
                  <span style={styles.fileMeta}>
                    {file.type.toUpperCase() || 'UNKNOWN'} • {formatBytes(file.size)}
                  </span>
                </div>
                <button onClick={() => setFile(null)} style={styles.removeFileBtn}>
                  <X size={16} />
                </button>
              </motion.div>
            )}

            {/* Submit Action */}
            <div style={styles.buttonWrapper}>
              <button
                onClick={handleAnalyze}
                disabled={!file || isLoading}
                style={{
                  ...styles.submitBtn,
                  background: file && !isLoading ? 'var(--text-accent)' : 'var(--bg-tertiary)',
                  color: file && !isLoading ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                  cursor: file && !isLoading ? 'pointer' : 'not-allowed',
                }}
              >
                {isLoading ? 'Analyzing Clinical Values...' : 'Run AI Report Analysis'}
              </button>
              {error && <span style={styles.errorText}>{error}</span>}
            </div>

            {/* Disclaimer card */}
            <div style={styles.disclaimer}>
              <div style={styles.disclaimerHeader}>
                <AlertTriangle size={14} color="#EF4444" style={{ marginRight: '6px' }} />
                <span>CLINICAL DISCLAIMER</span>
              </div>
              <p style={styles.disclaimerText}>
                This screening is powered entirely by artificial intelligence report analysis. Results represent statistical estimates of disease risk indicators extracted from your document and do NOT constitute a medical diagnosis, clinical referral, or treatment plan. Always consult a licensed healthcare professional to interpret test values.
              </p>
            </div>
          </div>
        </div>

        {/* History slider component if items exist */}
        {history && history.length > 0 && (
          <div style={styles.historySection}>
            <div style={styles.historyHeader}>
              <h2 style={styles.sectionLabel}>Recent Reports History</h2>
              <Link to="/history" style={styles.viewAll}>View All</Link>
            </div>

            <div style={styles.historyList}>
              {history.slice(0, 3).map((item) => {
                const itemInfo = Disease[item.disease as DiseaseKey];
                const dateStr = item.created_at
                  ? new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Recent';
                const isPositive = item.result === 'positive';
                const riskColor = isPositive ? 'var(--danger)' : 'var(--success)';

                return (
                  <Link
                    key={item.id}
                    to={`/result/${item.id}`}
                    style={styles.historyItem}
                    className="glassmorphism"
                  >
                    <div style={{ ...styles.historyIconPill, background: `${itemInfo?.color}15` }}>
                      <Activity size={14} color={itemInfo?.color || 'var(--text-accent)'} />
                    </div>
                    <div style={styles.historyMeta}>
                      <h4 style={styles.historyDisease}>{itemInfo?.label || item.disease.toUpperCase()}</h4>
                      <span style={styles.historyDate}>{dateStr}</span>
                    </div>
                    <div style={styles.historyRisk}>
                      <span style={{ ...styles.historyRiskVal, color: riskColor }}>
                        {Math.round(item.probability)}%
                      </span>
                      <span style={{ ...styles.historyRiskLbl, color: riskColor }}>
                        {item.result.toUpperCase()}
                      </span>
                    </div>
                    <ArrowRight size={14} color="var(--text-tertiary)" />
                  </Link>
                );
              })}
            </div>
          </div>
        )}
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
    gap: '3rem',
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
    textTransform: 'uppercase',
  },
  title: {
    fontSize: '2.5rem',
    fontFamily: 'var(--font-display)',
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    maxWidth: '650px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '3rem',
    alignItems: 'flex-start',
  },
  selectorCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  uploadCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
    letterSpacing: '1.5px',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },
  tabsContainer: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  tabBtn: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.8125rem',
    padding: '0.6rem 1rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'var(--transition-fast)',
  },
  detailsCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  iconPill: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '1.25rem',
    fontWeight: 'bold',
  },
  detailsDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    lineHeight: '1.6',
  },
  detailsSplit: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '1.25rem',
  },
  splitCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  colTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  colList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  colItem: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
  },
  dropzone: {
    border: '2px dashed var(--border-default)',
    borderRadius: 'var(--radius-xl)',
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-smooth)',
  },
  uploadTitle: {
    fontSize: '1.125rem',
    color: 'var(--text-primary)',
    fontWeight: '600',
    marginBottom: '4px',
  },
  uploadSub: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
  },
  fileCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    border: '1.5px solid rgba(200, 184, 154, 0.4)',
  },
  fileIconWrap: {
    width: '44px',
    height: '44px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface-highlight)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileInfo: {
    flex: 1,
    minWidth: 0,
  },
  fileName: {
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  fileMeta: {
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    marginTop: '2px',
    display: 'block',
  },
  removeFileBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.5rem',
    display: 'flex',
  },
  buttonWrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    marginTop: '0.5rem',
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontWeight: '600',
    fontSize: '0.875rem',
    transition: 'var(--transition-fast)',
  },
  errorText: {
    fontSize: '0.8125rem',
    color: 'var(--danger)',
    fontFamily: 'var(--font-mono)',
    textAlign: 'center',
  },
  disclaimer: {
    background: '#FEF2F2',
    border: '1px solid #FEE2E2',
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
  },
  disclaimerHeader: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    fontWeight: 'bold',
    color: '#991B1B',
    letterSpacing: '0.5px',
    marginBottom: '6px',
  },
  disclaimerText: {
    fontSize: '0.6875rem',
    color: '#7F1D1D',
    lineHeight: '1.5',
  },
  historySection: {
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  historyHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  viewAll: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-accent)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textDecoration: 'none',
  },
  historyList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  historyItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    borderRadius: 'var(--radius-lg)',
    textDecoration: 'none',
    gap: '1rem',
  },
  historyIconPill: {
    width: '32px',
    height: '32px',
    borderRadius: 'var(--radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyMeta: {
    flex: 1,
  },
  historyDisease: {
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
    fontWeight: '600',
    marginBottom: '2px',
  },
  historyDate: {
    color: 'var(--text-tertiary)',
    fontSize: '0.6875rem',
  },
  historyRisk: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginRight: '0.5rem',
  },
  historyRiskVal: {
    fontSize: '0.9375rem',
    fontWeight: 'bold',
    lineHeight: '1.1',
  },
  historyRiskLbl: {
    fontSize: '0.625rem',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.5px',
    marginTop: '2px',
    fontWeight: 'bold',
  },
};
export default Predict;
