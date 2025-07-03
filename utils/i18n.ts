import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translation files
import enCommon from '../locales/en/common.json';
import enChat from '../locales/en/chat.json';
import enAgents from '../locales/en/agents.json';
import enSettings from '../locales/en/settings.json';
import enErrors from '../locales/en/errors.json';

import zhCommon from '../locales/zh/common.json';
import zhChat from '../locales/zh/chat.json';
import zhAgents from '../locales/zh/agents.json';
import zhSettings from '../locales/zh/settings.json';
import zhErrors from '../locales/zh/errors.json';

// Translation resources
const resources = {
  en: {
    common: enCommon,
    chat: enChat,
    agents: enAgents,
    settings: enSettings,
    errors: enErrors,
  },
  zh: {
    common: zhCommon,
    chat: zhChat,
    agents: zhAgents,
    settings: zhSettings,
    errors: zhErrors,
  },
};

// Initialize i18next
i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    debug: process.env.NODE_ENV === 'development',
    
    // Namespace configuration
    defaultNS: 'common',
    ns: ['common', 'chat', 'agents', 'settings', 'errors'],
    
    // Language detection configuration
    detection: {
      // Don't use browser language detection in Electron
      // We'll control language through app settings
      order: typeof window !== 'undefined' ? ['localStorage'] : [],
      caches: typeof window !== 'undefined' ? ['localStorage'] : [],
      lookupLocalStorage: 'samplestrands-language',
    },
    
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    
    // React-specific options
    react: {
      useSuspense: false, // Disable suspense for SSR compatibility
    },
  });

export default i18n;

// Helper function to change language and persist to localStorage
export const changeLanguage = (language: string) => {
  i18n.changeLanguage(language);
  localStorage.setItem('samplestrands-language', language);
};

// Helper function to get current language
export const getCurrentLanguage = () => {
  return i18n.language || 'en';
};

// Helper function to get available languages
export const getAvailableLanguages = () => {
  return Object.keys(resources);
};
