import { StoreKey } from "../constant";
import { createPersistStore } from "../utils/store";
import {
  BedrockModel,
  ModelConfigStore,
  ModelConfigActions,
  ModelFilterCriteria,
  ModelUpdateResult,
} from "../types/model";

/**
 * Default Bedrock models configuration
 * This will be loaded from the JSON file or remote endpoint
 */
const DEFAULT_BEDROCK_MODELS: BedrockModel[] = [];

/**
 * Default store state
 */
const DEFAULT_MODEL_CONFIG_STATE: ModelConfigStore = {
  models: DEFAULT_BEDROCK_MODELS,
  selectedModelId: null,
  isLoading: false,
  error: null,
  lastUpdate: Date.now(),
  storeVersion: "1.0",
  appliedSuggestions: {},
  modelParameters: {},
};

/**
 * Helper function to get DDActive value from either DDActive or DD_Active
 */
function getModelActiveStatus(model: BedrockModel): boolean {
  return model.DDActive ?? model.DD_Active ?? false;
}

/**
 * Compare two version strings (e.g., "0.1", "0.2", "1.0")
 * Returns: 1 if version1 > version2, -1 if version1 < version2, 0 if equal
 */
function compareVersions(version1: string, version2: string): number {
  const v1 = parseFloat(version1) || 0;
  const v2 = parseFloat(version2) || 0;
  
  if (v1 > v2) return 1;
  if (v1 < v2) return -1;
  return 0;
}

/**
 * Bedrock Models Configuration Store
 * 
 * This store manages AWS Bedrock model configurations, supporting:
 * - Model loading from JSON configuration
 * - Model selection and filtering
 * - Remote model refresh capabilities
 * - Version-based configuration syncing
 */
