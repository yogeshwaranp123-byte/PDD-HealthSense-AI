import React from 'react';
import { motion } from 'framer-motion';

interface ShapBarChartProps {
  data: Record<string, number>; // feature -> percentage
  title?: string;
}

export const ShapBarChart: React.FC<ShapBarChartProps> = ({ data, title }) => {
  const entries = Object.entries(data).sort(([, a], [, b]) => b - a);
  const maxVal = Math.max(...entries.map(([, v]) => v), 1);

  return (
    <div style={styles.container}>
      {title && <h5 style={styles.title}>{title}</h5>}
      <div style={styles.chart}>
        {entries.map(([feature, value], i) => {
          const label = feature.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
          // Colors matching theme accent gradients
          const color =
            i === 0 ? 'var(--text-accent)' : i === 1 ? '#D4C7AD' : '#8BA99B';

          return (
            <div key={feature} style={styles.row}>
              {/* Feature label */}
              <div style={styles.label} title={label}>
                {label}
              </div>

              {/* Progress bar track */}
              <div style={styles.barTrack}>
                <motion.div
                  style={{
                    height: '100%',
                    borderRadius: '3px',
                    backgroundColor: color,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${(value / maxVal) * 100}%` }}
                  transition={{ duration: 1, ease: [0.16, 1, 0.3, 1], delay: i * 0.1 }}
                />
              </div>

              {/* Percentage number */}
              <div style={styles.value}>
                {value.toFixed(1)}%
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    padding: '0.5rem 0',
    width: '100%',
  },
  title: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    marginBottom: '1rem',
    textTransform: 'uppercase',
    letterSpacing: '1.5px',
  },
  chart: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.875rem',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  label: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-secondary)',
    width: '130px',
    marginRight: '1rem',
    letterSpacing: '0.2px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  barTrack: {
    flex: 1,
    height: '6px',
    backgroundColor: 'var(--border-subtle)',
    borderRadius: '3px',
    overflow: 'hidden',
    marginRight: '1rem',
  },
  value: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-accent)',
    width: '42px',
    textAlign: 'right',
  },
};
export default ShapBarChart;
