import { AppSetting } from '../utils/appSettingAPI';
import {
  IoCodeSlashOutline,
  IoConstructOutline
} from 'react-icons/io5';
import { useTranslation } from 'react-i18next';
import styles from '../styles/SettingAdvancedDetail.module.css';

interface SettingAdvancedDetailProps {
  setting: AppSetting;
  onUpdateSetting: (settingTitle: string, jsonData: Record<string, any>) => void;
  onSettingChange?: () => void; // Called when navigating away from this setting
}

export default function SettingAdvancedDetail({
  setting,
  onUpdateSetting,
  onSettingChange
}: SettingAdvancedDetailProps) {
  const { t } = useTranslation('settings');

  return (
    <div className={styles.settingDetail}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.settingIcon}>
            <IoCodeSlashOutline />
          </div>
          <div className={styles.titleInfo}>
            <h1 className={styles.settingName}>{t('advanced.title')}</h1>
            <p className={styles.settingDescription}>
              {t('advanced.description')}
            </p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.placeholderSection}>
          <div className={styles.placeholderIcon}>
            <IoConstructOutline />
          </div>
          <h2 className={styles.placeholderTitle}>{t('advanced.comingSoon')}</h2>
          <p className={styles.placeholderText}>
            {t('advanced.comingSoonDescription')}
          </p>
        </div>
      </div>
    </div>
  );
}
