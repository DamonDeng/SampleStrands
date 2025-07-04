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
  const { t: tcd } = useAppTranslation('settings');
  const { changeLanguage } = useI18nContext();

  // Helper function to create form data from setting props
  const createFormFromSetting = useCallback((settingData: AppSetting): GeneralSettings => ({
    language: settingData.json_data.language || 'en',
    theme: settingData.json_data.theme || 'dark',
    default_agent: settingData.json_data.default_agent || null,
    shortcut_to_send: settingData.json_data.shortcut_to_send || 'shift_enter'
  }), []);

  // Use state only for the editing form, not for copying props
  const [editForm, setEditForm] = useState<GeneralSettings>(() => createFormFromSetting(setting));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Update form when setting changes (e.g., switching between different settings)
  useEffect(() => {
    const newForm = createFormFromSetting(setting);
    setEditForm(newForm);
    setHasUnsavedChanges(false);
    setSaveStatus('idle');
  }, [setting, createFormFromSetting]);

  // Debug logging for agents
  useEffect(() => {
    console.log('🔧 SettingGeneralDetail: Received agents:', agents.length,
      agents.map(a => ({ id: a.id, name: a.config.name, active: a.active }))
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

    const statusText = agent.active ? '' : ' (inactive)';
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
        return tcd('COMMON.STATUS.SAVING', { ns: 'common' });
      case 'saved':
        return tcd('COMMON.STATUS.SAVED', { ns: 'common' });
      case 'error':
        return tcd('COMMON.STATUS.SAVE_FAILED', { ns: 'common' });
      default:
        return hasUnsavedChanges ? tcd('COMMON.STATUS.UNSAVED_CHANGES', { ns: 'common' }) : '';
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
            {/* <h1 className={styles.settingName}>{t('settings:general.title')}</h1> */}

            <h1 className={styles.settingName}>{tcd('settings:general.title')}</h1>

            <p className={styles.settingDescription}>
              {tcd('SETTINGS.GENERAL.DESCRIPTION')}
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
            {tcd('SETTINGS.GENERAL.LANGUAGE.TITLE')}
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>{tcd('SETTINGS.GENERAL.LANGUAGE.LABEL')}</label>
            <select
              className={styles.select}
              value={editForm.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="en">{tcd('SETTINGS.GENERAL.LANGUAGE.OPTIONS.EN')}</option>
              <option value="zh">{tcd('SETTINGS.GENERAL.LANGUAGE.OPTIONS.ZH')}</option>
              <option value="es">{tcd('SETTINGS.GENERAL.LANGUAGE.OPTIONS.ES')}</option>
              <option value="fr">{tcd('SETTINGS.GENERAL.LANGUAGE.OPTIONS.FR')}</option>
              <option value="de">{tcd('SETTINGS.GENERAL.LANGUAGE.OPTIONS.DE')}</option>
              <option value="ja">{tcd('SETTINGS.GENERAL.LANGUAGE.OPTIONS.JA')}</option>
            </select>
            <p className={styles.helpText}>
              {tcd('SETTINGS.GENERAL.LANGUAGE.HELP_TEXT')}
            </p>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>
            <IoColorPaletteOutline />
            {tcd('SETTINGS.GENERAL.THEME.TITLE')}
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>{tcd('SETTINGS.GENERAL.THEME.LABEL')}</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={editForm.theme === 'dark'}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                />
                <span className={styles.radioLabel}>{tcd('SETTINGS.GENERAL.THEME.OPTIONS.DARK')}</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={editForm.theme === 'light'}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                />
                <span className={styles.radioLabel}>{tcd('SETTINGS.GENERAL.THEME.OPTIONS.LIGHT')}</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="theme"
                  value="auto"
                  checked={editForm.theme === 'auto'}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                />
                <span className={styles.radioLabel}>{tcd('SETTINGS.GENERAL.THEME.OPTIONS.AUTO')}</span>
              </label>
            </div>
            <p className={styles.helpText}>
              {tcd('SETTINGS.GENERAL.THEME.HELP_TEXT')}
            </p>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>
            <IoPersonOutline />
            {tcd('SETTINGS.GENERAL.DEFAULT_AGENT.TITLE')}
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>{tcd('SETTINGS.GENERAL.DEFAULT_AGENT.LABEL')}</label>
            <select
              className={styles.select}
              value={editForm.default_agent || ''}
              onChange={(e) => handleInputChange('default_agent', e.target.value || null)}
            >
              <option value="">{tcd('SETTINGS.GENERAL.DEFAULT_AGENT.NO_AGENT')}</option>
              {agents
                .sort((a, b) => {
                  // Sort by active status first (active agents first), then by name
                  if (a.active !== b.active) {
                    return a.active ? -1 : 1;
                  }
                  return a.config.name.localeCompare(b.config.name);
                })
                .map((agent) => (
                  <option key={agent.id} value={agent.id}>
                    {agent.config.name} {agent.active ? '✓' : tcd('SETTINGS.GENERAL.DEFAULT_AGENT.INACTIVE')}
                  </option>
                ))
              }
            </select>
            <p className={styles.helpText}>
              {tcd('SETTINGS.GENERAL.DEFAULT_AGENT.CURRENTLY_SELECTED')} <strong>{getActiveAgentName()}</strong>
              <br />
              {agents.length > 0 ? (
                <>
                  {tcd('SETTINGS.GENERAL.DEFAULT_AGENT.AVAILABLE_AGENTS')} {agents.filter(a => a.active).length} {tcd('SETTINGS.GENERAL.DEFAULT_AGENT.ACTIVE')}, {agents.filter(a => !a.active).length} {tcd('SETTINGS.GENERAL.DEFAULT_AGENT.INACTIVE')}
                </>
              ) : (
                tcd('SETTINGS.GENERAL.DEFAULT_AGENT.NO_AGENTS_AVAILABLE')
              )}
            </p>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>
            <IoSettingsOutline />
            {tcd('SETTINGS.GENERAL.SHORTCUTS.TITLE')}
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>{tcd('SETTINGS.GENERAL.SHORTCUTS.LABEL')}</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="shortcut_to_send"
                  value="enter"
                  checked={editForm.shortcut_to_send === 'enter'}
                  onChange={(e) => handleInputChange('shortcut_to_send', e.target.value)}
                />
                <span className={styles.radioLabel}>{tcd('SETTINGS.GENERAL.SHORTCUTS.OPTIONS.ENTER')}</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="shortcut_to_send"
                  value="shift_enter"
                  checked={editForm.shortcut_to_send === 'shift_enter'}
                  onChange={(e) => handleInputChange('shortcut_to_send', e.target.value)}
                />
                <span className={styles.radioLabel}>{tcd('SETTINGS.GENERAL.SHORTCUTS.OPTIONS.SHIFT_ENTER')}</span>
              </label>
            </div>
            <p className={styles.helpText}>
              {tcd('SETTINGS.GENERAL.SHORTCUTS.HELP_TEXT')}
              {editForm.shortcut_to_send === 'enter' ?
                ` ${tcd('SETTINGS.GENERAL.SHORTCUTS.HELP_TEXT_ENTER')}` :
                ` ${tcd('SETTINGS.GENERAL.SHORTCUTS.HELP_TEXT_SHIFT_ENTER')}`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
