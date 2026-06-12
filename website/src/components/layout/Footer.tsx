import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShieldAlert } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={styles.footer}>
      <div style={styles.container}>
        {/* Left Column: Brand */}
        <div style={styles.colBrand}>
          <div style={styles.logoRow}>
            <span style={styles.logoLetter}>H</span>
            <span style={styles.logoSub}>EALTHSENSE</span>
          </div>
          <p style={styles.brandDesc}>
            Advanced healthcare intelligence utilizing multimodal neural analysis to predict clinical indicators and map metabolic pathways.
          </p>
          <div style={styles.heartRow}>
            <span>Made for clinicians & patients with</span>
            <Heart size={12} color="var(--text-accent)" style={{ margin: '0 4px', fill: 'var(--text-accent)' }} />
          </div>
        </div>

        {/* Middle Column: Disease Categories */}
        <div style={styles.colLinks}>
          <h4 style={styles.heading}>Target Conditions</h4>
          <ul style={styles.list}>
            <li><Link to="/predict?disease=diabetes" style={styles.link}>Type 2 Diabetes</Link></li>
            <li><Link to="/predict?disease=kidney" style={styles.link}>Chronic Kidney Disease</Link></li>
            <li><Link to="/predict?disease=parkinsons" style={styles.link}>Parkinson's Disease</Link></li>
            <li><Link to="/predict?disease=lung_cancer" style={styles.link}>Lung Cancer Risk</Link></li>
            <li><Link to="/predict?disease=thyroid" style={styles.link}>Thyroid Panel</Link></li>
          </ul>
        </div>

        {/* Right Column: Platform Services */}
        <div style={styles.colLinks}>
          <h4 style={styles.heading}>Services</h4>
          <ul style={styles.list}>
            <li><Link to="/dashboard" style={styles.link}>Patient Dashboard</Link></li>
            <li><Link to="/predict" style={styles.link}>Diagnostic Upload</Link></li>
            <li><Link to="/chat" style={styles.link}>Ask AI Assistant</Link></li>
            <li><Link to="/hospitals" style={styles.link}>Clinic Locator</Link></li>
            <li><Link to="/profile" style={styles.link}>Health Indicators</Link></li>
          </ul>
        </div>
      </div>

      {/* Clinical Health Disclaimer Bar */}
      <div style={styles.disclaimerContainer}>
        <div style={styles.disclaimerContent}>
          <ShieldAlert size={16} color="var(--danger)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <p style={styles.disclaimerText}>
            <strong>Clinical Disclaimer:</strong> HealthSense AI screening tools evaluate risk probability indicators using diagnostic laboratory report uploads. Results represent statistical estimates of metabolic features and do <strong>not</strong> constitute a clinical diagnosis, prescription, or therapeutic referral. Always consult a licensed medical professional to interpret test values.
          </p>
        </div>
      </div>

      {/* Bottom copyright line */}
      <div style={styles.bottomBar}>
        <div style={styles.bottomContainer}>
          <p style={styles.copyright}>&copy; {new Date().getFullYear()} HealthSense AI. All rights reserved.</p>
          <div style={styles.legalLinks}>
            <a href="#privacy" style={styles.legalLink}>Privacy Policy</a>
            <a href="#terms" style={styles.legalLink}>Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

const styles: Record<string, React.CSSProperties> = {
  footer: {
    background: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '5rem',
    marginTop: 'auto',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem 3rem 2rem',
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '3rem',
  },
  colBrand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'baseline',
  },
  logoLetter: {
    fontFamily: 'var(--font-display)',
    fontSize: '2rem',
    fontWeight: 'bold',
    color: '#FFFFFF',
    letterSpacing: '-2px',
    lineHeight: 1,
  },
  logoSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--text-accent)',
    letterSpacing: '4px',
    marginLeft: '6px',
  },
  brandDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    lineHeight: '1.6',
    maxWidth: '320px',
  },
  heartRow: {
    display: 'flex',
    alignItems: 'center',
    color: 'var(--text-tertiary)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    marginTop: '0.5rem',
  },
  colLinks: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  heading: {
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    letterSpacing: '2px',
    textTransform: 'uppercase',
  },
  list: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  link: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    transition: 'var(--transition-fast)',
    textDecoration: 'none',
  },
  disclaimerContainer: {
    borderTop: '1px solid var(--border-subtle)',
    borderBottom: '1px solid var(--border-subtle)',
    background: 'rgba(192, 57, 43, 0.03)',
    padding: '2rem',
  },
  disclaimerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-start',
  },
  disclaimerText: {
    fontSize: '0.75rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
  },
  bottomBar: {
    padding: '2rem 0',
  },
  bottomContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '1rem',
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
  },
  copyright: {
    letterSpacing: '0.3px',
  },
  legalLinks: {
    display: 'flex',
    gap: '1.5rem',
  },
  legalLink: {
    color: 'var(--text-tertiary)',
    textDecoration: 'none',
  },
};
