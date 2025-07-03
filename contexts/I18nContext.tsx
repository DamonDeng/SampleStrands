import React, { createContext, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { changeLanguage, getCurrentLanguage } from '../utils/i18n';
import { SupportedLanguage } from '../types/i18n';

interface I18nContextType {
  currentLanguage: SupportedLanguage;
  changeLanguage: (language: SupportedLanguage) => void;
  isReady: boolean;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: React.ReactNode;
  initialLanguage?: SupportedLanguage;
}

export function I18nProvider({ children, initialLanguage = 'en' }: I18nProviderProps) {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>(initialLanguage);
  const [isReady, setIsReady] = useState(false);

  // Initialize language on mount
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // Use the provided initial language or fall back to current i18n language
        const langToUse = initialLanguage || (getCurrentLanguage() as SupportedLanguage) || 'en';
        
        if (langToUse !== i18n.language) {
          await i18n.changeLanguage(langToUse);
        }
        
        setCurrentLanguage(langToUse);
        setIsReady(true);
      } catch (error) {
        console.error('Failed to initialize language:', error);
        // Fall back to English if initialization fails
        setCurrentLanguage('en');
        setIsReady(true);
      }
    };

    initLanguage();
  }, [initialLanguage, i18n]);

  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      await changeLanguage(language);
      setCurrentLanguage(language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  const contextValue: I18nContextType = {
    currentLanguage,
    changeLanguage: handleLanguageChange,
    isReady,
  };

  return (
    <I18nContext.Provider value={contextValue}>
      {children}
    </I18nContext.Provider>
  );
}

// Custom hook to use i18n context
export function useI18nContext() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18nContext must be used within an I18nProvider');
  }
  return context;
}

// Enhanced useTranslation hook with namespace support
export function useAppTranslation(namespace?: string) {
  const translation = useTranslation(namespace);
  const context = useContext(I18nContext);

  // Provide fallback values when used outside of I18nProvider (e.g., during SSR)
  const fallbackContext = {
    currentLanguage: 'en' as const,
    changeLanguage: () => {},
    isReady: false,
  };

  const contextValue = context || fallbackContext;

  return {
    ...translation,
    currentLanguage: contextValue.currentLanguage,
    changeLanguage: contextValue.changeLanguage,
    isReady: contextValue.isReady,
  };
}
