import { useTranslation } from 'react-i18next';
import '../i18n';

export const useI18n = () => {
  const { t, i18n } = useTranslation();
  return {
    t,
    locale: i18n.language,
    changeLanguage: (lang: string) => i18n.changeLanguage(lang),
  };
};
