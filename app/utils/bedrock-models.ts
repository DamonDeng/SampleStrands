import { LLMModel } from "../client/api";
import { BedrockModel } from "../types/model";

/**
 * Utility functions for working with Bedrock models
 * and bridging between old and new model formats
 */

/**
 * Helper function to get DDActive value from either DDActive or DD_Active
 */
function getModelActiveStatus(model: BedrockModel): boolean {
  return model.DDActive ?? model.DD_Active ?? false;
}

/**
 * Convert a BedrockModel to the legacy LLMModel format
 * This helps with gradual migration from the old format
 */
export function bedrockToLLMModel(bedrockModel: BedrockModel): LLMModel {
  return {
    name: bedrockModel.modelId,
    available: getModelActiveStatus(bedrockModel),
    modelId: bedrockModel.modelId,
    anthropic_version: bedrockModel.anthropicVersion,
    displayName: bedrockModel.modelName,
    provider: {
      id: "aws",
      providerName: bedrockModel.providerName,
      providerType: "aws",
    },
  };
}

/**
 * Convert multiple BedrockModels to LLMModels
 */
export function bedrockModelsToLLMModels(bedrockModels: BedrockModel[]): LLMModel[] {
  return bedrockModels.map(bedrockToLLMModel);
}

/**
 * Get default model selection based on capabilities
 * Returns the first active reasoning model, or first active model
 */
export function getDefaultSelectedModel(models: BedrockModel[]): BedrockModel | null {
  const activeModels = models.filter(model => getModelActiveStatus(model));
  
  if (activeModels.length === 0) {
    return null;
  }
  
  // Prefer reasoning models
  const reasoningModel = activeModels.find(model => model.isReasoningModel);
  if (reasoningModel) {
    return reasoningModel;
  }
  
  // Fallback to first active model
  return activeModels[0];
}

/**
 * Check if a model supports multimodal input (text + image/video)
 */
export function isMultimodalModel(model: BedrockModel): boolean {
  return model.inputModalities.includes("TEXT") && 
         (model.inputModalities.includes("IMAGE") || model.inputModalities.includes("VIDEO"));
}

/**
 * Check if a model supports vision capabilities
 */
export function isVisionModel(model: BedrockModel): boolean {
  return model.inputModalities.includes("IMAGE") || model.inputModalities.includes("VIDEO");
}

/**
 * Get models by provider name
 */
export function getModelsByProvider(models: BedrockModel[], providerName: string): BedrockModel[] {
  return models.filter(model => model.providerName === providerName && getModelActiveStatus(model));
}

/**
 * Find the best model for a specific use case
 */
export function findBestModelForUseCase(
  models: BedrockModel[], 
  useCase: 'reasoning' | 'multimodal' | 'text' | 'fast'
): BedrockModel | null {
  const activeModels = models.filter(model => getModelActiveStatus(model));
  
  switch (useCase) {
    case 'reasoning':
      return activeModels.find(model => model.isReasoningModel) || null;
      
    case 'multimodal':
      return activeModels.find(model => isMultimodalModel(model)) || null;
      
    case 'text':
      return activeModels.find(model => 
        model.inputModalities.includes("TEXT") && 
        model.outputModalities.includes("TEXT")
      ) || null;
      
    case 'fast':
      // Prefer models with "haiku" in the name for faster responses
      return activeModels.find(model => 
        model.modelName.toLowerCase().includes('haiku')
      ) || activeModels[0] || null;
      
    default:
      return activeModels[0] || null;
  }
}

/**
 * Validate a Bedrock model configuration
 */
export function validateBedrockModel(model: any): model is BedrockModel {
  return (
    typeof model === 'object' &&
    model !== null &&
    typeof model.modelArn === 'string' &&
    typeof model.modelId === 'string' &&
    typeof model.modelName === 'string' &&
    typeof model.providerName === 'string' &&
    Array.isArray(model.inputModalities) &&
    Array.isArray(model.outputModalities) &&
    typeof model.responseStreamingSupported === 'boolean' &&
    Array.isArray(model.customizationsSupported) &&
    Array.isArray(model.inferenceTypesSupported) &&
    typeof model.modelLifecycle === 'object' &&
    (typeof model.DDActive === 'boolean' || typeof model.DD_Active === 'boolean') &&
    typeof model.uuid === 'string' &&
    typeof model.anthropicVersion === 'string' &&
    typeof model.isReasoningModel === 'boolean' &&
    typeof model.configVersion === 'string' &&
    (model.supportedParameters === undefined || Array.isArray(model.supportedParameters)) &&
    (model.suggestionSettings === undefined || typeof model.suggestionSettings === 'object')
  );
}

/**
 * Safely parse and validate Bedrock models from JSON
 */
export function parseBedrockModels(json: any): BedrockModel[] {
  if (!Array.isArray(json)) {
    console.warn('Expected array of models, got:', typeof json);
    return [];
  }
  
  return json.filter(validateBedrockModel);
}

