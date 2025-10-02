// hooks/useTranslation.js
import { useLanguage } from '../contexts/LanguageContext';
import i18n from '../locales';
import { fallbackTranslations } from '../locales/fallbacks';

export const useTranslation = () => {
  const { isLanguageReady, currentLanguage } = useLanguage();

  const t = (key, params = {}) => { // Add params parameter
    if (!isLanguageReady) {
      let translation = fallbackTranslations[key] || key;
      
      // Replace placeholders in fallback
      Object.keys(params).forEach(param => {
        translation = translation.replace(`{${param}}`, params[param]);
      });
      
      return translation;
    }

    try {
      let result = i18n.t(key);
      
      // Replace placeholders in actual translation
      Object.keys(params).forEach(param => {
        result = result.replace(`{${param}}`, params[param]);
      });
      
      if (result === key) {
        // If translation not found, use fallback
        let fallback = fallbackTranslations[key] || key;
        
        // Replace placeholders in fallback too
        Object.keys(params).forEach(param => {
          fallback = fallback.replace(`{${param}}`, params[param]);
        });
        
        return fallback;
      }
      
      return typeof result === 'string' ? result : key;
    } catch (error) {
      console.warn('Translation error for key:', key, error);
      return key;
    }
  };

  return {
    t,
    currentLanguage,
    isLanguageReady
  };
};