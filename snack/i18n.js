import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to BeforePeak',
      toggle: 'Switch to Chinese',
    },
  },
  'zh-HK': {
    translation: {
      welcome: '歡迎使用 BeforePeak',
      toggle: '切換到英文',
    },
  },
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

export default i18n;