/**
 * Compare two version strings (e.g., "0.1", "0.2", "1.0")
 * Returns: 1 if version1 > version2, -1 if version1 < version2, 0 if equal
 */
export function compareVersions(version1: string, version2: string): number {
  const v1 = parseFloat(version1) || 0;
  const v2 = parseFloat(version2) || 0;
  
  if (v1 > v2) return 1;
  if (v1 < v2) return -1;
  return 0;
}

/**
 * Check if a model configuration needs updating based on version
 */
export function shouldUpdateModel(storedModel: BedrockModel, configModel: BedrockModel): boolean {
  return compareVersions(configModel.configVersion, storedModel.configVersion) > 0;
}

/**
 * Normalize model data to ensure consistent field names
 * Handles the DDActive/DD_Active inconsistency
 */
export function normalizeBedrockModel(model: any): BedrockModel {
  const normalized: BedrockModel = {
    ...model,
    DDActive: model.DDActive ?? model.DD_Active ?? false,
    configVersion: model.configVersion || "0.0",
  };
  
  // Remove DD_Active if it exists since we're using DDActive
  if ('DD_Active' in normalized) {
    delete normalized.DD_Active;
  }
  
  return normalized;
}

/**
 * Get models that need updates based on version comparison
 */
export function getModelsNeedingUpdate(
  storedModels: BedrockModel[], 
  configModels: BedrockModel[]
): { toUpdate: BedrockModel[]; toAdd: BedrockModel[]; toRemove: BedrockModel[] } {
  const storedModelMap = new Map(storedModels.map(model => [model.uuid, model]));
  const configModelMap = new Map(configModels.map(model => [model.uuid, model]));
  
  const toUpdate: BedrockModel[] = [];
  const toAdd: BedrockModel[] = [];
  const toRemove: BedrockModel[] = [];
  
  // Check config models against stored models
  for (const [uuid, configModel] of configModelMap) {
    const storedModel = storedModelMap.get(uuid);
    
    if (!storedModel) {
      toAdd.push(configModel);
    } else if (shouldUpdateModel(storedModel, configModel)) {
      toUpdate.push(configModel);
    }
  }
  
  // Check for removed models
  for (const [uuid, storedModel] of storedModelMap) {
    if (!configModelMap.has(uuid)) {
      toRemove.push(storedModel);
    }
  }
  
  return { toUpdate, toAdd, toRemove };
}

/**
 * Filter suggestion settings by supported parameters
 * Rule 2: Only include settings that are in the supportedParameters list
 */
export function filterSuggestionSettings(
  suggestionSettings: Record<string, any>, 
  supportedParameters: string[]
): Record<string, any> {
  const filtered: Record<string, any> = {};
  
  supportedParameters.forEach(param => {
    if (param in suggestionSettings) {
      filtered[param] = suggestionSettings[param];
    }
  });
  
  return filtered;
}

/**
 * Check if a model has suggestion settings available
 */
export function hasSuggestionSettings(model: BedrockModel): boolean {
  return !!(
    model.suggestionSettings && 
    Object.keys(model.suggestionSettings).length > 0 &&
    model.supportedParameters &&
    model.supportedParameters.length > 0
  );
}

/**
 * Get applicable suggestion settings for a model
 * Filters suggestionSettings by supportedParameters list
 */
export function getApplicableSuggestions(model: BedrockModel): Record<string, any> {
  if (!hasSuggestionSettings(model)) {
    return {};
  }
  
  return filterSuggestionSettings(
    model.suggestionSettings!,
    model.supportedParameters!
  );
}

/**
 * Check if two parameter settings are different
 */
export function areSettingsDifferent(
  settings1: Record<string, any>, 
  settings2: Record<string, any>
): boolean {
  const keys1 = Object.keys(settings1);
  const keys2 = Object.keys(settings2);
  
  if (keys1.length !== keys2.length) {
    return true;
  }
  
  return keys1.some(key => settings1[key] !== settings2[key]);
}

/**
 * Get the effective AWS region for a Bedrock model
 * This function checks if the model has a custom preferred region set,
 * otherwise falls back to the provided default region or system default
 * 
 * @param modelId The Bedrock model ID (e.g., "anthropic.claude-3-5-sonnet-20241022-v2:0")
 * @param defaultRegion Optional default region to use if no preference is set
 * @returns The effective region to use for API calls
 */
export function getEffectiveRegionForModel(modelId: string, defaultRegion?: string): string {
  try {
    // Import here to avoid circular dependencies
    const { useBedrockModelsStore } = require('../store/bedrock-models');
    const store = useBedrockModelsStore.getState();
    return store.getEffectiveRegionByModelId(modelId, defaultRegion);
  } catch (error) {
    console.warn(`[BedrockModels] Failed to get effective region for modelId ${modelId}, using fallback:`, error);
    return defaultRegion || 'us-west-2';
  }
} 