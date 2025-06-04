import { useEffect, useRef, useState } from 'react';
import { useBedrockModelsStore } from '../store/bedrock-models';

/**
 * Custom hook to automatically sync model configurations on app launch
 * This hook will:
 * 1. Load models from the store
 * 2. Check if config needs update based on version comparison
 * 3. Automatically sync if newer versions are available
 * 4. Provide sync status and manual sync capabilities
 */
export function useModelSync() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'checking' | 'syncing' | 'complete' | 'error'>('idle');
  const [syncResult, setSyncResult] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  
  const {
    models,
    isLoading,
    error,
    loadModels,
    checkConfigVersion,
    syncModelsWithConfig,
  } = useBedrockModelsStore();

  /**
   * Perform initial model sync check
   */
  const performInitialSync = async () => {
    if (hasInitialized.current) {
      console.log('[ModelSync] Already initialized, skipping');
      return;
    }
    hasInitialized.current = true;

    console.log('[ModelSync] Starting initial sync check...');
    console.log('[ModelSync] Current models count:', models.length);
    console.log('[ModelSync] Store loading state:', isLoading);
    console.log('[ModelSync] Store error state:', error);

    try {
      setSyncStatus('checking');
      setSyncResult(null);

      // If no models are loaded, load them first
      if (models.length === 0) {
        console.log('[ModelSync] No models in store, loading initial configuration...');
        await loadModels();
        setSyncStatus('complete');
        setSyncResult('Initial models loaded successfully');
        return;
      }

      // Check if config needs update
      console.log('[ModelSync] Checking for model configuration updates...');
      const needsUpdate = await checkConfigVersion();
      console.log('[ModelSync] Config needs update:', needsUpdate);

      if (needsUpdate) {
        console.log('[ModelSync] Model configuration updates found, syncing...');
        setSyncStatus('syncing');
        await syncModelsWithConfig();
        setSyncStatus('complete');
        setSyncResult('Models synchronized successfully');
      } else {
        console.log('[ModelSync] Model configuration is up to date');
        setSyncStatus('complete');
        setSyncResult('Models are up to date');
      }
    } catch (error) {
      console.error('[ModelSync] Failed to sync model configuration:', error);
      setSyncStatus('error');
      setSyncResult(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  /**
   * Manually trigger a sync check
   */
  const manualSync = async (): Promise<boolean> => {
    try {
      setSyncStatus('checking');
      setSyncResult(null);

      const needsUpdate = await checkConfigVersion();

      if (needsUpdate) {
        setSyncStatus('syncing');
        await syncModelsWithConfig();
        setSyncStatus('complete');
        setSyncResult('Manual sync completed successfully');
        return true;
      } else {
        setSyncStatus('complete');
        setSyncResult('No updates needed');
        return false;
      }
    } catch (error) {
      console.error('Manual sync failed:', error);
      setSyncStatus('error');
      setSyncResult(error instanceof Error ? error.message : 'Manual sync failed');
      return false;
    }
  };

  /**
   * Force reload all models from configuration
   */
  const forceSync = async (): Promise<boolean> => {
    try {
      setSyncStatus('syncing');
      setSyncResult(null);

      await loadModels();
      setSyncStatus('complete');
      setSyncResult('Force sync completed successfully');
      return true;
    } catch (error) {
      console.error('Force sync failed:', error);
      setSyncStatus('error');
      setSyncResult(error instanceof Error ? error.message : 'Force sync failed');
      return false;
    }
  };

  // Auto-sync on mount
  useEffect(() => {
    performInitialSync();
  }, []);

  // Handle loading errors
  useEffect(() => {
    if (error && syncStatus === 'idle') {
      setSyncStatus('error');
      setSyncResult(error);
    }
  }, [error, syncStatus]);

  return {
    syncStatus,
    syncResult,
    isLoading: isLoading || syncStatus === 'checking' || syncStatus === 'syncing',
    hasError: syncStatus === 'error' || !!error,
    modelCount: models.length,
    manualSync,
    forceSync,
  };
}

/**
 * Hook for components that just need to ensure models are loaded
 * This is a simpler version that just ensures models are available
 */
export function useEnsureModelsLoaded() {
  const { models, loadModels } = useBedrockModelsStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeModels = async () => {
      if (models.length === 0 && !isInitialized) {
        setIsInitialized(true);
        try {
          await loadModels();
        } catch (error) {
          console.error('Failed to load models:', error);
        }
      }
    };

    initializeModels();
  }, [models.length, loadModels, isInitialized]);

  return {
    models,
    isLoaded: models.length > 0,
  };
} 