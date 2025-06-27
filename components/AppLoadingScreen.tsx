import { useEffect, useState } from 'react';
import { IoRocketOutline, IoCheckmarkCircle, IoCloseCircle, IoTimeOutline } from 'react-icons/io5';
import styles from '../styles/AppLoadingScreen.module.css';

interface AppLoadingScreenProps {
  backendAvailable: boolean;
  isLoading: boolean;
}

export default function AppLoadingScreen({ backendAvailable, isLoading }: AppLoadingScreenProps) {
  const [dots, setDots] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);

  // Animated dots for loading
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => {
        if (prev === '...') return '';
        return prev + '.';
      });
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Track time elapsed
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      setTimeElapsed(Math.floor((Date.now() - startTime) / 1000));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const getStatusIcon = () => {
    if (backendAvailable) {
      return <IoCheckmarkCircle className={styles.successIcon} />;
    } else if (isLoading) {
      return <IoTimeOutline className={styles.loadingIcon} />;
    } else {
      return <IoCloseCircle className={styles.errorIcon} />;
    }
  };

  const getStatusText = () => {
    if (backendAvailable) {
      return 'Backend connected successfully!';
    } else if (isLoading) {
      return `Connecting to backend${dots}`;
    } else {
      return 'Failed to connect to backend';
    }
  };

  const getSubText = () => {
    if (backendAvailable) {
      return 'Loading application data...';
    } else if (isLoading) {
      return 'Starting Python backend service...';
    } else {
      return 'Please check that the Python backend is running';
    }
  };

  return (
    <div className={styles.loadingScreen}>
      <div className={styles.loadingContent}>
        {/* App Logo/Icon */}
        <div className={styles.appIcon}>
          <IoRocketOutline />
        </div>

        {/* App Title */}
        <h1 className={styles.appTitle}>SampleStrands</h1>

        {/* Status Section */}
        <div className={styles.statusSection}>
          {getStatusIcon()}
          <p className={styles.statusText}>{getStatusText()}</p>
          <p className={styles.subText}>{getSubText()}</p>
        </div>

        {/* Progress Indicators */}
        <div className={styles.progressSection}>
          <div className={styles.progressItem}>
            <div className={`${styles.progressDot} ${isLoading ? styles.active : backendAvailable ? styles.complete : styles.pending}`} />
            <span className={styles.progressLabel}>Backend Service</span>
          </div>
          <div className={styles.progressItem}>
            <div className={`${styles.progressDot} ${backendAvailable && !isLoading ? styles.active : backendAvailable ? styles.complete : styles.pending}`} />
            <span className={styles.progressLabel}>Application Data</span>
          </div>
        </div>

        {/* Time Elapsed */}
        {timeElapsed > 5 && (
          <div className={styles.timeElapsed}>
            <p>Time elapsed: {timeElapsed}s</p>
            {timeElapsed > 15 && !backendAvailable && (
              <p className={styles.helpText}>
                If this takes too long, try restarting the application
              </p>
            )}
          </div>
        )}

        {/* Loading Animation */}
        {(isLoading || !backendAvailable) && (
          <div className={styles.loadingAnimation}>
            <div className={styles.spinner}></div>
          </div>
        )}
      </div>
    </div>
  );
}
