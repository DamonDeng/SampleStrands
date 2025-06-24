import { useState, useEffect } from 'react';
import { AppSetting } from '../utils/appSettingAPI';
import { IoSettingsOutline, IoListOutline, IoCodeSlashOutline } from 'react-icons/io5';
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
        return 'Language, theme, and default agent settings';
      case 'advanced':
        return 'Advanced configuration options';
      default:
        return 'Custom application settings';
    }
  };

  const getSettingDisplayName = (settingTitle: string) => {
    return settingTitle.charAt(0).toUpperCase() + settingTitle.slice(1);
  };

  if (loading) {
    return (
      <div className={styles.settingList}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
          <div className={styles.settingCount}>...</div>
        </div>
        <div className={styles.loadingState}>
          <div className={styles.loadingSpinner}></div>
          <p className={styles.loadingText}>Loading settings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.settingList}>
        <div className={styles.header}>
          <h2 className={styles.title}>Settings</h2>
        </div>
        <div className={styles.errorState}>
          <div className={styles.errorIcon}>⚠️</div>
          <p className={styles.errorText}>Failed to load settings</p>
          <p className={styles.errorSubtext}>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.settingList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Settings</h2>
        <div className={styles.settingCount}>{settings.length}</div>
      </div>

      <div className={styles.settings}>
        {settings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><IoSettingsOutline /></div>
            <p className={styles.emptyText}>No settings available</p>
            <p className={styles.emptySubtext}>Settings will appear here when available</p>
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
                    {Object.keys(setting.json_data).length} options
                  </span>
                  <span className={styles.lastUpdated}>
                    Updated {formatDate(setting.updated_at)}
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

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'just now';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    return date.toLocaleDateString();
  }
}
