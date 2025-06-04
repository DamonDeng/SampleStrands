import React, { useEffect } from "react";
import { useBedrockModelsStore } from "../store/bedrock-models";
import { BedrockModel } from "../types/model";

/**
 * Example component demonstrating the usage of the new Bedrock Models Store
 * This component shows how to:
 * - Load models from configuration
 * - Display available models
 * - Select a model
 * - Filter models by capabilities
 */
export function BedrockModelSelector() {
  const {
    models,
    selectedModelId,
    isLoading,
    error,
    loadModels,
    setSelectedModel,
    getActiveModels,
    getReasoningModels,
    getModelsByProvider,
    refreshModels,
  } = useBedrockModelsStore();

  // Load models on component mount
  useEffect(() => {
    if (models.length === 0) {
      loadModels();
    }
  }, [models.length, loadModels]);

  const activeModels = getActiveModels();
  const reasoningModels = getReasoningModels();
  const modelsByProvider = getModelsByProvider();

  if (isLoading) {
    return <div className="loading">Loading models...</div>;
  }

  if (error) {
    return (
      <div className="error">
        <p>Error loading models: {error}</p>
        <button onClick={refreshModels}>Retry</button>
      </div>
    );
  }

  if (activeModels.length === 0) {
    return <div className="no-models">No active models available</div>;
  }

  return (
    <div className="bedrock-model-selector">
      <h3>Bedrock Model Configuration</h3>
      
      {/* Model Selection Dropdown */}
      <div className="model-selection">
        <label htmlFor="model-select">Select Model:</label>
        <select
          id="model-select"
          value={selectedModelId || ""}
          onChange={(e) => setSelectedModel(e.target.value)}
        >
          <option value="">-- Select a model --</option>
          {activeModels.map((model) => (
            <option key={model.modelId} value={model.modelId}>
              {model.modelName} ({model.providerName})
              {model.isReasoningModel && " 🧠"}
            </option>
          ))}
        </select>
      </div>

      {/* Quick Filters */}
      <div className="quick-filters">
        <h4>Quick Filters:</h4>
        <div className="filter-buttons">
          <button
            onClick={() => {
              if (reasoningModels.length > 0) {
                setSelectedModel(reasoningModels[0].modelId);
              }
            }}
            disabled={reasoningModels.length === 0}
          >
            Reasoning Models ({reasoningModels.length})
          </button>
          
          <button onClick={refreshModels}>
            Refresh Models
          </button>
        </div>
      </div>

      {/* Models by Provider */}
      <div className="models-by-provider">
        <h4>Models by Provider:</h4>
        {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
          <div key={provider} className="provider-group">
            <h5>{provider} ({providerModels.length})</h5>
            <ul>
              {providerModels.map((model) => (
                <li
                  key={model.modelId}
                  className={selectedModelId === model.modelId ? "selected" : ""}
                  onClick={() => setSelectedModel(model.modelId)}
                >
                  <strong>{model.modelName}</strong>
                  <div className="model-details">
                    <span>Input: {model.inputModalities.join(", ")}</span>
                    <span>Output: {model.outputModalities.join(", ")}</span>
                    {model.responseStreamingSupported && (
                      <span className="feature">Streaming</span>
                    )}
                    {model.isReasoningModel && (
                      <span className="feature reasoning">Reasoning</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Selected Model Details */}
      {selectedModelId && (
        <SelectedModelDetails modelId={selectedModelId} models={models} />
      )}

      <style jsx>{`
        .bedrock-model-selector {
          padding: 20px;
          max-width: 800px;
          margin: 0 auto;
        }
        
        .model-selection {
          margin-bottom: 20px;
        }
        
        .model-selection label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        
        .model-selection select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .quick-filters {
          margin-bottom: 20px;
        }
        
        .filter-buttons {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        
        .filter-buttons button {
          padding: 8px 16px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }
        
        .filter-buttons button:hover:not(:disabled) {
          background: #f5f5f5;
        }
        
        .filter-buttons button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .provider-group {
          margin-bottom: 20px;
          border: 1px solid #eee;
          border-radius: 4px;
          padding: 15px;
        }
        
        .provider-group h5 {
          margin: 0 0 10px 0;
          color: #666;
        }
        
        .provider-group ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        
        .provider-group li {
          padding: 10px;
          border: 1px solid #f0f0f0;
          margin-bottom: 8px;
          border-radius: 4px;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        
        .provider-group li:hover {
          background-color: #f8f9fa;
        }
        
        .provider-group li.selected {
          background-color: #e3f2fd;
          border-color: #2196f3;
        }
        
        .model-details {
          display: flex;
          gap: 15px;
          margin-top: 5px;
          font-size: 0.9em;
          color: #666;
        }
        
        .feature {
          background: #e8f5e8;
          color: #2e7d2e;
          padding: 2px 6px;
          border-radius: 3px;
          font-size: 0.8em;
        }
        
        .feature.reasoning {
          background: #fff3e0;
          color: #f57c00;
        }
        
        .loading, .error, .no-models {
          text-align: center;
          padding: 40px;
          color: #666;
        }
        
        .error {
          color: #d32f2f;
        }
        
        .error button {
          margin-top: 10px;
          padding: 8px 16px;
          background: #f44336;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

/**
 * Component to display detailed information about the selected model
 */
function SelectedModelDetails({ modelId, models }: { modelId: string; models: BedrockModel[] }) {
  const model = models.find(m => m.modelId === modelId);
  
  if (!model) {
    return null;
  }

  return (
    <div className="selected-model-details">
      <h4>Selected Model Details</h4>
      <div className="details-grid">
        <div><strong>Name:</strong> {model.modelName}</div>
        <div><strong>Provider:</strong> {model.providerName}</div>
        <div><strong>Model ID:</strong> {model.modelId}</div>
        <div><strong>ARN:</strong> {model.modelArn}</div>
        <div><strong>Input Modalities:</strong> {model.inputModalities.join(", ")}</div>
        <div><strong>Output Modalities:</strong> {model.outputModalities.join(", ")}</div>
        <div><strong>Streaming:</strong> {model.responseStreamingSupported ? "Yes" : "No"}</div>
        <div><strong>Reasoning:</strong> {model.isReasoningModel ? "Yes" : "No"}</div>
        <div><strong>Status:</strong> {model.modelLifecycle.status}</div>
        <div><strong>Customizations:</strong> {model.customizationsSupported.join(", ")}</div>
        <div><strong>Inference Types:</strong> {model.inferenceTypesSupported.join(", ")}</div>
      </div>
      
      <style jsx>{`
        .selected-model-details {
          margin-top: 30px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
        }
        
        .details-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 8px;
          margin-top: 15px;
        }
        
        .details-grid div {
          padding: 5px 0;
          border-bottom: 1px solid #eee;
        }
        
        .details-grid strong {
          color: #333;
        }
      `}</style>
    </div>
  );
} 