import React from 'react';
import { motion } from 'framer-motion';

interface DataPoint {
  date: string;
  probability: number;
}

interface RiskTrendChartProps {
  data: DataPoint[];
  color: string;
}

export const RiskTrendChart: React.FC<RiskTrendChartProps> = ({ data, color }) => {
  if (data.length < 2) return null;

  const width = 500;
  const height = 150;
  const paddingX = 40;
  const paddingY = 20;

  const maxY = 100;
  const minY = 0;

  const points = data.map((d, i) => {
    const x = paddingX + (i / (data.length - 1)) * (width - paddingX * 2);
    const y = paddingY + (1 - (d.probability - minY) / (maxY - minY)) * (height - paddingY * 2);
    return { x, y, prob: d.probability, date: d.date };
  });

  // Construct path string for line
  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  // Construct path for gradient fill under the line
  const fillD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div style={styles.container}>
      <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%">
        <defs>
          <linearGradient id={`grad-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.3" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[25, 50, 75].map((v) => {
          const y = paddingY + (1 - v / 100) * (height - paddingY * 2);
          return (
            <line
              key={v}
              x1={paddingX}
              y1={y}
              x2={width - paddingX}
              y2={y}
              stroke="var(--border-subtle)"
              strokeWidth={0.5}
              strokeDasharray="4 4"
            />
          );
        })}

        {/* Shaded Area */}
        <path d={fillD} fill={`url(#grad-${color})`} />

        {/* Trend Line */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={color}
          strokeWidth={2}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, ease: 'easeOut' }}
        />

        {/* Data points */}
        {points.map((pt, i) => (
          <g key={i}>
            <circle
              cx={pt.x}
              cy={pt.y}
              r={4}
              fill={color}
              stroke="var(--bg-secondary)"
              strokeWidth={1.5}
            />
            {/* Tooltip percentage text */}
            <text
              x={pt.x}
              y={pt.y - 10}
              textAnchor="middle"
              fill={color}
              fontSize={9}
              fontFamily="var(--font-mono)"
            >
              {Math.round(pt.prob)}%
            </text>
            {/* Axis date label */}
            <text
              x={pt.x}
              y={height - 2}
              textAnchor="middle"
              fill="var(--text-tertiary)"
              fontSize={8}
              fontFamily="var(--font-mono)"
            >
              {pt.date}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    width: '100%',
    height: '180px',
    background: 'var(--bg-tertiary)',
    borderRadius: 'var(--radius-lg)',
    padding: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};