export const useBedrockModelsStore = createPersistStore(
  DEFAULT_MODEL_CONFIG_STATE,
  (set, get) => ({
    /**
     * Load models from the default configuration file
     */
    async loadModels() {
      console.log('[BedrockModels] Starting loadModels...');
      set({ isLoading: true, error: null });
      
      try {
        console.log('[BedrockModels] Fetching from /ddconfig/default_models.json');
        
        // Load models from the JSON file
        const response = await fetch('/ddconfig/default_models.json');
        console.log('[BedrockModels] Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          throw new Error(`Failed to load models: ${response.status} ${response.statusText}`);
        }
        
        const text = await response.text();
        console.log('[BedrockModels] Response text length:', text.length);
        console.log('[BedrockModels] Response preview:', text.substring(0, 200) + '...');
        
        let models: BedrockModel[];
        try {
          models = JSON.parse(text);
          console.log('[BedrockModels] Successfully parsed JSON, found', models.length, 'models');
        } catch (parseError) {
          console.error('[BedrockModels] JSON parse error:', parseError);
          console.log('[BedrockModels] Invalid JSON content:', text.substring(0, 500));
          throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown parse error'}`);
        }
        
        // Validate models array
        if (!Array.isArray(models)) {
          throw new Error('Expected an array of models');
        }
        
        console.log('[BedrockModels] Model validation:');
        models.forEach((model, index) => {
          console.log(`[BedrockModels] Model ${index}:`, {
            name: model.modelName,
            id: model.modelId,
            provider: model.providerName,
            uuid: model.uuid,
            active: model.DDActive ?? model.DD_Active,
            configVersion: model.configVersion,
          });
        });
        
        set({
          models,
          isLoading: false,
          lastUpdate: Date.now(),
          error: null,
        });
        
        console.log('[BedrockModels] Successfully loaded', models.length, 'models');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('[BedrockModels] Failed to load Bedrock models:', errorMessage);
        console.error('[BedrockModels] Full error:', error);
        
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    /**
     * Set the currently selected model
     */
    setSelectedModel(modelId: string) {
      const state = get();
      const model = state.models.find(m => m.modelId === modelId);
      if (model && getModelActiveStatus(model)) {
        set({ selectedModelId: modelId });
      } else {
        console.warn(`Model ${modelId} not found or not active`);
      }
    },

    /**
     * Get a model by its ID
     */
    getModelById(modelId: string): BedrockModel | undefined {
      const state = get();
      return state.models.find(model => model.modelId === modelId);
    },

    /**
     * Get all active models
     */
    getActiveModels(): BedrockModel[] {
      const state = get();
      return state.models.filter(model => getModelActiveStatus(model));
    },

    /**
     * Get reasoning models only
     */
    getReasoningModels(): BedrockModel[] {
      const state = get();
      return state.models.filter(model => model.isReasoningModel && getModelActiveStatus(model));
    },

    /**
     * Filter models based on criteria
     */
    filterModels(criteria: ModelFilterCriteria): BedrockModel[] {
      const state = get();
      return state.models.filter(model => {
        // Check provider
        if (criteria.provider && model.providerName !== criteria.provider) {
          return false;
        }

        // Check input modalities
        if (criteria.inputModalities) {
          const hasRequiredInputs = criteria.inputModalities.every(modality =>
            model.inputModalities.includes(modality)
          );
          if (!hasRequiredInputs) return false;
        }

        // Check output modalities
        if (criteria.outputModalities) {
          const hasRequiredOutputs = criteria.outputModalities.every(modality =>
            model.outputModalities.includes(modality)
          );
          if (!hasRequiredOutputs) return false;
        }

        // Check streaming support
        if (criteria.supportsStreaming !== undefined && 
            model.responseStreamingSupported !== criteria.supportsStreaming) {
          return false;
        }

        // Check active status
        if (criteria.isActive !== undefined && getModelActiveStatus(model) !== criteria.isActive) {
          return false;
        }

        // Check reasoning model
        if (criteria.isReasoningModel !== undefined && 
            model.isReasoningModel !== criteria.isReasoningModel) {
          return false;
        }

        return true;
      });
    },

    /**
     * Check if config needs update based on version comparison
     */
    async checkConfigVersion(): Promise<boolean> {
      try {
        const response = await fetch('/ddconfig/default_models.json');
        if (!response.ok) {
          console.warn('Failed to fetch config file for version check');
          return false;
        }
        
        const configModels: BedrockModel[] = await response.json();
        const state = get();
        const storedModels = state.models;
        
        // Create maps for easy lookup
        const storedModelMap = new Map(storedModels.map(model => [model.uuid, model]));
        const configModelMap = new Map(configModels.map(model => [model.uuid, model]));
        
        // Check if any config model has a newer version
        for (const [uuid, configModel] of configModelMap) {
          const storedModel = storedModelMap.get(uuid);
          
          if (!storedModel) {
            // New model found
            return true;
          }
          
          const versionComparison = compareVersions(configModel.configVersion, storedModel.configVersion);
          if (versionComparison > 0) {
            // Config has newer version
            return true;
          }
        }
        
        // Check if any stored model is no longer in config
        for (const uuid of storedModelMap.keys()) {
          if (!configModelMap.has(uuid)) {
            // Model removed from config
            return true;
          }
        }
        
        return false;
      } catch (error) {
        console.error('Error checking config version:', error);
        return false;
      }
    },

    /**
     * Sync models with configuration file, updating only changed versions
     */
    async syncModelsWithConfig(): Promise<void> {
      set({ isLoading: true, error: null });
      
      try {
        const response = await fetch('/ddconfig/default_models.json');
        if (!response.ok) {
          throw new Error(`Failed to load config: ${response.statusText}`);
        }
        
        const configModels: BedrockModel[] = await response.json();
        const state = get();
        const storedModels = state.models;
        
        // Create maps for easy lookup
        const storedModelMap = new Map(storedModels.map(model => [model.uuid, model]));
        const configModelMap = new Map(configModels.map(model => [model.uuid, model]));
        
        const result: ModelUpdateResult = {
          updated: 0,
          added: 0,
          removed: 0,
          updatedUuids: [],
          addedUuids: [],
          removedUuids: [],
        };
        
        const updatedModels: BedrockModel[] = [];
        
        // Process config models
        for (const [uuid, configModel] of configModelMap) {
          const storedModel = storedModelMap.get(uuid);
          
          if (!storedModel) {
            // New model
            updatedModels.push(configModel);
            result.added++;
            result.addedUuids.push(uuid);
            console.log(`Added new model: ${configModel.modelName} (${uuid})`);
          } else {
            const versionComparison = compareVersions(configModel.configVersion, storedModel.configVersion);
            
            if (versionComparison > 0) {
              // Config has newer version, update it
              updatedModels.push(configModel);
              result.updated++;
              result.updatedUuids.push(uuid);
              console.log(`Updated model: ${configModel.modelName} (${storedModel.configVersion} -> ${configModel.configVersion})`);
            } else {
              // Keep existing model
              updatedModels.push(storedModel);
            }
          }
        }
        
        // Check for removed models
        for (const [uuid, storedModel] of storedModelMap) {
          if (!configModelMap.has(uuid)) {
            result.removed++;
            result.removedUuids.push(uuid);
            console.log(`Removed model: ${storedModel.modelName} (${uuid})`);
          }
        }
        
        // Update store with synced models
        set({
          models: updatedModels,
          isLoading: false,
          lastUpdate: Date.now(),
          error: null,
        });
        
        console.log('Model sync complete:', result);
        
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to sync models with config:', errorMessage);
        
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    /**
     * Refresh models from remote source
     */
    async refreshModels() {
      set({ isLoading: true, error: null });
      
      try {
        // Try to fetch from remote endpoint first
        let models: BedrockModel[] = [];
        
        try {
          const response = await fetch('https://eiai.fun/bedrock-models.json');
          if (response.ok) {
            models = await response.json();
          } else {
            throw new Error('Remote fetch failed, falling back to local');
          }
        } catch {
          // Fallback to local JSON file
          const response = await fetch('/ddconfig/default_models.json');
          if (!response.ok) {
            throw new Error(`Failed to load models: ${response.statusText}`);
          }
          models = await response.json();
        }
        
        set({
          models,
          isLoading: false,
          lastUpdate: Date.now(),
          error: null,
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error('Failed to refresh Bedrock models:', errorMessage);
        
        set({
          error: errorMessage,
          isLoading: false,
        });
      }
    },

    /**
     * Reset store to default state
     */
    reset() {
      set(DEFAULT_MODEL_CONFIG_STATE);
    },

    /**
     * Get models grouped by provider
     */
    getModelsByProvider(): Record<string, BedrockModel[]> {
      const state = get();
      const activeModels = state.models.filter(model => getModelActiveStatus(model));
      return activeModels.reduce((acc: Record<string, BedrockModel[]>, model: BedrockModel) => {
        const provider = model.providerName;
        if (!acc[provider]) {
          acc[provider] = [];
        }
        acc[provider].push(model);
        return acc;
      }, {});
    },

    /**
     * Get the currently selected model object
     */
    getSelectedModel(): BedrockModel | null {
      const state = get();
      const { selectedModelId } = state;
      if (!selectedModelId) return null;
      return state.models.find(model => model.modelId === selectedModelId) || null;
    },

    /**
     * Check if a model supports specific modalities
     */
    modelSupportsModalities(modelId: string, inputModalities: string[], outputModalities: string[]): boolean {
      const state = get();
      const model = state.models.find(m => m.modelId === modelId);
      if (!model) return false;

      const hasInputs = inputModalities.every(modality => 
        model.inputModalities.includes(modality)
      );
      const hasOutputs = outputModalities.every(modality => 
        model.outputModalities.includes(modality)
      );

      return hasInputs && hasOutputs;
    },

    /**
     * Get supported parameters for a model
     */
    getSupportedParameters(modelId: string): string[] {
      const state = get();
      const model = state.models.find(m => m.modelId === modelId);
      return model?.supportedParameters || [];
    },

    /**
     * Get suggestion settings for a model, filtered by supported parameters
     */
    getSuggestionSettings(modelId: string): Record<string, any> {
      const state = get();
      const model = state.models.find(m => m.modelId === modelId);
      
      if (!model?.suggestionSettings) {
        return {};
      }
      
      const supportedParams = model.supportedParameters || [];
      const filteredSettings: Record<string, any> = {};
      
      // Only include settings for supported parameters
      supportedParams.forEach(param => {
        if (param in model.suggestionSettings!) {
          filteredSettings[param] = model.suggestionSettings![param];
        }
      });
      
      console.log(`[BedrockModels] Suggestion settings for ${modelId}:`, {
        supportedParams,
        allSuggestions: model.suggestionSettings,
        filteredSettings,
      });
      
      return filteredSettings;
    },

    /**
     * Apply suggestion settings if user hasn't modified them yet
     * Returns the suggested settings if they should be applied, null otherwise
     */
    applySuggestionSettingsIfNew(modelId: string): Record<string, any> | null {
      const state = get();
      const model = state.models.find(m => m.modelId === modelId);
      
      if (!model?.suggestionSettings || !model.supportedParameters?.length) {
        console.log(`[BedrockModels] No suggestions available for ${modelId}`);
        return null;
      }
      
      const lastAppliedVersion = state.appliedSuggestions[modelId];
      
      // Rule 4: Update if supportedParameters was not set before (first time)
      if (!lastAppliedVersion) {
        console.log(`[BedrockModels] First time applying suggestions for ${modelId}`);
        const suggestions = this.getSuggestionSettings(modelId);
        
        // Mark as applied
        set((state) => ({
          ...state,
          appliedSuggestions: {
            ...state.appliedSuggestions,
            [modelId]: model.configVersion,
          },
        }));
        
        return suggestions;
      }
      
      // Rule 3: Don't overwrite user modifications even if configVersion is newer
      console.log(`[BedrockModels] Suggestions already applied for ${modelId} at version ${lastAppliedVersion}, skipping`);
      return null;
    },

    /**
     * Get current parameter values for a model
     * Returns a combination of user's custom values and suggestion values as fallback
     */
    getCurrentParameterValues(modelId: string, modelConfig?: any): Record<string, any> {
      const state = get();
      const model = state.models.find(m => m.modelId === modelId);
      
      if (!model?.suggestionSettings) {
        return {};
      }
      
      const supportedParams = model.supportedParameters || [];
      const filteredSuggestionSettings: Record<string, any> = {};
      
      // Get filtered suggestion settings (same logic as getSuggestionSettings)
      supportedParams.forEach(param => {
        if (param in model.suggestionSettings!) {
          filteredSuggestionSettings[param] = model.suggestionSettings![param];
        }
      });
      
      const currentValues: Record<string, any> = {};
      const modelSpecificParams = state.modelParameters[modelId] || {};
      
      supportedParams.forEach(param => {
        // Use model-specific custom value if available, otherwise use suggestion
        if (modelSpecificParams[param] !== undefined) {
          currentValues[param] = modelSpecificParams[param];
        } else if (filteredSuggestionSettings[param] !== undefined) {
          currentValues[param] = filteredSuggestionSettings[param];
        }
      });
      
      return currentValues;
    },

    /**
     * Update a specific parameter value for a specific model
     * This is used by the UI to save user edits
     */
    updateParameterValue(modelId: string, paramName: string, value: any) {
      console.log(`[BedrockModels] Updating parameter ${paramName} to ${value} for model ${modelId}`);
      
      set((state) => ({
        ...state,
        modelParameters: {
          ...state.modelParameters,
          [modelId]: {
            ...state.modelParameters[modelId],
            [paramName]: value,
          },
        },
      }));
    },

    /**
     * Reset a parameter to its suggested value for a specific model
     */
    resetParameterToSuggestion(modelId: string, paramName: string): boolean {
      const state = get();
      const model = state.models.find(m => m.modelId === modelId);
      
      if (!model?.suggestionSettings) {
        console.log(`[BedrockModels] No suggestions available for ${modelId}`);
        return false;
      }
      
      const supportedParams = model.supportedParameters || [];
      const filteredSuggestionSettings: Record<string, any> = {};
      
      // Get filtered suggestion settings (same logic as getSuggestionSettings)
      supportedParams.forEach(param => {
        if (param in model.suggestionSettings!) {
          filteredSuggestionSettings[param] = model.suggestionSettings![param];
        }
      });
      
      if (filteredSuggestionSettings[paramName] !== undefined) {
        console.log(`[BedrockModels] Resetting parameter ${paramName} to suggested value:`, filteredSuggestionSettings[paramName]);
        
        set((state) => ({
          ...state,
          modelParameters: {
            ...state.modelParameters,
            [modelId]: {
              ...state.modelParameters[modelId],
              [paramName]: filteredSuggestionSettings[paramName],
            },
          },
        }));
        
        return true;
      }
      
      console.log(`[BedrockModels] No suggestion available for parameter ${paramName}`);
      return false;
    },

    /**
     * Get all parameter values for a specific model (for use in API calls)
     */
    getModelParameters(modelId: string): Record<string, any> {
      const state = get();
      return state.modelParameters[modelId] || {};
    },

    /**
     * Check if a model has custom parameter values
     */
    hasCustomParameters(modelId: string): boolean {
      const state = get();
      const modelParams = state.modelParameters[modelId];
      return modelParams && Object.keys(modelParams).length > 0;
    },

    /**
     * Reset all parameters for a model to suggested values
     */
    resetAllParametersToSuggestion(modelId: string): boolean {
      const state = get();
      const model = state.models.find(m => m.modelId === modelId);
      
      if (!model?.suggestionSettings) {
        console.log(`[BedrockModels] No suggestions available for ${modelId}`);
        return false;
      }
      
      const supportedParams = model.supportedParameters || [];
      const filteredSuggestionSettings: Record<string, any> = {};
      
      // Get filtered suggestion settings (same logic as getSuggestionSettings)
      supportedParams.forEach(param => {
        if (param in model.suggestionSettings!) {
          filteredSuggestionSettings[param] = model.suggestionSettings![param];
        }
      });
      
      if (Object.keys(filteredSuggestionSettings).length === 0) {
        console.log(`[BedrockModels] No suggestions available for ${modelId}`);
        return false;
      }
      
      console.log(`[BedrockModels] Resetting all parameters for ${modelId} to suggestions:`, filteredSuggestionSettings);
      
      set((state) => ({
        ...state,
        modelParameters: {
          ...state.modelParameters,
          [modelId]: { ...filteredSuggestionSettings },
        },
      }));
      
      return true;
    },

    /**
     * Clear all custom parameters for a model (revert to suggestions only)
     */
    clearModelParameters(modelId: string) {
      console.log(`[BedrockModels] Clearing custom parameters for ${modelId}`);
      
      set((state) => {
        const newModelParameters = { ...state.modelParameters };
        delete newModelParameters[modelId];
        
        return {
          ...state,
          modelParameters: newModelParameters,
        };
      });
    },

    /**
     * Get parameter type for proper input control rendering
     */
    getParameterType(paramName: string): 'number' | 'boolean' | 'string' | 'select' {
      const numberParams = ['temperature', 'top_p', 'top_k', 'max_tokens', 'max_tokens_to_sample'];
      const booleanParams = ['stream', 'stop_sequences'];
      
      if (numberParams.includes(paramName)) {
        return 'number';
      } else if (booleanParams.includes(paramName)) {
        return 'boolean';
      } else {
        return 'string';
      }
    },

    /**
     * Get parameter constraints for validation
     */
    getParameterConstraints(paramName: string): { min?: number; max?: number; step?: number } {
      const constraints: Record<string, { min?: number; max?: number; step?: number }> = {
        temperature: { min: 0, max: 1, step: 0.1 },
        top_p: { min: 0, max: 1, step: 0.01 },
        top_k: { min: 1, max: 500, step: 1 },
        max_tokens: { min: 1, max: 8192, step: 1 },
        max_tokens_to_sample: { min: 1, max: 8192, step: 1 },
      };
      
      return constraints[paramName] || {};
    },

    /**
     * Get the final parameter values to use for API calls
     * Returns custom values if set, otherwise falls back to suggestions
     */
    getFinalParameterValues(modelId: string): Record<string, any> {
      const state = get();
      const model = state.models.find(m => m.modelId === modelId);
      
      if (!model?.supportedParameters) {
        return {};
      }
      
      const supportedParams = model.supportedParameters;
      const modelSpecificParams = state.modelParameters[modelId] || {};
      const suggestionSettings = model.suggestionSettings || {};
      
      const finalValues: Record<string, any> = {};
      
      supportedParams.forEach(param => {
        // Priority: custom value > suggestion value
        if (modelSpecificParams[param] !== undefined) {
          finalValues[param] = modelSpecificParams[param];
        } else if (suggestionSettings[param] !== undefined) {
          finalValues[param] = suggestionSettings[param];
        }
      });
      
      console.log(`[BedrockModels] Final parameter values for ${modelId}:`, finalValues);
      return finalValues;
    },
  }),
  {
    name: StoreKey.BedrockModels,
    version: 1.3, // Increased version for model-specific parameters feature
    migrate(persistedState, version) {
      const state = persistedState as any;
      
      // Add storeVersion if it doesn't exist
      if (!state.storeVersion) {
        state.storeVersion = "1.0";
      }
      
      // Add appliedSuggestions if it doesn't exist
      if (!state.appliedSuggestions) {
        state.appliedSuggestions = {};
      }
      
      // Add modelParameters if it doesn't exist
      if (!state.modelParameters) {
        state.modelParameters = {};
      }
      
      // Ensure all models have configVersion
      if (state.models && Array.isArray(state.models)) {
        state.models = state.models.map((model: any) => ({
          ...model,
          configVersion: model.configVersion || "0.0",
          supportedParameters: model.supportedParameters || [],
          suggestionSettings: model.suggestionSettings || {},
        }));
      }
      
      return state;
    },
  },
); 