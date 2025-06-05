/**
 * AWS Bedrock Model Configuration Types
 * 
 * These types are based on the AWS Bedrock model structure
 * and designed to simplify the model configuration system.
 */

export interface BedrockModelLifecycle {
  status: string;
}

export interface BedrockModel {
  /** AWS ARN for the model */
  modelArn: string;
  
  /** Model identifier */
  modelId: string;
  
  /** Human-readable model name */
  modelName: string;
  
  /** Provider name (e.g., "Amazon", "Anthropic") */
  providerName: string;
  
  /** Input modalities supported by the model */
  inputModalities: string[];
  
  /** Output modalities supported by the model */
  outputModalities: string[];
  
  /** Whether response streaming is supported */
  responseStreamingSupported: boolean;
  
  /** List of supported customizations */
  customizationsSupported: string[];
  
  /** List of supported inference types */
  inferenceTypesSupported: string[];
  
  /** Model lifecycle information */
  modelLifecycle: BedrockModelLifecycle;
  
  /** Whether the model is active in the application (handle both DDActive and DD_Active) */
  DDActive?: boolean;
  DD_Active?: boolean;
  
  /** Unique identifier for the model */
  uuid: string;
  
  /** Anthropic API version for Claude models */
  anthropicVersion: string;
  
  /** Whether this is a reasoning model */
  isReasoningModel: boolean;
  
  /** Configuration version for tracking updates */
  configVersion: string;
  
  /** List of supported parameters for this model (can be empty) */
  supportedParameters?: string[];
  
  /** Suggested parameter settings for optimal performance */
  suggestionSettings?: Record<string, any>;
}

export interface ModelConfigStore {
  /** List of available Bedrock models */
  models: BedrockModel[];
  
  /** Currently selected model ID */
  selectedModelId: string | null;
  
  /** Loading state */
  isLoading: boolean;
  
  /** Error state */
  error: string | null;
  
  /** Last update timestamp */
  lastUpdate: number;
  
  /** Version of the configuration schema */
  storeVersion: string;
  
  /** Track which models have had suggestion settings applied to avoid overwriting user changes */
  appliedSuggestions: Record<string, string>; // modelId -> configVersion when suggestions were applied
  
  /** Model-specific parameter configurations */
  modelParameters: Record<string, Record<string, any>>; // modelId -> parameter settings
}

export interface ModelConfigActions {
  /** Load models from configuration */
  loadModels: () => Promise<void>;
  
  /** Set the selected model */
  setSelectedModel: (modelId: string) => void;
  
  /** Get model by ID */
  getModelById: (modelId: string) => BedrockModel | undefined;
  
  /** Get all active models */
  getActiveModels: () => BedrockModel[];
  
  /** Get reasoning models only */
  getReasoningModels: () => BedrockModel[];
  
  /** Filter models based on criteria */
  filterModels: (criteria: ModelFilterCriteria) => BedrockModel[];
  
  /** Refresh models from remote source */
  refreshModels: () => Promise<void>;
  
  /** Reset to default state */
  reset: () => void;
  
  /** Get models grouped by provider */
  getModelsByProvider: () => Record<string, BedrockModel[]>;
  
  /** Get the currently selected model object */
  getSelectedModel: () => BedrockModel | null;
  
  /** Check if a model supports specific modalities */
  modelSupportsModalities: (modelId: string, inputModalities: string[], outputModalities: string[]) => boolean;
  
  /** Sync models with configuration file, updating only changed versions */
  syncModelsWithConfig: () => Promise<void>;
  
  /** Check if config needs update based on version comparison */
  checkConfigVersion: () => Promise<boolean>;
  
  /** Get supported parameters for a model */
  getSupportedParameters: (modelId: string) => string[];
  
  /** Get suggestion settings for a model, filtered by supported parameters */
  getSuggestionSettings: (modelId: string) => Record<string, any>;
  
  /** Apply suggestion settings if user hasn't modified them yet */
  applySuggestionSettingsIfNew: (modelId: string) => Record<string, any> | null;

  /** Get current parameter values for a model (custom values with suggestion fallback) */
  getCurrentParameterValues: (modelId: string, modelConfig?: any) => Record<string, any>;
  
  /** Update a specific parameter value for a specific model */
  updateParameterValue: (modelId: string, paramName: string, value: any) => void;
  
  /** Reset a parameter to its suggested value for a specific model */
  resetParameterToSuggestion: (modelId: string, paramName: string) => boolean;
  
  /** Get parameter type for proper input control rendering */
  getParameterType: (paramName: string) => 'number' | 'boolean' | 'string' | 'select';
  
  /** Get parameter constraints for validation */
  getParameterConstraints: (paramName: string) => { min?: number; max?: number; step?: number };

  /** Get all parameter values for a specific model (for use in API calls) */
  getModelParameters: (modelId: string) => Record<string, any>;
  
  /** Check if a model has custom parameter values */
  hasCustomParameters: (modelId: string) => boolean;
  
  /** Reset all parameters for a model to suggested values */
  resetAllParametersToSuggestion: (modelId: string) => boolean;
  
  /** Clear all custom parameters for a model (revert to suggestions only) */
  clearModelParameters: (modelId: string) => void;

  /** Get the final parameter values to use for API calls (custom + suggestion fallback) */
  getFinalParameterValues: (modelId: string) => Record<string, any>;
}

export type ModelConfigStoreState = ModelConfigStore & ModelConfigActions;

/**
 * Utility types for model filtering and selection
 */
export type ModelProvider = "Amazon" | "Anthropic" | "Meta" | "Mistral" | "Cohere" | "DeepSeek";

export type InputModality = "TEXT" | "IMAGE" | "VIDEO" | "AUDIO";

export type OutputModality = "TEXT" | "IMAGE";

export type InferenceType = "ON_DEMAND" | "PROVISIONED" | "INFERENCE_PROFILE";

export type CustomizationType = "FINE_TUNING" | "CONTINUED_PRE_TRAINING";

/**
 * Filter criteria for models
 */
export interface ModelFilterCriteria {
  provider?: ModelProvider;
  inputModalities?: InputModality[];
  outputModalities?: OutputModality[];
  supportsStreaming?: boolean;
  isActive?: boolean;
  isReasoningModel?: boolean;
}

/**
 * Model update result for version sync
 */
export interface ModelUpdateResult {
  /** Number of models updated */
  updated: number;
  
  /** Number of models added */
  added: number;
  
  /** Number of models removed */
  removed: number;
  
  /** UUIDs of models that were updated */
  updatedUuids: string[];
  
  /** UUIDs of models that were added */
  addedUuids: string[];
  
  /** UUIDs of models that were removed */
  removedUuids: string[];
} 