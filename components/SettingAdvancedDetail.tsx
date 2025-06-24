import { AppSetting } from '../utils/appSettingAPI';
import {
  IoCodeSlashOutline,
  IoConstructOutline,
  IoInformationCircleOutline
} from 'react-icons/io5';
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

  return (
    <div className={styles.settingDetail}>
      <div className={styles.header}>
        <div className={styles.titleSection}>
          <div className={styles.settingIcon}>
            <IoCodeSlashOutline />
          </div>
          <div className={styles.titleInfo}>
            <h1 className={styles.settingName}>Advanced Settings</h1>
            <p className={styles.settingDescription}>
              Advanced configuration options for power users
            </p>
          </div>
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.placeholderSection}>
          <div className={styles.placeholderIcon}>
            <IoConstructOutline />
          </div>
          <h2 className={styles.placeholderTitle}>Coming Soon</h2>
          <p className={styles.placeholderText}>
            Advanced settings will be available in a future update. This section will include:
          </p>
          
          <div className={styles.featureList}>
            <div className={styles.featureItem}>
              <IoInformationCircleOutline className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Debug Options</h4>
                <p className={styles.featureDescription}>
                  Enable detailed logging and debugging features
                </p>
              </div>
            </div>
            
            <div className={styles.featureItem}>
              <IoInformationCircleOutline className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Performance Settings</h4>
                <p className={styles.featureDescription}>
                  Configure memory usage, cache settings, and optimization options
                </p>
              </div>
            </div>
            
            <div className={styles.featureItem}>
              <IoInformationCircleOutline className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Developer Tools</h4>
                <p className={styles.featureDescription}>
                  API endpoints, webhook configurations, and integration settings
                </p>
              </div>
            </div>
            
            <div className={styles.featureItem}>
              <IoInformationCircleOutline className={styles.featureIcon} />
              <div className={styles.featureContent}>
                <h4 className={styles.featureTitle}>Experimental Features</h4>
                <p className={styles.featureDescription}>
                  Beta features and experimental functionality toggles
                </p>
              </div>
            </div>
          </div>
          
          <div className={styles.infoBox}>
            <IoInformationCircleOutline className={styles.infoIcon} />
            <div className={styles.infoContent}>
              <p className={styles.infoText}>
                <strong>Note:</strong> This is a placeholder page. Advanced settings functionality 
                will be implemented based on user feedback and requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
