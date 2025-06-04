# Bedrock Model Configuration System

This directory contains the new simplified model configuration system for AWS Bedrock models. This system is designed to replace the complex multi-provider setup with a focused, Bedrock-only configuration.

## Overview

The new model configuration system provides:

- **Type-safe model definitions** based on AWS Bedrock specifications
- **Centralized model store** using Zustand for state management
- **Simplified model selection** with capability-based filtering
- **Automatic version management** with UUID-based model tracking
- **Smart synchronization** that updates only when configVersion changes
- **Future-proof architecture** ready for new Bedrock features

## File Structure

```
ddconfig/
├── default_models.json    # Default model configurations
└── README.md             # This documentation

types/
└── model.ts              # TypeScript type definitions

store/
└── bedrock-models.ts     # Zustand store for model state

utils/
└── bedrock-models.ts     # Utility functions for model handling

hooks/
└── use-model-sync.ts     # Auto-sync functionality

components/
├── bedrock-model-selector.tsx  # Example React component
└── model-sync-status.tsx       # Sync status component
```

## Configuration Format

The `default_models.json` file contains an array of Bedrock model configurations:

```json
[
  {
    "modelArn": "arn:aws:bedrock:us-east-1::foundation-model/amazon.nova-pro-v1:0:300k",
    "modelId": "amazon.nova-pro-v1:0:300k",
    "modelName": "Nova Pro",
    "providerName": "Amazon",
    "inputModalities": ["TEXT", "IMAGE", "VIDEO"],
    "outputModalities": ["TEXT"],
    "responseStreamingSupported": true,
    "customizationsSupported": ["FINE_TUNING"],
    "inferenceTypesSupported": ["PROVISIONED"],
    "modelLifecycle": {
      "status": "ACTIVE"
    },
    "DDActive": true,
    "uuid": "17859d37-aeae-4613-955a-f25ebf7a1c3e",
    "anthropicVersion": "bedrock-2023-05-31",
    "isReasoningModel": false,
    "configVersion": "0.1"
  }
]
```

### Key Fields for Version Management

- **`uuid`**: Unique identifier for each model (used for tracking across versions)
- **`configVersion`**: Version string (e.g., "0.1", "1.0") for tracking configuration updates
- **`DDActive`/`DD_Active`**: Boolean indicating if the model is active (handles both naming conventions)

## Automatic Model Synchronization

The system automatically checks for model configuration updates when the app launches:

### How It Works

1. **UUID-based tracking**: Each model has a unique UUID that persists across versions
2. **Version comparison**: The system compares `configVersion` strings as floating-point numbers
3. **Smart updates**: Only models with newer versions are updated in the persistent store
4. **Automatic sync**: Happens transparently when the app starts

### Version Management Rules

- **New models**: Added to store if UUID doesn't exist
- **Updated models**: Replaced if `configVersion` is higher than stored version
- **Removed models**: Deleted from store if UUID no longer exists in config
- **Unchanged models**: Left untouched if versions are equal

## Usage Examples

### Automatic Model Sync (Recommended)

Add this to your root component to enable automatic syncing:

```typescript
import { useAutoModelSync } from '../components/model-sync-status';

function App() {
  // This will automatically check and sync models on app launch
  useAutoModelSync();
  
  return <YourAppContent />;
}
```

### Manual Model Sync

For more control over the sync process:

```typescript
import { useModelSync } from '../hooks/use-model-sync';

function MyComponent() {
  const {
    syncStatus,
    syncResult,
    modelCount,
    manualSync,
    forceSync
  } = useModelSync();

  return (
    <div>
      <p>Status: {syncStatus}</p>
      <p>Models: {modelCount}</p>
      <button onClick={manualSync}>Check for Updates</button>
      <button onClick={forceSync}>Force Reload</button>
    </div>
  );
}
```

### Basic Model Store Usage

```typescript
import { useBedrockModelsStore } from '../store/bedrock-models';

function MyComponent() {
  const {
    models,
    selectedModelId,
    loadModels,
    setSelectedModel,
    getActiveModels,
    getReasoningModels,
    checkConfigVersion,
    syncModelsWithConfig
  } = useBedrockModelsStore();

  // Manual version checking
  const checkForUpdates = async () => {
    const needsUpdate = await checkConfigVersion();
    if (needsUpdate) {
      await syncModelsWithConfig();
    }
  };
}
```

### Model Filtering

