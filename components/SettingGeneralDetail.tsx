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
}

export default function SettingGeneralDetail({
  setting,
  agents,
  onUpdateSetting,
  onSettingChange
}: SettingGeneralDetailProps) {
  const [editForm, setEditForm] = useState<GeneralSettings>({
    language: setting.json_data.language || 'en',
    theme: setting.json_data.theme || 'dark',
    default_agent: setting.json_data.default_agent || null
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
        return 'Saving...';
      case 'saved':
        return 'Saved';
      case 'error':
        return 'Save failed';
      default:
        return hasUnsavedChanges ? 'Unsaved changes' : '';
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
            <h1 className={styles.settingName}>General Settings</h1>
            <p className={styles.settingDescription}>
              Configure language, theme, and default agent preferences
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
            Language
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Interface Language</label>
            <select
              className={styles.select}
              value={editForm.language}
              onChange={(e) => handleInputChange('language', e.target.value)}
            >
              <option value="en">English</option>
              <option value="zh">中文 (Chinese)</option>
              <option value="es">Español (Spanish)</option>
              <option value="fr">Français (French)</option>
              <option value="de">Deutsch (German)</option>
              <option value="ja">日本語 (Japanese)</option>
            </select>
            <p className={styles.helpText}>
              Select your preferred language for the application interface
            </p>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>
            <IoColorPaletteOutline />
            Appearance
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Theme</label>
            <div className={styles.radioGroup}>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={editForm.theme === 'dark'}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                />
                <span className={styles.radioLabel}>Dark</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={editForm.theme === 'light'}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                />
                <span className={styles.radioLabel}>Light</span>
              </label>
              <label className={styles.radioOption}>
                <input
                  type="radio"
                  name="theme"
                  value="auto"
                  checked={editForm.theme === 'auto'}
                  onChange={(e) => handleInputChange('theme', e.target.value)}
                />
                <span className={styles.radioLabel}>Auto</span>
              </label>
            </div>
            <p className={styles.helpText}>
              Choose your preferred color theme. Auto follows your system preference.
            </p>
          </div>
        </div>

        <div className={styles.settingSection}>
          <h3 className={styles.sectionTitle}>
            <IoPersonOutline />
            Default Agent
          </h3>
          <div className={styles.formGroup}>
            <label className={styles.label}>Default Agent for New Chats</label>
            <select
              className={styles.select}
              value={editForm.default_agent || ''}
              onChange={(e) => handleInputChange('default_agent', e.target.value || null)}
            >
              <option value="">No default agent</option>
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
                    {agent.config.name} {agent.is_active ? '✓' : '(inactive)'}
                  </option>
                ))
              }
            </select>
            <p className={styles.helpText}>
              Currently selected: <strong>{getActiveAgentName()}</strong>
              <br />
              {agents.length > 0 ? (
                <>
                  Available agents: {agents.filter(a => a.is_active).length} active, {agents.filter(a => !a.is_active).length} inactive
                </>
              ) : (
                'No agents available. Create agents in the Agent management section.'
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
