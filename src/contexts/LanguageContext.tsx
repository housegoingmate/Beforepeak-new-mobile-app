import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import i18n from '../i18n';

export type AppLanguage = 'en' | 'zh-HK';

interface LanguageContextValue {
  language: AppLanguage;
  setLanguage: (lng: AppLanguage) => void;
  toggle: () => void;
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);
const STORAGE_KEY = 'beforepeak.language';

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>('en');

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const lng = (stored as AppLanguage) || (i18n.language?.startsWith('zh') ? 'zh-HK' : 'en');
        setLanguageState(lng);
        if (i18n.language !== lng) i18n.changeLanguage(lng);
      } catch (e) { /* ignore */ }
    })();
  }, []);

  const setLanguage = (lng: AppLanguage) => {
    setLanguageState(lng);
    i18n.changeLanguage(lng);
    AsyncStorage.setItem(STORAGE_KEY, lng).catch(() => {});
  };

  const value = useMemo(() => ({
    language,
    setLanguage,
    toggle: () => setLanguage(language === 'en' ? 'zh-HK' : 'en'),
  }), [language]);

  return (
    <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}

