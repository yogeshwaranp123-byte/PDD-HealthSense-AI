import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Activity, Cpu, BarChart2, MessageSquare, MapPin, ArrowRight, CheckCircle } from 'lucide-react';
import { Disease, type DiseaseKey } from '../utils/theme';

export const Landing: React.FC = () => {
  const [selectedDisease, setSelectedDisease] = useState<DiseaseKey>('diabetes');
  const dDetails = Disease[selectedDisease];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15 }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] as any }
    }
  };

  return (
    <div style={styles.page}>
      {/* ── HERO SECTION ── */}
      <section style={styles.heroSection}>
        {/* Background Image with slow Ken Burns effect zoom */}
        <div style={styles.heroBg} />
        <div style={styles.heroScrim} />

        <div style={styles.heroContentContainer}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            style={styles.heroTextBox}
          >
            <span style={styles.heroTag}>AI-POWERED CLINICAL INTELLIGENCE</span>
            <h1 style={styles.heroTitle}>
              Clinical precision.<br />
              <span className="text-gradient">Instantly explained.</span>
            </h1>
            <p style={styles.heroSubtitle}>
              Evaluate disease risk indicators from laboratory reports in seconds. Driven by medical-grade machine learning models and explained through SHAP explainability.
            </p>
            <div style={styles.heroActions}>
              <Link to="/register" style={styles.primaryBtn}>
                Begin Assessment <ArrowRight size={16} style={{ marginLeft: '8px' }} />
              </Link>
              <Link to="/login" style={styles.outlineBtn}>
                Access Portal
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTag}>CAPABILITIES</span>
          <h2 style={styles.sectionTitle}>Precision diagnostics at your fingertips</h2>
          <div style={styles.headerLine} />
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          style={styles.featuresGrid}
        >
          {/* Card 1 */}
          <motion.div variants={itemVariants} style={styles.featureCard} className="glassmorphism">
            <div style={styles.cardIconWrap}>
              <Cpu size={24} color="var(--text-accent)" />
            </div>
            <h3 style={styles.cardTitle}>Multimodal AI Screening</h3>
            <p style={styles.cardDesc}>
              Upload PDFs or photos of lab papers. Gemini extracts markers, and five trained algorithms calculate risk percentage indexes.
            </p>
          </motion.div>

          {/* Card 2 */}
          <motion.div variants={itemVariants} style={styles.featureCard} className="glassmorphism">
            <div style={styles.cardIconWrap}>
              <BarChart2 size={24} color="var(--text-accent)" />
            </div>
            <h3 style={styles.cardTitle}>SHAP Explainability</h3>
            <p style={styles.cardDesc}>
              No black boxes. Understand every risk score through horizontal contribution charts depicting exactly which biomarkers drove the decision.
            </p>
          </motion.div>

          {/* Card 3 */}
          <motion.div variants={itemVariants} style={styles.featureCard} className="glassmorphism">
            <div style={styles.cardIconWrap}>
              <MessageSquare size={24} color="var(--text-accent)" />
            </div>
            <h3 style={styles.cardTitle}>Interactive Health Assistant</h3>
            <p style={styles.cardDesc}>
              Chat with our clinical-grade AI assistant. Ask follow-up questions, decode medical jargon, and clarify diagnostic markers instantly.
            </p>
          </motion.div>

          {/* Card 4 */}
          <motion.div variants={itemVariants} style={styles.featureCard} className="glassmorphism">
            <div style={styles.cardIconWrap}>
              <MapPin size={24} color="var(--text-accent)" />
            </div>
            <h3 style={styles.cardTitle}>Nearby Clinics Locator</h3>
            <p style={styles.cardDesc}>
              Detect user location via coordinates and reverse-geocode to list nearest diagnostic laboratories, clinics, and emergency hospitals.
            </p>
          </motion.div>
        </motion.div>
      </section>

      {/* ── DISEASE EXPLORER CAROUSEL ── */}
      <section id="disease-modules" style={styles.darkSection}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTag}>DISEASE MODULES</span>
          <h2 style={styles.sectionTitle}>Five clinical screening models</h2>
          <div style={styles.headerLine} />
        </div>

        <div style={styles.carouselContainer}>
          {/* Disease tabs */}
          <div style={styles.carouselTabs}>
            {(Object.keys(Disease) as DiseaseKey[]).map((key) => {
              const active = selectedDisease === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDisease(key)}
                  style={{
                    ...styles.tabBtn,
                    color: active ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    borderColor: active ? Disease[key].color : 'transparent',
                    background: active ? 'var(--bg-tertiary)' : 'transparent',
                  }}
                >
                  {Disease[key].label}
                </button>
              );
            })}
          </div>

          {/* Details Card */}
          <motion.div
            key={selectedDisease}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            style={styles.detailsCard}
            className="glassmorphism"
          >
            <div style={styles.detailsGrid}>
              <div style={styles.detailsImageCol}>
                <img src={dDetails.image} alt={dDetails.label} style={styles.detailsImage} />
                <div style={{ ...styles.colorBar, backgroundColor: dDetails.color }} />
              </div>
              <div style={styles.detailsTextCol}>
                <div style={styles.detailsHeader}>
                  <Activity size={18} color={dDetails.color} />
                  <h3 style={{ ...styles.detailsTitle, color: dDetails.color }}>{dDetails.label} Module</h3>
                </div>
                <p style={styles.detailsDesc}>{dDetails.description}</p>

                <div style={styles.detailsSubColumns}>
                  <div>
                    <h4 style={styles.subColHeading}>Key Markers Checked</h4>
                    <ul style={styles.checkList}>
                      {dDetails.keyMarkers.map((item, idx) => (
                        <li key={idx} style={styles.checkItem}>
                          <CheckCircle size={12} color={dDetails.color} style={{ marginRight: '6px' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h4 style={styles.subColHeading}>Common Indicators</h4>
                    <ul style={styles.checkList}>
                      {dDetails.symptoms.map((item, idx) => (
                        <li key={idx} style={styles.checkItem}>
                          <CheckCircle size={12} color={dDetails.color} style={{ marginRight: '6px' }} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <Link to="/predict" style={{ ...styles.detailsAction, color: dDetails.color }}>
                  Run Assessment <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── DIAGNOSTIC PIPELINE TIMELINE ── */}
      <section id="workflow" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionTag}>PROCESS WORKFLOW</span>
          <h2 style={styles.sectionTitle}>How the clinical scan pipeline operates</h2>
          <div style={styles.headerLine} />
        </div>

        <div style={styles.timelineContainer}>
          {[
            { step: '01', title: 'Upload Lab Report', desc: 'Securely snap or attach your physical diagnostic reports. Files are encrypted and uploaded.' },
            { step: '02', title: 'Feature Extraction', desc: 'Gemini OCR model identifies variables (Glucose, Insulin, Creatinine, TSH, Jitter) and feeds clean vectors to ML algorithms.' },
            { step: '03', title: 'Statistical Prediction', desc: 'Five neural and linear models (XGBoost, SVM, Random Forest) compute probability risks.' },
            { step: '04', title: 'SHAP Explainability', desc: 'The explainability wrapper calculates contribution coefficients. Outputs top 3 biomarkers and generates a downloadable PDF.' },
          ].map((item, idx) => (
            <div key={idx} style={styles.timelineStep}>
              <div style={styles.stepNumCircle}>
                <span style={styles.stepNumText}>{item.step}</span>
              </div>
              <h3 style={styles.stepTitle}>{item.title}</h3>
              <p style={styles.stepDesc}>{item.desc}</p>
              {idx < 3 && <div style={styles.timelineLine} />}
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaBg} />
        <div style={styles.ctaContent}>
          <h2 style={styles.ctaTitle}>Empower your medical analytics today</h2>
          <p style={styles.ctaText}>
            Join clinicians, doctors, and patients in utilizing explainable AI indicators. Free testing access is configured instantly.
          </p>
          <Link to="/register" style={styles.ctaBtn}>
            Get Started Free
          </Link>
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: {
    background: 'var(--bg-primary)',
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  },
  heroSection: {
    position: 'relative',
    height: '90vh',
    minHeight: '600px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=1600&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    animation: 'float 20s ease-in-out infinite alternate',
    transform: 'scale(1.05)',
  },
  heroScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to bottom, rgba(12,12,11,0.5) 0%, var(--bg-primary) 95%)',
  },
  heroContentContainer: {
    position: 'relative',
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    padding: '0 2rem',
    zIndex: 2,
    textAlign: 'center',
    display: 'flex',
    justifyContent: 'center',
  },
  heroTextBox: {
    maxWidth: '750px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  heroTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--text-accent)',
    letterSpacing: '3px',
    marginBottom: '1.5rem',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: 'clamp(2.5rem, 5vw, 4.5rem)',
    fontFamily: 'var(--font-display)',
    fontWeight: '300',
    color: '#FFFFFF',
    lineHeight: 1.15,
    marginBottom: '1.5rem',
    letterSpacing: '-1.5px',
  },
  heroSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: 'clamp(0.95rem, 2.5vw, 1.125rem)',
    lineHeight: '1.7',
    marginBottom: '2.5rem',
    maxWidth: '650px',
  },
  heroActions: {
    display: 'flex',
    gap: '1rem',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  primaryBtn: {
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    fontWeight: '600',
    padding: '0.875rem 2rem',
    borderRadius: 'var(--radius-full)',
    display: 'flex',
    alignItems: 'center',
    letterSpacing: '0.5px',
    transition: 'var(--transition-fast)',
  },
  outlineBtn: {
    border: '1px solid var(--border-strong)',
    color: 'var(--text-primary)',
    padding: '0.875rem 2rem',
    borderRadius: 'var(--radius-full)',
    transition: 'var(--transition-fast)',
    background: 'rgba(255, 255, 255, 0.02)',
  },
  section: {
    padding: '7rem 2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  darkSection: {
    padding: '7rem 2rem',
    background: 'var(--bg-secondary)',
    width: '100%',
    borderTop: '1px solid var(--border-subtle)',
    borderBottom: '1px solid var(--border-subtle)',
  },
  sectionHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    marginBottom: '4.5rem',
  },
  sectionTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-accent)',
    letterSpacing: '2px',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },
  sectionTitle: {
    fontSize: '2rem',
    color: 'var(--text-primary)',
    marginBottom: '1rem',
  },
  headerLine: {
    width: '40px',
    height: '1px',
    background: 'var(--text-accent)',
    marginTop: '0.5rem',
  },
  featuresGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
    gap: '1.5rem',
  },
  featureCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
    transition: 'var(--transition-smooth)',
    cursor: 'default',
    '&:hover': {
      transform: 'translateY(-5px)',
      borderColor: 'var(--border-strong)',
    },
  } as any,
  cardIconWrap: {
    width: '48px',
    height: '48px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface-highlight)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    color: 'var(--text-primary)',
    fontSize: '1.25rem',
    fontWeight: '500',
  },
  cardDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    lineHeight: '1.6',
  },
  carouselContainer: {
    maxWidth: '1000px',
    margin: '0 auto',
  },
  carouselTabs: {
    display: 'flex',
    justifyContent: 'center',
    gap: '0.5rem',
    marginBottom: '2.5rem',
    flexWrap: 'wrap',
  },
  tabBtn: {
    fontFamily: 'var(--font-body)',
    fontSize: '0.875rem',
    padding: '0.6rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid var(--border-default)',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  detailsCard: {
    borderRadius: 'var(--radius-xxl)',
    overflow: 'hidden',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
  },
  detailsImageCol: {
    position: 'relative',
    height: '100%',
    minHeight: '300px',
  },
  detailsImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    display: 'block',
  },
  colorBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: '4px',
    width: '100%',
  },
  detailsTextCol: {
    padding: '3rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  detailsHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.75rem',
  },
  detailsTitle: {
    fontSize: '1.5rem',
    fontFamily: 'var(--font-display)',
    fontWeight: 'bold',
  },
  detailsDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.925rem',
    lineHeight: '1.65',
  },
  detailsSubColumns: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1.5rem',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '1.5rem',
  },
  subColHeading: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '0.75rem',
  },
  checkList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  checkItem: {
    color: 'var(--text-secondary)',
    fontSize: '0.8125rem',
    display: 'flex',
    alignItems: 'center',
  },
  detailsAction: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.875rem',
    fontWeight: '600',
    marginTop: '0.5rem',
    textDecoration: 'none',
  },
  timelineContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '2.5rem',
    marginTop: '2rem',
  },
  timelineStep: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  stepNumCircle: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    border: '1px solid var(--border-default)',
    background: 'var(--bg-secondary)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.75rem',
    color: 'var(--text-accent)',
  },
  stepTitle: {
    fontSize: '1.125rem',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  stepDesc: {
    color: 'var(--text-secondary)',
    fontSize: '0.8125rem',
    lineHeight: '1.6',
  },
  timelineLine: {
    position: 'absolute',
    top: '20px',
    left: '40px',
    width: 'calc(100% - 20px)',
    height: '1px',
    background: 'var(--border-subtle)',
    zIndex: -1,
  },
  ctaSection: {
    position: 'relative',
    padding: '8rem 2rem',
    textAlign: 'center',
    overflow: 'hidden',
    borderTop: '1px solid var(--border-subtle)',
  },
  ctaBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("https://images.unsplash.com/photo-1551076805-e1869033e561?auto=format&fit=crop&w=1600&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.05,
  },
  ctaContent: {
    position: 'relative',
    maxWidth: '600px',
    margin: '0 auto',
    zIndex: 2,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '1.5rem',
  },
  ctaTitle: {
    fontSize: '2.5rem',
    fontFamily: 'var(--font-display)',
    color: 'var(--text-primary)',
  },
  ctaText: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    lineHeight: '1.6',
    marginBottom: '1rem',
  },
  ctaBtn: {
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    fontWeight: '600',
    padding: '1rem 2.5rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.875rem',
    letterSpacing: '0.5px',
    transition: 'var(--transition-fast)',
  },
};
export default Landing;
