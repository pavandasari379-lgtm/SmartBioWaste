import React, { createContext, useContext, useState } from 'react';
import en from '../translations/en.json';
import ta from '../translations/ta.json';
import hi from '../translations/hi.json';

const translations = { en, ta, hi };

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('smartbiowaste_lang') || 'en';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('smartbiowaste_lang', lang);
  };

  const t = (path, fallback = '') => {
    const keys = path.split('.');
    let current = translations[language] || translations['en'];
    for (const key of keys) {
      if (current && current[key] !== undefined) {
        current = current[key];
      } else {
        // Fallback to English
        let enCurrent = translations['en'];
        for (const k of keys) {
          if (enCurrent && enCurrent[k] !== undefined) {
            enCurrent = enCurrent[k];
          } else {
            return fallback || path;
          }
        }
        return enCurrent;
      }
    }
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
