import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../locales';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isLanguageReady, setIsLanguageReady] = useState(false);

  useEffect(() => {
    const initializeLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('appLanguage');
        
        if (savedLanguage === 'en' || savedLanguage === 'ta') {
          setCurrentLanguage(savedLanguage);
          i18n.locale = savedLanguage;
        } else {
          setCurrentLanguage('en');
          i18n.locale = 'en';
          await AsyncStorage.setItem('appLanguage', 'en');
        }
      } catch (error) {
        console.error('Error loading language:', error);
        setCurrentLanguage('en');
        i18n.locale = 'en';
      } finally {
        setIsLanguageReady(true);
      }
    };

    initializeLanguage();
  }, []);

  const setLanguage = async (languageCode) => {
    if (languageCode !== 'en' && languageCode !== 'ta') {
      return;
    }
    
    setCurrentLanguage(languageCode);
    i18n.locale = languageCode;
    
    try {
      await AsyncStorage.setItem('appLanguage', languageCode);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const value = {
    currentLanguage,
    setLanguage,
    isLanguageReady,
    availableLanguages: ['en', 'ta'],
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};