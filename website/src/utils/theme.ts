// ─── Design Token System ─────────────────────────────────────────────────────
// Single source of truth for HealthSense AI Web App.

export const theme = {
  background: {
    primary:   '#0C0C0B',   // near-black warm
    secondary: '#141413',   // card surfaces
    tertiary:  '#1C1C1A',   // elevated surfaces, skeleton
    overlay:   'rgba(12,12,11,0.85)',
  },
  text: {
    primary:   '#F5F0E8',   // warm off-white
    secondary: '#9C9789',   // muted warm gray
    tertiary:  '#5C5950',   // hints, disabled
    accent:    '#C8B89A',   // warm champagne — the one accent color
  },
  border: {
    subtle:    'rgba(245,240,232,0.07)',
    default:   'rgba(245,240,232,0.12)',
    strong:    'rgba(245,240,232,0.22)',
  },
  surface: {
    glass:     'rgba(255,255,255,0.04)',
    highlight: 'rgba(200,184,154,0.08)',
  },
  semantic: {
    danger:  '#C0392B',
    success: '#27AE60',
    warning: '#E67E22',
    info:    '#2980B9',
  },
} as const;

export const Typography = {
  fontFamily: {
    display:       "'Playfair Display', serif",
    body:          "'DM Sans', sans-serif",
    mono:          "'Courier New', Courier, monospace",
  },
  fontSize: {
    xs:       '0.75rem',  // 12px
    sm:       '0.8125rem',// 13px
    base:     '0.875rem', // 14px
    md:       '1rem',     // 16px
    lg:       '1.125rem', // 18px
    xl:       '1.375rem', // 22px
    xxl:      '1.75rem',  // 28px
    xxxl:     '2.25rem',  // 36px
    display:  '2.75rem',  // 44px
    hero:     '3.5rem',   // 56px
  },
} as const;

export const Disease = {
  diabetes: {
    color: theme.text.accent,
    icon: 'Activity',
    label: 'Diabetes',
    params: 8,
    time: '3 min',
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=800&q=80',
    description: "A chronic health condition that affects how your body turns food into energy. AI analyzes markers like Glucose, HbA1c, Insulin, and BMI.",
    symptoms: ["Increased thirst & urination", "Unexplained weight loss", "Fatigue & blurry vision"],
    preventions: ["Maintain a balanced low-sugar diet", "30 mins of daily exercise", "Regular HbA1c screenings"],
    keyMarkers: ["Fasting Glucose", "HbA1c Level", "BMI (Body Mass Index)"],
  },
  kidney: {
    color: '#8BA99B',
    icon: 'Droplet',
    label: 'Kidney Disease',
    params: 14,
    time: '5 min',
    image: 'https://images.unsplash.com/photo-1530497610245-94d3c16cda28?auto=format&fit=crop&w=800&q=80',
    description: "Chronic Kidney Disease (CKD) involves gradual loss of kidney function. AI analyzes serum chemistry and filtration markers.",
    symptoms: ["Swelling in feet/ankles", "Fatigue & shortness of breath", "Changes in urination frequency"],
    preventions: ["Manage blood pressure & blood sugar", "Limit high-sodium & processed foods", "Stay hydrated & avoid excessive painkillers"],
    keyMarkers: ["Serum Creatinine", "Blood Urea Nitrogen (BUN)", "Albumin / GFR"],
  },
  parkinsons: {
    color: '#A09ABF',
    icon: 'Mic',
    label: "Parkinson's",
    params: 22,
    time: '6 min',
    image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?auto=format&fit=crop&w=800&q=80',
    description: "A progressive nervous system disorder affecting movement. AI analyzes voice acoustic markers, speech fluctuations, and tremors.",
    symptoms: ["Tremors or shaking", "Rigid muscles & slowed movement", "Speech & voice volume changes"],
    preventions: ["Regular aerobic exercise", "Diet rich in Omega-3 fatty acids", "Cognitive & coordination tasks"],
    keyMarkers: ["Vocal Jitter & Shimmer", "Fundamental Frequency (F0)", "Harmonic-to-Noise Ratio"],
  },
  lung_cancer: {
    color: '#BF9A9A',
    icon: 'Wind',
    label: 'Lung Cancer',
    params: 15,
    time: '4 min',
    image: 'https://images.unsplash.com/photo-1579154204601-01588f351e67?auto=format&fit=crop&w=800&q=80',
    description: "A cancer that starts in the lungs, strongly linked to lifestyle factors. AI maps symptoms, family history, and lifestyle profiles.",
    symptoms: ["Persistent cough or coughing blood", "Shortness of breath & chest pain", "Hoarseness & wheezing"],
    preventions: ["Avoid smoking and second-hand smoke", "Avoid occupational carcinogens", "Air filtration in high-pollution areas"],
    keyMarkers: ["Symptom patterns", "Smoking history", "Environmental exposures"],
  },
  thyroid: {
    color: '#B8AA8B',
    icon: 'Thermometer',
    label: 'Thyroid',
    params: 12,
    time: '4 min',
    image: 'https://images.unsplash.com/photo-1584982751601-97dcc096659c?auto=format&fit=crop&w=800&q=80',
    description: "Hormonal imbalances caused by hyperthyroidism or hypothyroidism. AI evaluates blood thyroid panel values.",
    symptoms: ["Unexplained weight changes", "Fatigue or hyper-activity", "Sensitivity to cold or heat"],
    preventions: ["Ensure adequate dietary iodine", "Regular thyroid blood panels", "Stress management"],
    keyMarkers: ["TSH (Thyroid Stimulating Hormone)", "Free T3", "Free T4 / FTI"],
  },
} as const;

export type DiseaseKey = keyof typeof Disease;
