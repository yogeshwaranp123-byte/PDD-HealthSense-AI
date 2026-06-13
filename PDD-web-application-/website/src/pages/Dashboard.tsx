import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useUserStore } from '../store/userStore';
import { usePredictionStore } from '../store/predictionStore';
import { Disease, type DiseaseKey } from '../utils/theme';
import {
  Activity,
  Clock,
  MapPin,
  MessageSquare,
  ChevronRight,
  Plus
} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { profile, fetchProfile } = useUserStore();
  const { history, fetchHistory, isLoading } = usePredictionStore();

  useEffect(() => {
    fetchProfile();
    fetchHistory();
  }, [fetchProfile, fetchHistory]);

  const getTimeOfDay = () => {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  };

  const firstName = profile?.name ? profile.name.split(' ')[0] : 'Guest';
  const recentPredictions = history.slice(0, 5);

  // Stats calculations
  const highRiskCount = history.filter(p => p.result === 'positive').length;
  const lowRiskCount = history.filter(p => p.result === 'negative').length;
  const totalCount = history.length;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header Greeting */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          style={styles.header}
        >
          <div>
            <span style={styles.tag}>HEALTH OVERVIEW</span>
            <h1 style={styles.greeting}>
              Good {getTimeOfDay()},<br />
              <span className="text-gradient">{firstName}.</span>
            </h1>
          </div>
          {profile?.name && (
            <div style={styles.avatarDot} title={profile.name}>
              {profile.name.charAt(0).toUpperCase()}
            </div>
          )}
        </motion.div>

        <div style={styles.grid}>
          {/* Left Area: Controls & Modules */}
          <div style={styles.mainCol}>
            {/* Quick access widgets */}
            <section style={styles.section}>
              <h2 style={styles.sectionLabel}>QUICK ACCESS</h2>
              <div style={styles.quickGrid}>
                <Link to="/predict" style={styles.quickCard}>
                  <div style={styles.quickIconWrap}>
                    <Plus size={18} color="var(--text-accent)" />
                  </div>
                  <h3 style={styles.quickTitle}>New Scan</h3>
                  <p style={styles.quickSub}>Start AI report screening</p>
                </Link>

                <Link to="/history" style={styles.quickCard}>
                  <div style={styles.quickIconWrap}>
                    <Clock size={18} color="var(--text-accent)" />
                  </div>
                  <h3 style={styles.quickTitle}>History</h3>
                  <p style={styles.quickSub}>Review past diagnostics</p>
                </Link>

                <Link to="/hospitals" style={styles.quickCard}>
                  <div style={styles.quickIconWrap}>
                    <MapPin size={18} color="var(--text-accent)" />
                  </div>
                  <h3 style={styles.quickTitle}>Clinics</h3>
                  <p style={styles.quickSub}>Find nearby care facilities</p>
                </Link>

                <Link to="/chat" style={styles.quickCard}>
                  <div style={styles.quickIconWrap}>
                    <MessageSquare size={18} color="var(--text-accent)" />
                  </div>
                  <h3 style={styles.quickTitle}>Ask AI</h3>
                  <p style={styles.quickSub}>Health chatbot assistant</p>
                </Link>
              </div>
            </section>

            {/* Disease Modules cards */}
            <section style={styles.section}>
              <h2 style={styles.sectionLabel}>DISEASE MODULES</h2>
              <div style={styles.moduleGrid}>
                {(Object.keys(Disease) as DiseaseKey[]).map((key, i) => {
                  const d = Disease[key];
                  return (
                    <motion.div
                      key={key}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.1, duration: 0.6 }}
                    >
                      <Link to={`/predict?disease=${key}`} style={styles.moduleCard}>
                        <img src={d.image} alt={d.label} style={styles.moduleImg} />
                        <div style={styles.moduleOverlay} />
                        <div style={styles.moduleTag}>{d.time}</div>
                        <div style={styles.moduleContent}>
                          <span style={{ ...styles.moduleIndicator, color: d.color }}>●</span>
                          <h3 style={styles.moduleTitle}>{d.label}</h3>
                          <span style={styles.moduleMeta}>{d.params} clinical variables</span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            </section>
          </div>

          {/* Right Area: Sidebar panel for stats & history list */}
          <div style={styles.sideCol}>
            {/* Health indicators counter */}
            {totalCount > 0 && (
              <section style={styles.sidebarSection}>
                <h2 style={styles.sectionLabel}>YOUR SUMMARY</h2>
                <div style={styles.summaryCard} className="glassmorphism">
                  <div style={styles.summaryItem}>
                    <span style={{ ...styles.summaryNum, color: 'var(--danger)' }}>{highRiskCount}</span>
                    <span style={styles.summaryLabel}>High Risk</span>
                    <span style={styles.summarySub}>assessments</span>
                  </div>
                  <div style={styles.summaryDivider} />
                  <div style={styles.summaryItem}>
                    <span style={{ ...styles.summaryNum, color: 'var(--success)' }}>{lowRiskCount}</span>
                    <span style={styles.summaryLabel}>Low Risk</span>
                    <span style={styles.summarySub}>assessments</span>
                  </div>
                  <div style={styles.summaryDivider} />
                  <div style={styles.summaryItem}>
                    <span style={{ ...styles.summaryNum, color: 'var(--text-accent)' }}>{totalCount}</span>
                    <span style={styles.summaryLabel}>Total</span>
                    <span style={styles.summarySub}>screenings</span>
                  </div>
                </div>
              </section>
            )}

            {/* Recent Assessments list */}
            <section style={styles.sidebarSection}>
              <div style={styles.sidebarHeader}>
                <h2 style={styles.sectionLabel}>RECENT SCANS</h2>
                {recentPredictions.length > 0 && (
                  <Link to="/history" style={styles.seeAll}>View all</Link>
                )}
              </div>

              {isLoading && recentPredictions.length === 0 ? (
                <div style={styles.loadingWrapper}>Loading scans history...</div>
              ) : recentPredictions.length === 0 ? (
                <div style={styles.emptyCard} className="glassmorphism">
                  <Activity size={32} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                  <h3 style={styles.emptyTitle}>No scans recorded</h3>
                  <p style={styles.emptySub}>Run a new assessment to see diagnostic results here.</p>
                  <Link to="/predict" style={styles.emptyBtn}>New Scan</Link>
                </div>
              ) : (
                <div style={styles.recentList}>
                  {recentPredictions.map((p, idx) => {
                    const d = Disease[p.disease as DiseaseKey];
                    const isPositive = p.result === 'positive';
                    return (
                      <motion.div
                        key={p.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <Link to={`/result/${p.id}`} style={styles.recentCard} className="glassmorphism">
                          <div style={{ ...styles.cardAccentLine, backgroundColor: d?.color || 'var(--text-accent)' }} />
                          <div style={styles.cardInfo}>
                            <h4 style={styles.cardDisease}>{d?.label || p.disease}</h4>
                            <span style={styles.cardDate}>
                              {p.created_at ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Recent'}
                            </span>
                          </div>
                          <div style={styles.cardRiskCol}>
                            <span style={{
                              ...styles.cardRiskPill,
                              color: isPositive ? 'var(--danger)' : 'var(--success)',
                              background: isPositive ? 'rgba(192, 57, 43, 0.1)' : 'rgba(39, 174, 96, 0.1)'
                            }}>
                              {isPositive ? 'HIGH' : 'LOW'}
                            </span>
                            <span style={styles.cardProb}>{Math.round(p.probability)}%</span>
                          </div>
                          <ChevronRight size={14} color="var(--text-tertiary)" />
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </section>
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
    gap: '3rem',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '2.5rem',
  },
  tag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-accent)',
    letterSpacing: '3px',
    textTransform: 'uppercase',
  },
  greeting: {
    fontFamily: 'var(--font-display)',
    fontSize: '3.5rem',
    fontWeight: '300',
    lineHeight: '1.1',
    letterSpacing: '-1px',
    marginTop: '0.5rem',
  },
  avatarDot: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'var(--surface-highlight)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-accent)',
    fontSize: '1.5rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'default',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '3.5rem',
    alignItems: 'flex-start',
  },
  mainCol: {
    gridColumn: 'span 2',
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  sideCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '3rem',
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
  },
  quickGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: '1rem',
  },
  quickCard: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    padding: '1.5rem',
    borderRadius: 'var(--radius-xl)',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
    textDecoration: 'none',
    transition: 'var(--transition-smooth)',
    cursor: 'pointer',
    '&:hover': {
      borderColor: 'var(--border-strong)',
      transform: 'translateY(-2px)',
    },
  } as any,
  quickIconWrap: {
    width: '36px',
    height: '36px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface-highlight)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickTitle: {
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: '600',
  },
  quickSub: {
    color: 'var(--text-tertiary)',
    fontSize: '0.75rem',
    lineHeight: '1.4',
  },
  moduleGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  moduleCard: {
    position: 'relative',
    height: '180px',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    padding: '1.5rem',
    textDecoration: 'none',
    border: '1px solid var(--border-subtle)',
    cursor: 'pointer',
  },
  moduleImg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
    zIndex: 1,
  },
  moduleOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, var(--bg-secondary) 15%, transparent 100%)',
    zIndex: 2,
  },
  moduleTag: {
    position: 'absolute',
    top: '12px',
    left: '12px',
    background: 'rgba(28, 28, 26, 0.8)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-accent)',
    fontSize: '0.6875rem',
    fontFamily: 'var(--font-mono)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    zIndex: 3,
    letterSpacing: '0.5px',
  },
  moduleContent: {
    position: 'relative',
    zIndex: 3,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
  },
  moduleIndicator: {
    fontSize: '0.625rem',
    marginBottom: '2px',
  },
  moduleTitle: {
    color: 'var(--text-primary)',
    fontSize: '1.2rem',
    fontWeight: '600',
    fontFamily: 'var(--font-display)',
  },
  moduleMeta: {
    color: 'var(--text-tertiary)',
    fontSize: '0.6875rem',
    fontFamily: 'var(--font-mono)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  sidebarSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  sidebarHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  seeAll: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-accent)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    textDecoration: 'none',
  },
  summaryCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  summaryItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  summaryNum: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    fontWeight: '300',
    lineHeight: 1,
  },
  summaryLabel: {
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontWeight: '600',
    marginTop: '6px',
  },
  summarySub: {
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
    letterSpacing: '0.3px',
    marginTop: '2px',
  },
  summaryDivider: {
    width: '1px',
    height: '40px',
    backgroundColor: 'var(--border-subtle)',
  },
  loadingWrapper: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    fontFamily: 'var(--font-mono)',
    textAlign: 'center',
    padding: '2rem 0',
  },
  emptyCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: '1.125rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
    marginBottom: '0.5rem',
  },
  emptySub: {
    color: 'var(--text-tertiary)',
    fontSize: '0.8125rem',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
  },
  emptyBtn: {
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    fontWeight: '600',
    fontSize: '0.8125rem',
    padding: '0.5rem 1.5rem',
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
  },
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  recentCard: {
    position: 'relative',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.25rem 1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textDecoration: 'none',
    overflow: 'hidden',
  },
  cardAccentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '3px',
    opacity: 0.8,
  },
  cardInfo: {
    flex: 1,
  },
  cardDisease: {
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
    fontWeight: '500',
    marginBottom: '2px',
  },
  cardDate: {
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
  },
  cardRiskCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    marginRight: '0.25rem',
  },
  cardRiskPill: {
    fontSize: '0.625rem',
    fontFamily: 'var(--font-mono)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  cardProb: {
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
  },
};
export default Dashboard;