```typescript
import { useBedrockModelsStore } from '../store/bedrock-models';

function FilteredModels() {
  const { filterModels } = useBedrockModelsStore();

  // Get models that support multimodal input
  const multimodalModels = filterModels({
    inputModalities: ['TEXT', 'IMAGE'],
    isActive: true
  });

  // Get reasoning models only
  const reasoningModels = filterModels({
    isReasoningModel: true,
    isActive: true
  });
}
```

## Configuration Version Management

### Adding New Models

1. Generate a unique UUID for the model
2. Set `configVersion` to "0.1" for new models
3. Add the model to `default_models.json`
4. The model will be automatically added on next app launch

### Updating Existing Models

1. Keep the same `uuid`
2. Increment the `configVersion` (e.g., "0.1" → "0.2")
3. Update other model properties as needed
4. The model will be automatically updated on next app launch

### Example Update Process

```json
// Before (configVersion: "0.1")
{
  "uuid": "17859d37-aeae-4613-955a-f25ebf7a1c3e",
  "modelName": "Nova Pro",
  "configVersion": "0.1",
  "DDActive": true
}

// After (configVersion: "0.2")
{
  "uuid": "17859d37-aeae-4613-955a-f25ebf7a1c3e",
  "modelName": "Nova Pro v2",
  "configVersion": "0.2",
  "DDActive": false
}
```

## Migration Strategy

This new system is designed to work alongside the existing model configuration during the refactoring process:

1. **Phase 1**: Use utility functions to convert between old and new formats
2. **Phase 2**: Gradually replace old model references with new store calls
3. **Phase 3**: Remove legacy model configuration once migration is complete

### Converting Existing Code

Old code:
```typescript
import { DEFAULT_MODELS } from '../constant';
const models = DEFAULT_MODELS;
```

New code:
```typescript
import { useBedrockModelsStore } from '../store/bedrock-models';
import { bedrockModelsToLLMModels } from '../utils/bedrock-models';

const { getActiveModels } = useBedrockModelsStore();
const models = bedrockModelsToLLMModels(getActiveModels());
```

## Type Definitions

### Core Types

- `BedrockModel`: Complete model definition matching AWS Bedrock structure
- `ModelConfigStore`: State shape for the Zustand store
- `ModelConfigActions`: Available actions for model management
- `ModelFilterCriteria`: Criteria for filtering models
- `ModelUpdateResult`: Result of sync operations

### Utility Types

- `ModelProvider`: Union type for supported providers (includes "DeepSeek")
- `InputModality` / `OutputModality`: Supported modalities
- `InferenceType`: AWS Bedrock configuration options (includes "INFERENCE_PROFILE")
- `CustomizationType`: Customization options

## Best Practices

1. **Always use UUIDs**: Ensure each model has a unique, persistent UUID
2. **Version everything**: Always increment `configVersion` when making changes
3. **Use the sync hook**: Add `useAutoModelSync()` to your root component
4. **Handle both field names**: The system handles both `DDActive` and `DD_Active`
5. **Test version updates**: Verify that version comparisons work as expected
6. **Monitor sync status**: Use the sync status components in development

## Debugging and Monitoring

### Enable Debug Logging

```typescript
localStorage.setItem('debug-bedrock-models', 'true');
```

### Sync Status Component

Add the sync status component to monitor updates:

```typescript
import { ModelSyncStatus } from '../components/model-sync-status';

function DebugPanel() {
  return <ModelSyncStatus />;
}
```

### Console Logging

The system automatically logs:
- Model additions: `Added new model: {name} ({uuid})`
- Model updates: `Updated model: {name} ({oldVersion} -> {newVersion})`
- Model removals: `Removed model: {name} ({uuid})`
- Sync completion: `Model sync complete: {result}`

## Troubleshooting

### Common Issues

1. **Models not updating**: Check that `configVersion` is properly incremented
2. **UUID conflicts**: Ensure each model has a unique UUID
3. **Field name issues**: The system handles both `DDActive` and `DD_Active`
4. **Version comparison**: Versions are compared as floating-point numbers

### Sync Problems

- **Check network access**: Ensure `/ddconfig/default_models.json` is accessible
- **Verify JSON format**: Use a JSON validator to check configuration syntax
- **Monitor console**: Look for sync-related error messages
- **Force sync**: Use the force sync button to reload all models

## Future Enhancements

This system is designed to easily support:

- **Remote configuration management** with API-based model updates
- **Real-time model availability** checking against AWS Bedrock
- **Advanced version management** with semantic versioning
- **Model deprecation workflows** with automatic migration
- **Configuration rollback** capabilities
- **Multi-environment configurations** (dev, staging, prod) 