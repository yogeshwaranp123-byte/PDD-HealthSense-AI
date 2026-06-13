import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import hi from './hi.json';
import ta from './ta.json';

i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  lng: 'en',
  fallbackLng: 'en',
  resources: {
    en: { translation: en.en },
    hi: { translation: hi.en },
    ta: { translation: ta.en },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
