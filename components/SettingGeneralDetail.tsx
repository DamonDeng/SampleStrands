import { useState, useEffect, useCallback } from 'react';
import { AppSetting } from '../utils/appSettingAPI';
import { Agent } from '../types/agent';
import {
  IoSettingsOutline,
  IoLanguageOutline,
  IoColorPaletteOutline,
  IoPersonOutline,
  IoSaveOutline,
  IoCheckmarkCircleOutline
} from 'react-icons/io5';
import { useAppTranslation, useI18nContext } from '../contexts/I18nContext';
import { SupportedLanguage } from '../types/i18n';
import styles from '../styles/SettingGeneralDetail.module.css';

interface SettingGeneralDetailProps {
  setting: AppSetting;
  agents: Agent[];
  onUpdateSetting: (settingTitle: string, jsonData: Record<string, any>) => void;
  onSettingChange?: () => void; // Called when navigating away from this setting
}

interface GeneralSettings {
  language: string;
  theme: string;
  default_agent: string | null;
  shortcut_to_send: 'enter' | 'shift_enter';
}

export default function SettingGeneralDetail({
  setting,
  agents,
  onUpdateSetting,
  onSettingChange
}: SettingGeneralDetailProps) {
  const { t } = useAppTranslation('settings');
  const { changeLanguage } = useI18nContext();

  const [editForm, setEditForm] = useState<GeneralSettings>({
    language: setting.json_data.language || 'en',
    theme: setting.json_data.theme || 'dark',
    default_agent: setting.json_data.default_agent || null,
    shortcut_to_send: setting.json_data.shortcut_to_send || 'shift_enter'
  });
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Debug logging for agents
  useEffect(() => {
    console.log(`🔧 SettingGeneralDetail: Received ${agents.length} agents:`,
      agents.map(a => ({ id: a.id, name: a.config.name, active: a.is_active }))
    );
  }, [agents]);

  // Auto-save functionality with debouncing
  const saveChanges = useCallback(async () => {
    if (!hasUnsavedChanges) return;

    setSaveStatus('saving');
    try {
      await onUpdateSetting(setting.setting_title, editForm);
      setSaveStatus('saved');
      setHasUnsavedChanges(false);
      
      // Reset status after 2 seconds
      setTimeout(() => {
        setSaveStatus('idle');
      }, 2000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setSaveStatus('error');
      setTimeout(() => {
        setSaveStatus('idle');
      }, 3000);
    }
  }, [editForm, hasUnsavedChanges, onUpdateSetting, setting.setting_title]);

  // Debounced auto-save
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const timeoutId = setTimeout(() => {
      saveChanges();
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [editForm, hasUnsavedChanges, saveChanges]);

  // Save when navigating away
  useEffect(() => {
    return () => {
      if (hasUnsavedChanges) {
        onUpdateSetting(setting.setting_title, editForm);
      }
      onSettingChange?.();
    };
  }, [hasUnsavedChanges, editForm, onUpdateSetting, setting.setting_title, onSettingChange]);

  const handleInputChange = (field: keyof GeneralSettings, value: string | null) => {
    setEditForm(prev => ({
      ...prev,
      [field]: value
    }));
    setHasUnsavedChanges(true);
    setSaveStatus('idle');

    // Immediately change language in i18n when language field is updated
    if (field === 'language' && value) {
      changeLanguage(value as SupportedLanguage);
    }
  };

  const getActiveAgentName = () => {
    if (!editForm.default_agent) return 'No default agent selected';
    const agent = agents.find(a => a.id === editForm.default_agent);
    if (!agent) return 'Unknown agent (may have been deleted)';

    const statusText = agent.is_active ? '' : ' (inactive)';
    return `${agent.config.name}${statusText}`;
  };

  const getSaveStatusIcon = () => {
    switch (saveStatus) {
      case 'saving':
        return <div className={styles.spinner}></div>;
      case 'saved':
        return <IoCheckmarkCircleOutline className={styles.savedIcon} />;
      case 'error':
        return <span className={styles.errorIcon}>⚠️</span>;
      default:
        return hasUnsavedChanges ? <IoSaveOutline className={styles.unsavedIcon} /> : null;
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saving':
        return t('status.saving', { ns: 'common' });
      case 'saved':
        return t('status.saved', { ns: 'common' });
      case 'error':
        return t('status.saveFailed', { ns: 'common' });
      default:
        return hasUnsavedChanges ? t('status.unsavedChanges', { ns: 'common' }) : '';
    }
  };

  return (
    <div className={styles.settingDetail}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.settingIcon}>
            <IoSettingsOutline />
          </div>
          <div className={styles.titleInfo}>
            <h1 className={styles.settingName}>{t('SETTINGS:GENERAL:TITLE')}</h1>
            <p className={styles.settingDescription}>
              {t('general.description')}
            </p>
          </div>
        </div>
        
        <div className={styles.saveStatus}>
          {getSaveStatusIcon()}
          <span className={styles.saveStatusText}>{getSaveStatusText()}</span>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>
            <IoLanguageOutline />
            {t('general.language.title')}
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('general.language.label')}</label>
            <select
              className={styles.select}
              value={editForm.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="en">{t('general.language.options.en')}</option>
              <option value="zh">{t('general.language.options.zh')}</option>
              <option value="es">{t('general.language.options.es')}</option>
              <option value="fr">{t('general.language.options.fr')}</option>
              <option value="de">{t('general.language.options.de')}</option>
              <option value="ja">{t('general.language.options.ja')}</option>
            </select>
            <p className={styles.helpText}>
              {t('general.language.helpText')}
            </p>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>
            <IoColorPaletteOutline />
            {t('general.theme.title')}
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('general.theme.label')}</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={editForm.theme === 'dark'}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                />
                <span className={styles.radioLabel}>{t('general.theme.options.dark')}</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={editForm.theme === 'light'}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                />
                <span className={styles.radioLabel}>{t('general.theme.options.light')}</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="theme"
                  value="auto"
                  checked={editForm.theme === 'auto'}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                />
                <span className={styles.radioLabel}>{t('general.theme.options.auto')}</span>
              </label>
            </div>
            <p className={styles.helpText}>
              {t('general.theme.helpText')}
            </p>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>
            <IoPersonOutline />
            {t('general.defaultAgent.title')}
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('general.defaultAgent.label')}</label>
            <select
              className={styles.select}
              value={editForm.default_agent || ''}
              onChange={(e) => handleInputChange('default_agent', e.target.value || null)}
            >
              <option value="">{t('general.defaultAgent.noAgent')}</option>
              {agents
                .sort((a, b) => {
                  // Sort by active status first (active agents first), then by name
                  if (a.is_active !== b.is_active) {
                    return a.is_active ? -1 : 1;
                  }
                  return a.config.name.localeCompare(b.config.name);
                })
                .map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.config.name} {agent.is_active ? '✓' : t('general.defaultAgent.inactive')}
                  </option>
                ))
              }
            </select>
            <p className={styles.helpText}>
              {t('general.defaultAgent.currentlySelected')} <strong>{getActiveAgentName()}</strong>
              <br />
              {agents.length > 0 ? (
                <>
                  {t('general.defaultAgent.availableAgents')} {agents.filter(a => a.is_active).length} {t('general.defaultAgent.active')}, {agents.filter(a => !a.is_active).length} {t('general.defaultAgent.inactive')}
                </>
              ) : (
                t('general.defaultAgent.noAgentsAvailable')
              )}
            </p>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>
            <IoSettingsOutline />
            {t('general.shortcuts.title')}
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>{t('general.shortcuts.label')}</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="shortcut_to_send"
                  value="enter"
                  checked={editForm.shortcut_to_send === 'enter'}
                  onChange={(e) => handleInputChange('shortcut_to_send', e.target.value)}
                />
                <span className={styles.radioLabel}>{t('general.shortcuts.options.enter')}</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="shortcut_to_send"
                  value="shift_enter"
                  checked={editForm.shortcut_to_send === 'shift_enter'}
                  onChange={(e) => handleInputChange('shortcut_to_send', e.target.value)}
                />
                <span className={styles.radioLabel}>{t('general.shortcuts.options.shift_enter')}</span>
              </label>
            </div>
            <p className={styles.helpText}>
              {t('general.shortcuts.helpText')}
              {editForm.shortcut_to_send === 'enter' ?
                ` ${t('general.shortcuts.helpTextEnter')}` :
                ` ${t('general.shortcuts.helpTextShiftEnter')}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
