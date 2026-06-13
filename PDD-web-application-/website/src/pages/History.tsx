import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { usePredictionStore } from '../store/predictionStore';
import { Disease, type DiseaseKey } from '../utils/theme';
import { RiskTrendChart } from '../components/charts/RiskTrendChart';
import { Activity, ArrowLeft, Calendar, BarChart2, ArrowRight, ArrowUp, ArrowDown, Minus } from 'lucide-react';

interface DataPoint {
  date: string;
  probability: number;
}

export const History: React.FC = () => {
  const { history, fetchHistory, isLoading } = usePredictionStore();
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const trendsByDisease: Record<string, DataPoint[]> = {};
  // Sort history chronologically (oldest to newest) for line charts
  [...history].reverse().forEach((p) => {
    if (!trendsByDisease[p.disease]) trendsByDisease[p.disease] = [];
    trendsByDisease[p.disease].push({
      date: p.created_at
        ? new Date(p.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
        : 'N/A',
      probability: p.probability,
    });
  });

  const trendEntries = Object.entries(trendsByDisease).filter(([, pts]) => pts.length >= 2);

  const filteredHistory = filter === 'all' 
    ? history 
    : history.filter(p => p.disease === filter);

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Navigation back link */}
        <Link to="/dashboard" style={styles.backLink}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Dashboard
        </Link>

        {/* Page Header */}
        <div style={styles.header}>
          <span style={styles.tag}>ANALYTICS & ARCHIVE</span>
          <h1 style={styles.title}>History & Risk Trends</h1>
          <p style={styles.subtitle}>
            Monitor your screening archives and trace risk indices fluctuations over time to evaluate health improvements.
          </p>
        </div>

        {/* Dashboard Grid */}
        <div style={styles.grid}>
          {/* Left Side: Scan History List */}
          <div style={styles.listCol}>
            <div style={styles.listHeader}>
              <h2 style={styles.sectionLabel}>PREDICTIONS LOGS</h2>
              
              {/* Category selector */}
              <select 
                value={filter} 
                onChange={(e) => setFilter(e.target.value)}
                style={styles.filterSelect}
              >
                <option value="all">All Conditions</option>
                {(Object.keys(Disease) as DiseaseKey[]).map(key => (
                  <option key={key} value={key}>{Disease[key].label}</option>
                ))}
              </select>
            </div>

            {isLoading && history.length === 0 ? (
              <div style={styles.infoWrapper}>Fetching records...</div>
            ) : filteredHistory.length === 0 ? (
              <div style={styles.emptyCard} className="glassmorphism">
                <Calendar size={36} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                <h3 style={styles.emptyTitle}>No matching reports found</h3>
                <p style={styles.emptySub}>
                  {filter === 'all' 
                    ? 'No diagnostic records are logged on this profile yet.' 
                    : `No screening scans are logged for ${Disease[filter as DiseaseKey]?.label}.`}
                </p>
                <Link to="/predict" style={styles.btnAccent}>Analyze Report</Link>
              </div>
            ) : (
              <div style={styles.recordsList}>
                {filteredHistory.map((item, idx) => {
                  const info = Disease[item.disease as DiseaseKey];
                  const isPositive = item.result === 'positive';
                  const riskColor = isPositive ? 'var(--danger)' : 'var(--success)';
                  const dateStr = item.created_at
                    ? new Date(item.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })
                    : 'Recent';

                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <Link to={`/result/${item.id}`} style={styles.historyRow} className="glassmorphism">
                        <div style={{ ...styles.colorTag, backgroundColor: info?.color || 'var(--text-accent)' }} />
                        <div style={styles.rowInfo}>
                          <h4 style={styles.rowDisease}>{info?.label || item.disease}</h4>
                          <span style={styles.rowDate}>{dateStr}</span>
                        </div>
                        <div style={styles.rowRisk}>
                          <span style={{ 
                            ...styles.riskBadge,
                            color: riskColor,
                            background: isPositive ? 'rgba(192, 57, 43, 0.1)' : 'rgba(39, 174, 96, 0.1)' 
                          }}>
                            {item.result.toUpperCase()}
                          </span>
                          <span style={styles.riskProb}>{Math.round(item.probability)}% risk</span>
                        </div>
                        <ArrowRight size={14} color="var(--text-tertiary)" style={{ marginLeft: '1rem' }} />
                      </Link>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Side: Longitudinal Trends */}
          <div style={styles.trendsCol}>
            <h2 style={styles.sectionLabel}>LONGITUDINAL TRENDS</h2>
            
            {trendEntries.length === 0 ? (
              <div style={styles.emptyCard} className="glassmorphism">
                <BarChart2 size={36} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                <h3 style={styles.emptyTitle}>Insufficent data points</h3>
                <p style={styles.emptySub}>
                  You need to record at least two predictions for a specific disease to model fluctuations and trace line graph risk trends.
                </p>
              </div>
            ) : (
              <div style={styles.trendsList}>
                {trendEntries.map(([disease, points]) => {
                  const d = Disease[disease as DiseaseKey];
                  const color = d?.color || 'var(--text-accent)';
                  const latest = points[points.length - 1];
                  const first = points[0];
                  const delta = latest.probability - first.probability;
                  
                  return (
                    <div key={disease} style={styles.trendCard} className="glassmorphism">
                      <div style={styles.trendCardHeader}>
                        <div>
                          <div style={styles.trendDiseaseLabel}>
                            <Activity size={14} color={color} style={{ marginRight: '6px' }} />
                            <h3 style={styles.trendDiseaseName}>{d?.label || disease}</h3>
                          </div>
                          <span style={styles.trendPointCount}>{points.length} assessments recorded</span>
                        </div>

                        {/* Delta percentage indicator */}
                        <div style={styles.deltaBox}>
                          <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            color: delta > 0 ? 'var(--danger)' : delta < 0 ? 'var(--success)' : 'var(--text-tertiary)',
                          }}>
                            {delta > 0 ? <ArrowUp size={14} /> : delta < 0 ? <ArrowDown size={14} /> : <Minus size={14} />}
                            <span style={styles.deltaValue}>{Math.abs(delta).toFixed(1)}%</span>
                          </div>
                          <span style={styles.deltaLabel}>vs initial</span>
                        </div>
                      </div>

                      {/* Line chart widget */}
                      <RiskTrendChart data={points} color={color} />

                      {/* Status indicator banner */}
                      <div style={{
                        ...styles.trendStatusBadge,
                        background: delta > 5 ? 'rgba(192, 57, 43, 0.08)' : delta < -5 ? 'rgba(39, 174, 96, 0.08)' : 'var(--surface-highlight)',
                        borderColor: delta > 5 ? 'rgba(192, 57, 43, 0.2)' : delta < -5 ? 'rgba(39, 174, 96, 0.2)' : 'var(--border-subtle)',
                        color: delta > 5 ? 'var(--danger)' : delta < -5 ? 'var(--success)' : 'var(--text-secondary)'
                      }}>
                        <span style={styles.trendStatusText}>
                          {delta > 5 
                            ? 'Risk indicators rising — further clinical follow-up suggested.' 
                            : delta < -5 
                            ? 'Risk indicators decreasing — metabolic parameters improving.' 
                            : 'Risk indicators stabilized across assessments.'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
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
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    maxWidth: '650px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '3.5rem',
    alignItems: 'flex-start',
  },
  listCol: {
    gridColumn: 'span 1',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  trendsCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  listHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'baseline',
  },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  filterSelect: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    padding: '0.4rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.8125rem',
    outline: 'none',
  },
  infoWrapper: {
    color: 'var(--text-secondary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8125rem',
    textAlign: 'center',
    padding: '3rem 0',
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
    maxWidth: '260px',
  },
  btnAccent: {
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    fontWeight: '600',
    fontSize: '0.8125rem',
    padding: '0.5rem 1.5rem',
    borderRadius: 'var(--radius-full)',
    textDecoration: 'none',
  },
  recordsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  historyRow: {
    position: 'relative',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem 1.25rem 1rem 1.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    textDecoration: 'none',
    overflow: 'hidden',
  },
  colorTag: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '3px',
    opacity: 0.8,
  },
  rowInfo: {
    flex: 1,
  },
  rowDisease: {
    color: 'var(--text-primary)',
    fontSize: '0.9375rem',
    fontWeight: '500',
    marginBottom: '2px',
  },
  rowDate: {
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
  },
  rowRisk: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
  },
  riskBadge: {
    fontSize: '0.625rem',
    fontFamily: 'var(--font-mono)',
    padding: '2px 8px',
    borderRadius: 'var(--radius-sm)',
    fontWeight: 'bold',
    letterSpacing: '0.5px',
  },
  riskProb: {
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
  },
  trendsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  trendCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  trendCardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  trendDiseaseLabel: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '2px',
  },
  trendDiseaseName: {
    color: 'var(--text-primary)',
    fontSize: '1.125rem',
    fontWeight: '600',
  },
  trendPointCount: {
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
  },
  deltaBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '2px',
  },
  deltaValue: {
    fontSize: '1.25rem',
    fontWeight: '600',
    lineHeight: '1',
    marginLeft: '2px',
  },
  deltaLabel: {
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.625rem',
  },
  trendStatusBadge: {
    padding: '0.75rem 1rem',
    borderRadius: 'var(--radius-md)',
    border: '1px solid',
  },
  trendStatusText: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    lineHeight: '1.4',
  },
};
export default History;
