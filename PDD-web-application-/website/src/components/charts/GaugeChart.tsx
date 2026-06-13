import React, { useEffect, useState } from 'react';
import { theme } from '../../utils/theme';

interface GaugeChartProps {
  probability: number; // 0-100
  size?: number;
  strokeWidth?: number;
}

export const GaugeChart: React.FC<GaugeChartProps> = ({
  probability,
  size = 220,
  strokeWidth = 18,
}) => {
  const [offset, setOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2;
  const cy = size / 2;

  useEffect(() => {
    // Short delay to trigger the animation on mount
    const timer = setTimeout(() => {
      const progress = probability / 100;
      setOffset(circumference * (1 - progress));
    }, 100);
    return () => clearTimeout(timer);
  }, [probability, circumference]);

  const color =
    probability >= 70
      ? theme.semantic.danger
      : probability >= 40
      ? theme.semantic.warning
      : theme.semantic.success;

  return (
    <div style={{ position: 'relative', width: size, height: size, margin: '0 auto' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor={color} stopOpacity="0.6" />
          </linearGradient>
        </defs>
        {/* Track circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="var(--border-default)"
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          stroke="url(#gaugeGrad)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{
            transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        />
      </svg>
      {/* Absolute overlay labels */}
      <div style={styles.labelWrapper}>
        <div style={styles.percentageText}>{Math.round(probability)}%</div>
        <div style={styles.subtitleText}>RISK PROBABILITY</div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  labelWrapper: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    pointerEvents: 'none',
  },
  percentageText: {
    fontSize: '2.5rem',
    fontFamily: 'var(--font-display)',
    color: 'var(--text-primary)',
    fontWeight: '300',
    lineHeight: 1,
    marginBottom: '4px',
  },
  subtitleText: {
    fontSize: '0.6875rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-tertiary)',
    letterSpacing: '1.5px',
  },
};
