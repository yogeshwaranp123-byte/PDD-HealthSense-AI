import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuthStore } from '../store/authStore';
import { Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

export const Register: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const { register, isLoading, error, isAuthenticated, clearError } = useAuthStore();
  
  const navigate = useNavigate();

  useEffect(() => {
    clearError();
  }, [clearError]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password) return;
    await register(name.trim(), email.trim(), password);
  };

  const isFormValid = name.trim() && email.trim() && password.length >= 6;

  return (
    <div style={styles.container}>
      {/* Visual column */}
      <div style={styles.visualCol} className="responsive-visual-col">
        <div style={styles.visualBg} />
        <div style={styles.visualScrim} />
        <div style={styles.visualContent}>
          <Link to="/" style={styles.backHomeLink}>
            <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Back to Home
          </Link>
          <div>
            <h1 style={styles.brandTitle}>HealthSense AI</h1>
            <p style={styles.brandSubtitle}>
              Sign up today and scan your clinical documents with advanced AI and explainability indicators.
            </p>
          </div>
        </div>
      </div>

      {/* Form column */}
      <div style={styles.formCol}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          style={styles.formCard}
        >
          <div style={styles.formHeader}>
            <h2 style={styles.title}>Create your account.</h2>
            <p style={styles.subtitle}>Start monitoring your health indicators with AI.</p>
          </div>

          {error && (
            <div style={styles.errorBanner}>
              <AlertCircle size={16} color="var(--danger)" style={{ marginRight: '8px', flexShrink: 0 }} />
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                placeholder="Dr. Jane Smith"
                value={name}
                onChange={(e) => setName(e.target.value)}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Email Address</label>
              <input
                type="email"
                placeholder="doctor@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                autoCapitalize="none"
                required
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <div style={styles.passwordWrapper}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={styles.inputPassword}
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={styles.showHideBtn}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || !isFormValid}
              style={{
                ...styles.submitBtn,
                opacity: isFormValid ? 1 : 0.6,
                cursor: isFormValid ? 'pointer' : 'not-allowed',
              }}
            >
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </button>
          </form>

          <div style={styles.formFooter}>
            <span>Already have an account? </span>
            <Link to="/login" style={styles.footerLink}>Sign in</Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    background: 'var(--bg-primary)',
  },
  visualCol: {
    position: 'relative',
    flex: '1.2',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '3rem',
    overflow: 'hidden',
    borderRight: '1px solid var(--border-subtle)',
  },
  visualBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=1200&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    filter: 'grayscale(30%)',
  },
  visualScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to right, rgba(12,12,11,0.2) 0%, var(--bg-primary) 100%)',
  },
  visualContent: {
    position: 'relative',
    zIndex: 2,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  backHomeLink: {
    color: 'var(--text-secondary)',
    fontSize: '0.8125rem',
    display: 'flex',
    alignItems: 'center',
    textDecoration: 'none',
    alignSelf: 'flex-start',
  },
  brandTitle: {
    fontFamily: 'var(--font-display)',
    fontSize: '2.5rem',
    color: '#FFFFFF',
    fontWeight: 'normal',
    marginBottom: '1rem',
  },
  brandSubtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.95rem',
    lineHeight: '1.6',
    maxWidth: '400px',
  },
  formCol: {
    flex: '1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  formCard: {
    maxWidth: '400px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '2rem',
  },
  formHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  title: {
    fontSize: '2.25rem',
    fontFamily: 'var(--font-display)',
    color: 'var(--text-primary)',
    fontWeight: 'normal',
    lineHeight: '1.2',
  },
  subtitle: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
  },
  errorBanner: {
    background: 'rgba(192, 57, 43, 0.1)',
    border: '1px solid var(--border-subtle)',
    borderLeft: '3px solid var(--danger)',
    padding: '0.875rem 1rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
  },
  errorText: {
    fontSize: '0.8125rem',
    color: 'var(--danger)',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    fontFamily: 'var(--font-mono)',
  },
  input: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    padding: '0.875rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'var(--transition-fast)',
    width: '100%',
    '&:focus': {
      borderColor: 'var(--text-accent)',
    },
  } as any,
  passwordWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
  },
  inputPassword: {
    background: 'var(--bg-secondary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    padding: '0.875rem 3rem 0.875rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    outline: 'none',
    transition: 'var(--transition-fast)',
    width: '100%',
  },
  showHideBtn: {
    position: 'absolute',
    right: '12px',
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    padding: '0.25rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitBtn: {
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    fontWeight: '600',
    padding: '0.875rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    fontSize: '0.875rem',
    marginTop: '0.5rem',
    transition: 'var(--transition-fast)',
  },
  formFooter: {
    textAlign: 'center',
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
  },
  footerLink: {
    color: 'var(--text-accent)',
    fontWeight: '600',
    textDecoration: 'none',
  },
};
export default Register;
