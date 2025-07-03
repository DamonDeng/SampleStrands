// TypeScript definitions for i18n
import 'react-i18next';

// Import the actual translation files to infer types
import enCommon from '../locales/en/common.json';
import enChat from '../locales/en/chat.json';
import enAgents from '../locales/en/agents.json';
import enSettings from '../locales/en/settings.json';
import enErrors from '../locales/en/errors.json';

// Define the resources type
declare module 'react-i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common';
    resources: {
      common: typeof enCommon;
      chat: typeof enChat;
      agents: typeof enAgents;
      settings: typeof enSettings;
      errors: typeof enErrors;
    };
  }
}

// Export types for use in components
export type TranslationKey = keyof typeof enCommon;
export type ChatTranslationKey = keyof typeof enChat;
export type AgentsTranslationKey = keyof typeof enAgents;
export type SettingsTranslationKey = keyof typeof enSettings;
export type ErrorsTranslationKey = keyof typeof enErrors;

// Language codes supported by the app
export type SupportedLanguage = 'en' | 'zh' | 'es' | 'fr' | 'de' | 'ja';

// Language display names
export const LANGUAGE_NAMES: Record<SupportedLanguage, string> = {
  en: 'English',
  zh: '中文',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  ja: '日本語',
};
