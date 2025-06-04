import React from 'react';
import { useModelSync } from '../hooks/use-model-sync';

/**
 * Component to display model sync status and provide manual sync controls
 * This component shows how to use the automatic model syncing functionality
 */
export function ModelSyncStatus() {
  const {
    syncStatus,
    syncResult,
    isLoading,
    hasError,
    modelCount,
    manualSync,
    forceSync,
  } = useModelSync();

  const getStatusIcon = () => {
    switch (syncStatus) {
      case 'checking':
        return '🔍';
      case 'syncing':
        return '⏳';
      case 'complete':
        return '✅';
      case 'error':
        return '❌';
      default:
        return '⚪';
    }
  };

  const getStatusColor = () => {
    switch (syncStatus) {
      case 'checking':
      case 'syncing':
        return '#1976d2';
      case 'complete':
        return '#388e3c';
      case 'error':
        return '#d32f2f';
      default:
        return '#666';
    }
  };

  return (
    <div className="model-sync-status">
      <div className="sync-header">
        <h4>Model Configuration Sync</h4>
        <div className="status-indicator" style={{ color: getStatusColor() }}>
          {getStatusIcon()} {syncStatus.charAt(0).toUpperCase() + syncStatus.slice(1)}
        </div>
      </div>

      <div className="sync-info">
        <div className="model-count">
          Models loaded: {modelCount}
        </div>
        
        {syncResult && (
          <div className={`sync-result ${hasError ? 'error' : 'success'}`}>
            {syncResult}
          </div>
        )}
      </div>

      <div className="sync-controls">
        <button
          onClick={manualSync}
          disabled={isLoading}
          className="sync-button"
        >
          {isLoading ? 'Checking...' : 'Check for Updates'}
        </button>
        
        <button
          onClick={forceSync}
          disabled={isLoading}
          className="sync-button force"
        >
          {isLoading ? 'Syncing...' : 'Force Reload'}
        </button>
      </div>

      <div className="sync-description">
        <small>
          The system automatically checks for model configuration updates when the app starts.
          Models are identified by UUID and updated only if their configVersion is newer.
        </small>
      </div>

      <style jsx>{`
        .model-sync-status {
          padding: 20px;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fafafa;
          max-width: 500px;
        }
        
        .sync-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }
        
        .sync-header h4 {
          margin: 0;
          color: #333;
        }
        
        .status-indicator {
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .sync-info {
          margin-bottom: 15px;
        }
        
        .model-count {
          color: #666;
          font-size: 0.9em;
          margin-bottom: 8px;
        }
        
        .sync-result {
          padding: 8px 12px;
          border-radius: 4px;
          font-size: 0.9em;
        }
        
        .sync-result.success {
          background: #e8f5e8;
          color: #2e7d2e;
          border: 1px solid #a5d6a7;
        }
        
        .sync-result.error {
          background: #ffebee;
          color: #c62828;
          border: 1px solid #ef9a9a;
        }
        
        .sync-controls {
          display: flex;
          gap: 10px;
          margin-bottom: 15px;
        }
        
        .sync-button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
          font-size: 0.9em;
          transition: all 0.2s;
        }
        
        .sync-button:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #bbb;
        }
        
        .sync-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        
        .sync-button.force {
          background: #fff3e0;
          border-color: #ffcc02;
          color: #e65100;
        }
        
        .sync-button.force:hover:not(:disabled) {
          background: #ffe0b2;
        }
        
        .sync-description {
          color: #666;
          line-height: 1.4;
        }
        
        .sync-description small {
          font-size: 0.8em;
        }
      `}</style>
    </div>
  );
}

/**
 * Simple hook to demonstrate automatic model syncing in your main app
 * Add this to your root component or layout to enable automatic syncing
 */
export function useAutoModelSync() {
  const { syncStatus, hasError, modelCount } = useModelSync();
  
  React.useEffect(() => {
    if (syncStatus === 'complete' && !hasError) {
      console.log(`✅ Model sync complete. ${modelCount} models loaded.`);
    } else if (hasError) {
      console.error('❌ Model sync failed:', syncStatus);
    }
  }, [syncStatus, hasError, modelCount]);
  
  return { syncStatus, hasError, modelCount };
} 