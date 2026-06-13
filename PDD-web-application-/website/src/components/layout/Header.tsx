import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { useUserStore } from '../../store/userStore';
import { Menu, X, User, LogOut, Activity, BarChart2, MessageSquare, MapPin } from 'lucide-react';

export const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuthStore();
  const { fetchProfile } = useUserStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchProfile();
    }
  }, [isAuthenticated, fetchProfile]);

  const handleLogout = async () => {
    await logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  const getLinkStyle = (path: string) => ({
    color: isActive(path) ? 'var(--text-accent)' : 'var(--text-secondary)',
    fontWeight: isActive(path) ? '600' : '400',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    padding: '0.5rem 1rem',
    borderRadius: 'var(--radius-md)',
    background: isActive(path) ? 'var(--surface-highlight)' : 'transparent',
    transition: 'var(--transition-fast)',
  });

  return (
    <header style={styles.header}>
      <div style={styles.container}>
        {/* Brand Logo */}
        <Link to="/" style={styles.logoRow}>
          <span style={styles.logoLetter}>H</span>
          <span style={styles.logoSub}>EALTHSENSE</span>
        </Link>

        {/* Desktop Navigation */}
        <nav style={styles.desktopNav}>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" style={getLinkStyle('/dashboard')}>Dashboard</Link>
              <Link to="/predict" style={getLinkStyle('/predict')}>New Scan</Link>
              <Link to="/history" style={getLinkStyle('/history')}>Trends & History</Link>
              <Link to="/chat" style={getLinkStyle('/chat')}>Ask AI</Link>
              <Link to="/hospitals" style={getLinkStyle('/hospitals')}>Hospitals</Link>
              <Link to="/profile" style={getLinkStyle('/profile')}>Profile</Link>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                <LogOut size={14} style={{ marginRight: '6px' }} />
                Logout
              </button>
            </>
          ) : (
            <>
              <a href="#features" style={styles.navLink}>Features</a>
              <a href="#disease-modules" style={styles.navLink}>Diseases</a>
              <a href="#workflow" style={styles.navLink}>Process</a>
              <Link to="/login" style={styles.loginBtn}>Sign In</Link>
              <Link to="/register" style={styles.signupBtn}>Get Started</Link>
            </>
          )}
        </nav>

        {/* Mobile menu toggle */}
        <div style={styles.mobileToggle}>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={styles.iconButton}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={styles.mobileDrawer}>
          <div style={styles.mobileDrawerContent}>
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>
                  <Activity size={16} style={{ marginRight: '10px' }} /> Dashboard
                </Link>
                <Link to="/predict" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>
                  <Activity size={16} style={{ marginRight: '10px' }} /> New Scan
                </Link>
                <Link to="/history" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>
                  <BarChart2 size={16} style={{ marginRight: '10px' }} /> Trends & History
                </Link>
                <Link to="/chat" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>
                  <MessageSquare size={16} style={{ marginRight: '10px' }} /> Ask AI
                </Link>
                <Link to="/hospitals" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>
                  <MapPin size={16} style={{ marginRight: '10px' }} /> Nearby Clinics
                </Link>
                <Link to="/profile" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>
                  <User size={16} style={{ marginRight: '10px' }} /> Health Profile
                </Link>
                <button onClick={handleLogout} style={styles.mobileLogoutLink}>
                  <LogOut size={16} style={{ marginRight: '10px' }} /> Logout
                </button>
              </>
            ) : (
              <>
                <a href="#features" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>Features</a>
                <a href="#disease-modules" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>Diseases</a>
                <a href="#workflow" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>Process</a>
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} style={styles.mobileLink}>Sign In</Link>
                <Link to="/register" onClick={() => setMobileMenuOpen(false)} style={styles.mobileSignupLink}>Get Started</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

const styles: Record<string, React.CSSProperties> = {
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 999,
    width: '100%',
    background: 'rgba(12, 12, 11, 0.75)',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    borderBottom: '1px solid var(--border-subtle)',
    transition: 'var(--transition-smooth)',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '1.25rem 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logoRow: {
    display: 'flex',
    alignItems: 'baseline',
    textDecoration: 'none',
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
  desktopNav: {
    display: 'none',
    alignItems: 'center',
    gap: '0.5rem',
  },
  navLink: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    padding: '0.5rem 1rem',
    transition: 'var(--transition-fast)',
  },
  loginBtn: {
    color: 'var(--text-primary)',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    padding: '0.5rem 1.25rem',
    marginRight: '0.5rem',
  },
  signupBtn: {
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    fontWeight: '600',
    fontSize: '0.875rem',
    letterSpacing: '0.05em',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    transition: 'var(--transition-fast)',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--border-default)',
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    padding: '0.4rem 1rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    marginLeft: '1rem',
    transition: 'var(--transition-fast)',
  },
  mobileToggle: {
    display: 'flex',
  },
  iconButton: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    padding: '0.25rem',
  },
  mobileDrawer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    width: '100%',
    background: 'var(--bg-secondary)',
    borderBottom: '1px solid var(--border-default)',
    padding: '1.5rem 2rem',
    boxShadow: '0 10px 20px rgba(0,0,0,0.5)',
  },
  mobileDrawerContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  mobileLink: {
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    letterSpacing: '0.05em',
    display: 'flex',
    alignItems: 'center',
    padding: '0.25rem 0',
  },
  mobileSignupLink: {
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    fontWeight: '600',
    fontSize: '1rem',
    padding: '0.75rem',
    borderRadius: 'var(--radius-md)',
    textAlign: 'center',
    letterSpacing: '0.05em',
  },
  mobileLogoutLink: {
    background: 'transparent',
    border: 'none',
    color: 'var(--danger)',
    fontSize: '1rem',
    letterSpacing: '0.05em',
    textAlign: 'left',
    cursor: 'pointer',
    padding: '0.25rem 0',
    display: 'flex',
    alignItems: 'center',
  },
};

// Add client-side CSS media query override since CSS objects do not do media queries directly in standard CSS properties
const styleInject = `
  @media (min-width: 768px) {
    header nav {
      display: flex !important;
    }
    header div:nth-child(2) {
      display: none !important;
    }
  }
`;
if (typeof document !== 'undefined') {
  const s = document.createElement('style');
  s.appendChild(document.createTextNode(styleInject));
  document.head.appendChild(s);
}
