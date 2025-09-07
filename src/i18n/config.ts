import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// Attempt to use react-native-localize if available; else default to 'en'
let deviceLocale = 'en';
try {

  const { getLocales } = require('react-native-localize');
  deviceLocale = getLocales?.()[0]?.languageCode || 'en';
} catch (e) {
  deviceLocale = 'en';
}

// Import translations
import en from './locales/en.json';
import zh from './locales/zh-HK.json';

const resources = {
  en: { translation: en },
  'zh-HK': { translation: zh },
};

const supportedLocales = ['en', 'zh-HK'];
const fallbackLocale = supportedLocales.includes(deviceLocale) ? deviceLocale : 'en';

i18n.use(initReactI18next).init({
  resources,
  lng: fallbackLocale,
  fallbackLng: 'en',
  debug: __DEV__,
  interpolation: { escapeValue: false },
  react: { useSuspense: false },
});

export default i18n;
