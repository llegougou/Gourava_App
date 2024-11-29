import React, { createContext, useState, useContext, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; 
import en from '../localization/en.json';
import fr from '../localization/fr.json';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const loadLanguage = async () => {
      const savedLanguage = await AsyncStorage.getItem('language');
      if (savedLanguage) {
        setLanguage(savedLanguage);
      }
    };

    loadLanguage();
  }, []);

  const languageData = language === 'en' ? en : fr;

  const switchLanguage = async (lang) => {
    if (lang === 'en' || lang === 'fr') {
      setLanguage(lang);
      await AsyncStorage.setItem('language', lang);  // Save the language choice
    }
  };

  return (
    <LanguageContext.Provider value={{ languageData, switchLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);