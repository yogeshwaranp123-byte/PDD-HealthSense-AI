import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useHospitalStore, type Hospital } from '../store/hospitalStore';
import { MapPin, Phone, Globe, Navigation, AlertCircle, RefreshCw, PlusCircle } from 'lucide-react';

export const Hospitals: React.FC = () => {
  const { hospitals, isLoading, error, getNearbyHospitals } = useHospitalStore();
  const [locError, setLocError] = useState<string>('');
  const [userCoords, setUserCoords] = useState<{ lat: number; lng: number } | null>(null);

  const fetchNearby = (force = false) => {
    setLocError('');
    if (!navigator.geolocation) {
      setLocError('Geolocation is not supported by your browser.');
      // Fallback coordinate search (e.g., Bangalore default)
      setUserCoords({ lat: 12.9716, lng: 77.5946 });
      getNearbyHospitals(12.9716, 77.5946, 'Bangalore, Karnataka', force);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserCoords({ lat: latitude, lng: longitude });

        // Reverse geocoding using OSM Nominatim for a pretty location description
        let address = '';
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            address = data.display_name || '';
          }
        } catch (err) {
          console.warn('Could not reverse geocode coords:', err);
        }

        getNearbyHospitals(latitude, longitude, address, force);
      },
      () => {
        setLocError('Location permissions denied. Serving default city clinics (Bangalore).');
        // Fallback coordinates
        setUserCoords({ lat: 12.9716, lng: 77.5946 });
        getNearbyHospitals(12.9716, 77.5946, 'Bangalore, Karnataka', force);
      },
      { timeout: 10000 }
    );
  };

  useEffect(() => {
    fetchNearby(false);
  }, []);

  const getDistance = (lat: number, lng: number): string => {
    if (!userCoords) return '';
    const R = 6371; // Earth radius in km
    const dLat = ((lat - userCoords.lat) * Math.PI) / 180;
    const dLng = ((lng - userCoords.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((userCoords.lat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const d = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return `${d.toFixed(1)} km`;
  };

  const handleOpenMap = (hospital: Hospital) => {
    const query = `${hospital.name} ${hospital.address || ''}`.trim();
    const url = hospital.map_link || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const handleOpenWebsite = (web: string) => {
    const url = web.startsWith('http') ? web : `https://${web}`;
    window.open(url, '_blank');
  };

  const activeError = locError || error;

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Banner with controls */}
        <div style={styles.hero} className="glassmorphism">
          <div style={styles.heroBg} />
          <div style={styles.heroScrim} />
          
          <div style={styles.heroContent}>
            <div>
              <span style={styles.heroTag}>CLINICAL LOCATOR</span>
              <h1 style={styles.heroTitle}>Nearby Hospitals</h1>
              <p style={styles.heroSub}>Find nearest medical clinics, pathology labs, and emergency diagnostic centers</p>
            </div>
            
            <button 
              onClick={() => fetchNearby(true)} 
              disabled={isLoading} 
              style={styles.refreshBtn}
            >
              <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} style={{ marginRight: '6px' }} />
              {isLoading ? 'Locating...' : 'Refresh Finder'}
            </button>
          </div>
        </div>

        {/* Errors view */}
        {activeError && (
          <div style={styles.errorBox} className="glassmorphism">
            <AlertCircle size={32} color="var(--danger)" style={{ marginBottom: '1rem' }} />
            <h3 style={styles.errorTitle}>Location Settings Warning</h3>
            <p style={styles.errorText}>{activeError}</p>
            <button onClick={() => fetchNearby(true)} style={styles.retryBtn}>Retry Coordinates Retrieval</button>
          </div>
        )}

        {/* Results grid */}
        {!activeError && (
          <div style={styles.content}>
            {isLoading && hospitals.length === 0 && (
              <div style={styles.loadingBanner} className="glassmorphism">
                <MapPin size={16} color="var(--text-accent)" style={{ marginRight: '8px' }} />
                <span>Locating your coordinates and loading closest hospitals...</span>
              </div>
            )}

            {hospitals.length === 0 && !isLoading && (
              <div style={styles.emptyCard} className="glassmorphism">
                <MapPin size={48} color="var(--text-tertiary)" style={{ marginBottom: '1rem' }} />
                <h3 style={styles.emptyTitle}>No medical clinics found</h3>
                <p style={styles.emptySub}>No facilities are registered within a 5 km radius of your coordinates.</p>
              </div>
            )}

            {hospitals.length > 0 && (
              <div style={styles.cardsGrid}>
                {hospitals.map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.6 }}
                    style={styles.hospitalCard}
                    className="glassmorphism"
                  >
                    <div style={styles.cardHeader}>
                      <div style={styles.iconWrap}>
                        <PlusCircle size={18} color="var(--text-accent)" />
                      </div>
                      <div style={styles.cardMeta}>
                        <h3 style={styles.hospitalName} title={h.name}>{h.name}</h3>
                        {userCoords && h.lat && h.lng && (
                          <div style={styles.distLabel}>
                            <MapPin size={10} color="var(--text-accent)" style={{ marginRight: '4px' }} />
                            <span>{getDistance(h.lat, h.lng)} away</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {h.address && (
                      <p style={styles.hospitalAddress} title={h.address}>
                        {h.address}
                      </p>
                    )}

                    <div style={styles.cardActions}>
                      <button onClick={() => handleOpenMap(h)} style={styles.actionBtn}>
                        <Navigation size={12} style={{ marginRight: '5px' }} />
                        Directions
                      </button>

                      {h.phone ? (
                        <a href={`tel:${h.phone}`} style={styles.actionBtnCall}>
                          <Phone size={12} style={{ marginRight: '5px' }} />
                          Call
                        </a>
                      ) : (
                        <span style={styles.actionBtnDisabled}>
                          No Phone Info
                        </span>
                      )}

                      {h.website && (
                        <button onClick={() => handleOpenWebsite(h.website!)} style={styles.actionBtnWeb}>
                          <Globe size={12} style={{ marginRight: '5px' }} />
                          Website
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}
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
    backgroundImage: 'url("https://images.unsplash.com/photo-1551190822-a9333d879b1f?auto=format&fit=crop&w=1200&q=80")',
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
  refreshBtn: {
    background: 'var(--surface-highlight)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-accent)',
    padding: '0.6rem 1.25rem',
    borderRadius: 'var(--radius-full)',
    fontSize: '0.8125rem',
    fontFamily: 'var(--font-mono)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    height: 'fit-content',
    transition: 'var(--transition-fast)',
  },
  errorBox: {
    borderRadius: 'var(--radius-xl)',
    padding: '3rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  errorTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  errorText: {
    color: 'var(--text-tertiary)',
    fontSize: '0.875rem',
    lineHeight: '1.5',
    marginBottom: '1.5rem',
    maxWidth: '400px',
  },
  retryBtn: {
    background: 'var(--text-accent)',
    color: 'var(--bg-primary)',
    border: 'none',
    padding: '0.6rem 1.5rem',
    borderRadius: 'var(--radius-full)',
    fontWeight: '600',
    fontSize: '0.8125rem',
    cursor: 'pointer',
  },
  content: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1.5rem',
  },
  loadingBanner: {
    borderRadius: 'var(--radius-lg)',
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.8125rem',
    color: 'var(--text-accent)',
    fontFamily: 'var(--font-mono)',
  },
  emptyCard: {
    borderRadius: 'var(--radius-xl)',
    padding: '4rem 2rem',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: '1.25rem',
    color: 'var(--text-primary)',
    marginBottom: '0.5rem',
  },
  emptySub: {
    color: 'var(--text-tertiary)',
    fontSize: '0.875rem',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
    gap: '1.25rem',
  },
  hospitalCard: {
    borderRadius: 'var(--radius-lg)',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  iconWrap: {
    width: '38px',
    height: '38px',
    borderRadius: 'var(--radius-md)',
    background: 'var(--surface-highlight)',
    border: '1px solid var(--border-subtle)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  cardMeta: {
    flex: 1,
    minWidth: 0,
  },
  hospitalName: {
    color: 'var(--text-primary)',
    fontSize: '1rem',
    fontWeight: '600',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  distLabel: {
    display: 'flex',
    alignItems: 'center',
    fontSize: '0.6875rem',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-accent)',
    marginTop: '2px',
  },
  hospitalAddress: {
    color: 'var(--text-secondary)',
    fontSize: '0.875rem',
    lineHeight: '1.45',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardActions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '0.5rem',
    marginTop: '0.25rem',
  },
  actionBtn: {
    background: 'var(--surface-highlight)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-accent)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
  actionBtnCall: {
    background: 'rgba(39, 174, 96, 0.08)',
    border: '1px solid rgba(39, 174, 96, 0.2)',
    color: 'var(--success)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
  },
  actionBtnDisabled: {
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-tertiary)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'default',
  },
  actionBtnWeb: {
    background: 'transparent',
    border: '1px solid var(--border-subtle)',
    color: 'var(--text-secondary)',
    fontSize: '0.75rem',
    fontFamily: 'var(--font-mono)',
    padding: '0.45rem 0.85rem',
    borderRadius: 'var(--radius-md)',
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    transition: 'var(--transition-fast)',
  },
};
export default Hospitals;
