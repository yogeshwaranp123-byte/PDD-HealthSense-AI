import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useAuthStore } from '../store/authStore';
import { LogOut, ArrowLeft } from 'lucide-react';

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const Profile: React.FC = () => {
  const { profile, fetchProfile, updateProfile, isLoading } = useUserStore();
  const { logout } = useAuthStore();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    age: '',
    gender: '',
    weight: '',
    height: '',
    blood_type: '',
    existing_conditions: '',
    allergies: '',
  });

  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  useEffect(() => {
    if (profile) {
      setForm({
        age: profile.age?.toString() ?? '',
        gender: profile.gender ?? '',
        weight: profile.weight?.toString() ?? '',
        height: profile.height?.toString() ?? '',
        blood_type: profile.blood_type ?? '',
        existing_conditions: (profile.existing_conditions ?? []).join(', '),
        allergies: (profile.allergies ?? []).join(', '),
      });
    }
  }, [profile]);

  const setValue = (key: string, val: string) => {
    setForm((prev) => ({ ...prev, [key]: val }));
    setSaveSuccess(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      age: form.age ? Number(form.age) : undefined,
      gender: form.gender || undefined,
      weight: form.weight ? Number(form.weight) : undefined,
      height: form.height ? Number(form.height) : undefined,
      blood_type: form.blood_type || undefined,
      existing_conditions: form.existing_conditions
        ? form.existing_conditions.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
      allergies: form.allergies
        ? form.allergies.split(',').map((s) => s.trim()).filter(Boolean)
        : [],
    };
    await updateProfile(payload);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleLogout = async () => {
    if (window.confirm('Are you sure you want to sign out?')) {
      await logout();
      navigate('/');
    }
  };

  const initials = profile?.name ? profile.name.charAt(0).toUpperCase() : 'U';

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Navigation back link */}
        <button onClick={() => navigate(-1)} style={styles.backBtn}>
          <ArrowLeft size={16} style={{ marginRight: '6px' }} /> Back
        </button>

        {/* Hero title banner */}
        <div style={styles.hero} className="glassmorphism">
          <div style={styles.heroBg} />
          <div style={styles.heroScrim} />
          <div style={styles.heroContent}>
            <div>
              <span style={styles.heroTag}>SETTINGS</span>
              <h1 style={styles.heroTitle}>Health Profile</h1>
              <p style={styles.heroSub}>Manage your bio-metrics, clinical history, and localization settings</p>
            </div>

            <button onClick={handleLogout} style={styles.logoutBtn}>
              <LogOut size={14} style={{ marginRight: '6px' }} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile Details layout */}
        <div style={styles.grid}>
          {/* Avatar details side */}
          <div style={styles.sidebarCol}>
            <div style={styles.avatarCard} className="glassmorphism">
              <div style={styles.avatarCircle}>{initials}</div>
              <h3 style={styles.profileName}>{profile?.name || 'User Profile'}</h3>
              <span style={styles.profileEmail}>{profile?.email || 'patient@healthsense.ai'}</span>

              <div style={styles.cardDivider} />
              
              <div style={styles.infoSummary}>
                <div style={styles.infoSummaryRow}>
                  <span style={styles.summaryLabel}>Height</span>
                  <span style={styles.summaryValue}>{form.height ? `${form.height} cm` : 'Not set'}</span>
                </div>
                <div style={styles.infoSummaryRow}>
                  <span style={styles.summaryLabel}>Weight</span>
                  <span style={styles.summaryValue}>{form.weight ? `${form.weight} kg` : 'Not set'}</span>
                </div>
                <div style={styles.infoSummaryRow}>
                  <span style={styles.summaryLabel}>Blood Type</span>
                  <span style={styles.summaryValue}>{form.blood_type || 'Not set'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Form edit fields side */}
          <div style={styles.mainCol}>
            <form onSubmit={handleSave} style={styles.formCard} className="glassmorphism">
              {/* Biometrics row */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionHeading}>BIOMETRICS</h3>
                <div style={styles.biometricsGrid}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Age (years)</label>
                    <input
                      type="number"
                      value={form.age}
                      onChange={(e) => setValue('age', e.target.value)}
                      placeholder="e.g. 35"
                      style={styles.inputField}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Weight (kg)</label>
                    <input
                      type="number"
                      value={form.weight}
                      onChange={(e) => setValue('weight', e.target.value)}
                      placeholder="e.g. 70"
                      style={styles.inputField}
                    />
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Height (cm)</label>
                    <input
                      type="number"
                      value={form.height}
                      onChange={(e) => setValue('height', e.target.value)}
                      placeholder="e.g. 175"
                      style={styles.inputField}
                    />
                  </div>
                </div>
              </div>

              {/* Gender selector */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionHeading}>GENDER</h3>
                <div style={styles.chipGrid}>
                  {GENDERS.map((g) => {
                    const isSelected = form.gender === g;
                    return (
                      <button
                        key={g}
                        type="button"
                        onClick={() => setValue('gender', g)}
                        style={{
                          ...styles.chip,
                          background: isSelected ? 'var(--surface-highlight)' : 'var(--bg-primary)',
                          borderColor: isSelected ? 'var(--text-accent)' : 'var(--border-default)',
                          color: isSelected ? 'var(--text-accent)' : 'var(--text-tertiary)',
                        }}
                      >
                        {g}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Blood type selector */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionHeading}>BLOOD TYPE</h3>
                <div style={styles.chipGrid}>
                  {BLOOD_TYPES.map((bt) => {
                    const isSelected = form.blood_type === bt;
                    return (
                      <button
                        key={bt}
                        type="button"
                        onClick={() => setValue('blood_type', bt)}
                        style={{
                          ...styles.chip,
                          background: isSelected ? 'var(--surface-highlight)' : 'var(--bg-primary)',
                          borderColor: isSelected ? 'var(--text-accent)' : 'var(--border-default)',
                          color: isSelected ? 'var(--text-accent)' : 'var(--text-tertiary)',
                        }}
                      >
                        {bt}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Medical History */}
              <div style={styles.formSection}>
                <h3 style={styles.sectionHeading}>MEDICAL HISTORY</h3>
                <div style={styles.fieldsGrid}>
                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Existing Conditions</label>
                    <input
                      type="text"
                      value={form.existing_conditions}
                      onChange={(e) => setValue('existing_conditions', e.target.value)}
                      placeholder="Hypertension, Asthma, Diabetes..."
                      style={styles.inputField}
                    />
                    <span style={styles.hintText}>Comma-separated list of chronic health conditions</span>
                  </div>

                  <div style={styles.fieldGroup}>
                    <label style={styles.label}>Allergies</label>
                    <input
                      type="text"
                      value={form.allergies}
                      onChange={(e) => setValue('allergies', e.target.value)}
                      placeholder="Penicillin, Peanuts, Pollen..."
                      style={styles.inputField}
                    />
                    <span style={styles.hintText}>Comma-separated list of diagnostic substance allergies</span>
                  </div>
                </div>
              </div>

              {/* Save Controls */}
              <div style={styles.controlsRow}>
                <button type="submit" disabled={isLoading} style={styles.saveBtn}>
                  {isLoading ? 'Saving Changes...' : 'Save Profile Details'}
                </button>
                {saveSuccess && (
                  <span style={styles.successText}>Profile updated successfully!</span>
                )}
              </div>
            </form>
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
  backBtn: {
    background: 'transparent',
    border: 'none',
    color: 'var(--text-secondary)',
    fontSize: '0.8125rem',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    fontFamily: 'var(--font-mono)',
  },
  hero: {
    position: 'relative',
    height: '160px',
    borderRadius: 'var(--radius-xl)',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'flex-end',
    padding: '2rem',
  },
  heroBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundImage: 'url("https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=1200&q=80")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    opacity: 0.15,
  },
  heroScrim: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(to top, var(--bg-primary) 0%, transparent 100%)',
  },
  heroContent: {
    position: 'relative',
    zIndex: 2,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: '100%',
    gap: '2rem',
    flexWrap: 'wrap',
  },
  heroTag: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-accent)',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontSize: '2rem',
    fontFamily: 'var(--font-display)',
    color: '#FFFFFF',
    fontWeight: 'normal',
    marginTop: '4px',
  },
  heroSub: {
    fontSize: '0.875rem',
    color: 'var(--text-secondary)',
    marginTop: '4px',
  },
  logoutBtn: {
    background: 'transparent',
    border: '1px solid var(--danger)',
    color: 'var(--danger)',
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.8125rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontFamily: 'var(--font-mono)',
    transition: 'var(--transition-fast)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '3rem',
    alignItems: 'flex-start',
  },
  sidebarCol: {
    gridColumn: 'span 1',
  },
  mainCol: {
    gridColumn: 'span 2',
  },
  avatarCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '2.5rem 2rem',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  avatarCircle: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    background: 'var(--surface-highlight)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-accent)',
    fontSize: '2rem',
    fontWeight: 'normal',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '1rem',
    fontFamily: 'var(--font-display)',
  },
  profileName: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    fontFamily: 'var(--font-display)',
    marginBottom: '4px',
  },
  profileEmail: {
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.2px',
  },
  cardDivider: {
    width: '100%',
    height: '1px',
    backgroundColor: 'var(--border-subtle)',
    margin: '1.5rem 0',
  },
  infoSummary: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '0.75rem',
  },
  infoSummaryRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.8125rem',
  },
  summaryLabel: {
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
  },
  summaryValue: {
    color: 'var(--text-secondary)',
    fontWeight: '600',
  },
  formCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '3rem 2.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2.5rem',
  },
  formSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
  },
  sectionHeading: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
    letterSpacing: '2.5px',
    textTransform: 'uppercase',
    borderBottom: '1px solid var(--border-subtle)',
    paddingBottom: '0.5rem',
  },
  biometricsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
    gap: '1rem',
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    width: '100%',
  },
  label: {
    fontSize: '0.75rem',
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.5px',
    textTransform: 'uppercase',
  },
  inputField: {
    background: 'var(--bg-primary)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
    padding: '0.875rem 1rem',
    borderRadius: 'var(--radius-md)',
    fontSize: '0.875rem',
    outline: 'none',
    width: '100%',
  },
  hintText: {
    fontSize: '0.6875rem',
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--font-mono)',
    marginTop: '2px',
  },
  chipGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
  },
  chip: {
    padding: '0.5rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    border: '1px solid',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  fieldsGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  controlsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '1.5rem',
    borderTop: '1px solid var(--border-subtle)',
    paddingTop: '2rem',
    marginTop: '0.5rem',
    flexWrap: 'wrap',
  },
  saveBtn: {
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    fontWeight: '600',
    padding: '0.875rem 2rem',
    borderRadius: 'var(--radius-md)',
    border: 'none',
    cursor: 'pointer',
    fontSize: '0.875rem',
    transition: 'var(--transition-fast)',
  },
  successText: {
    fontSize: '0.8125rem',
    color: 'var(--success)',
    fontFamily: 'var(--font-mono)',
  },
};
export default Profile;
