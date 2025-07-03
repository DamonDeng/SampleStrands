import { useState, useEffect } from 'react';
import { AppSetting } from '../utils/appSettingAPI';
import { IoSettingsOutline, IoListOutline, IoCodeSlashOutline } from 'react-icons/io5';
import { useAppTranslation } from '../contexts/I18nContext';
import styles from '../styles/SettingList.module.css';

interface SettingListProps {
  settings: AppSetting[];
  selectedSettingTitle: string | null;
  onSelectSetting: (settingTitle: string) => void;
  loading?: boolean;
  error?: string | null;
}

export default function SettingList({
  settings,
  selectedSettingTitle,
  onSelectSetting,
  loading = false,
  error = null
}: SettingListProps) {
  const { t: tcd } = useAppTranslation('settings');

  const getSettingIcon = (settingTitle: string) => {
    switch (settingTitle.toLowerCase()) {
      case 'general':
        return <IoSettingsOutline />;
      case 'advanced':
        return <IoCodeSlashOutline />;
      default:
        return <IoListOutline />;
    }
  };

  const getSettingDescription = (settingTitle: string) => {
    switch (settingTitle.toLowerCase()) {
      case 'general':
        return tcd('SETTINGS.CATEGORIES.DESCRIPTIONS.GENERAL');
      case 'advanced':
        return tcd('SETTINGS.CATEGORIES.DESCRIPTIONS.ADVANCED');
      default:
        return tcd('SETTINGS.CATEGORIES.DESCRIPTIONS.DEFAULT');
    }
  };

  const getSettingDisplayName = (settingTitle: string) => {
    switch (settingTitle.toLowerCase()) {
      case 'general':
        return tcd('SETTINGS.CATEGORIES.GENERAL');
      case 'advanced':
        return tcd('SETTINGS.CATEGORIES.ADVANCED');
      default:
        return settingTitle.charAt(0).toUpperCase() + settingTitle.slice(1);
    }
  };

  if (loading) {
    return (
      <div className={styles.settingList}>
        <div className={styles.header}>
          <h2 className={styles.title}>{tcd('SETTINGS.LIST.TITLE')}</h2>
          <div className={styles.settingCount}>...</div>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>{tcd('SETTINGS.LIST.LOADING')}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.settingList}>
        <div className={styles.header}>
          <h2 className={styles.title}>{tcd('SETTINGS.LIST.TITLE')}</h2>
        </div>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>{tcd('SETTINGS.LIST.FAILED_TO_LOAD')}</p>
          <p className={styles.errorSubtext}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingList}>
      <div className={styles.header}>
        <h2 className={styles.title}>{tcd('SETTINGS.LIST.TITLE')}</h2>
        <div className={styles.settingCount}>{settings.length}</div>
      </div>

      <div className={styles.settings}>
        {settings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><IoSettingsOutline /></div>
            <p className={styles.emptyText}>{tcd('SETTINGS.LIST.NO_SETTINGS')}</p>
            <p className={styles.emptySubtext}>{tcd('SETTINGS.LIST.NO_SETTINGS_DESCRIPTION')}</p>
          </div>
        ) : (
          settings.map((setting) => (
            <div
              key={setting.setting_title}
              className={`${styles.settingItem} ${
                selectedSettingTitle === setting.setting_title ? styles.active : ''
              }`}
              onClick={() => onSelectSetting(setting.setting_title)}
            >
              <div className={styles.settingContent}>
                <div className={styles.settingHeader}>
                  <div className={styles.settingIcon}>
                    {getSettingIcon(setting.setting_title)}
                  </div>
                  <div className={styles.settingInfo}>
                    <h3 className={styles.settingName}>
                      {getSettingDisplayName(setting.setting_title)}
                    </h3>
                    <p className={styles.settingDescription}>
                      {getSettingDescription(setting.setting_title)}
                    </p>
                  </div>
                </div>
                
                <div className={styles.settingMeta}>
                  <span className={styles.settingKeys}>
                    {Object.keys(setting.json_data).length} {tcd('SETTINGS.LIST.OPTIONS')}
                  </span>
                  <span className={styles.lastUpdated}>
                    {tcd('SETTINGS.LIST.UPDATED')} {formatDate(setting.updated_at, tcd)}
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function formatDate(dateString: string, tcd: any): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return tcd('SETTINGS.TIME.JUST_NOW');
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return tcd('SETTINGS.TIME.MINUTES_AGO', { count: minutes });
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return tcd('SETTINGS.TIME.HOURS_AGO', { count: hours });
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return tcd('SETTINGS.TIME.DAYS_AGO', { count: days });
  } else {
    return date.toLocaleDateString();
  }
}
