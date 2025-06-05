import { useState, useEffect, useMemo } from "react";
import React from "react";

import styles from "./settings.module.scss";

import ResetIcon from "../icons/reload.svg";
import AddIcon from "../icons/add.svg";
import CloseIcon from "../icons/close.svg";
import CopyIcon from "../icons/copy.svg";
import ClearIcon from "../icons/clear.svg";
import LoadingIcon from "../icons/three-dots.svg";
import EditIcon from "../icons/edit.svg";
import EyeIcon from "../icons/eye.svg";
import DownloadIcon from "../icons/download.svg";
import UploadIcon from "../icons/upload.svg";
import ConfigIcon from "../icons/config.svg";
import ConfirmIcon from "../icons/confirm.svg";
import GithubIcon from "../icons/github.svg";
import ConnectionIcon from "../icons/connection.svg";
import CloudSuccessIcon from "../icons/cloud-success.svg";
import CloudFailIcon from "../icons/cloud-fail.svg";

import {
  Input,
  List,
  ListItem,
  Modal,
  PasswordInput,
  Popover,
  Select,
  showConfirm,
  showToast,
} from "./ui-lib";
import { ModelConfigList } from "./model-config";

import { IconButton } from "./button";
import {
  SubmitKey,
  useChatStore,
  Theme,
  useUpdateStore,
  useAccessStore,
  useAppConfig,
} from "../store";

import Locale, {
  AllLangs,
  ALL_LANG_OPTIONS,
  changeLang,
  getLang,
} from "../locales";
import { copyToClipboard } from "../utils";
import Link from "next/link";
import {
  Azure,
  Google,
  OPENAI_BASE_URL,
  Path,
  RELEASE_URL,
  STORAGE_KEY,
  ServiceProvider,
  UseBRProxy,
  BRProxy,
  SlotID,
  UPDATE_URL,
} from "../constant";
import { Prompt, SearchService, usePromptStore } from "../store/prompt";
import { ErrorBoundary } from "./error";
import { InputRange } from "./input-range";
import { useNavigate } from "react-router-dom";
import { Avatar, AvatarPicker } from "./emoji";
import { getClientConfig } from "../config/client";
import { useSyncStore } from "../store/sync";
import { nanoid } from "nanoid";
import { useMaskStore } from "../store/mask";
import { ProviderType } from "../utils/cloud";

// Import new Bedrock model system
import { useBedrockModelsStore } from "../store/bedrock-models";
import { useAutoModelSync, ModelSyncStatus } from "./model-sync-status";
import { bedrockModelsToLLMModels } from "../utils/bedrock-models";

function EditPromptModal(props: { id: string; onClose: () => void }) {
  const promptStore = usePromptStore();
  const prompt = promptStore.get(props.id);

  return prompt ? (
    <div className="modal-mask">
      <Modal
        title={Locale.Settings.Prompt.EditModal.Title}
        onClose={props.onClose}
        actions={[
          <IconButton
            key=""
            onClick={props.onClose}
            text={Locale.UI.Confirm}
            bordered
          />,
        ]}
      >
        <div className={styles["edit-prompt-modal"]}>
          <input
            type="text"
            value={prompt.title}
            readOnly={!prompt.isUser}
            className={styles["edit-prompt-title"]}
            onInput={(e) =>
              promptStore.updatePrompt(
                props.id,
                (prompt) => (prompt.title = e.currentTarget.value),
              )
            }
          ></input>
          <Input
            value={prompt.content}
            readOnly={!prompt.isUser}
            className={styles["edit-prompt-content"]}
            rows={10}
            onInput={(e) =>
              promptStore.updatePrompt(
                props.id,
                (prompt) => (prompt.content = e.currentTarget.value),
              )
            }
          ></Input>
        </div>
      </Modal>
    </div>
  ) : null;
}

function UserPromptModal(props: { onClose?: () => void }) {
  const promptStore = usePromptStore();
  const userPrompts = promptStore.getUserPrompts();
  const builtinPrompts = SearchService.builtinPrompts;
  const allPrompts = userPrompts.concat(builtinPrompts);
  const [searchInput, setSearchInput] = useState("");
  const [searchPrompts, setSearchPrompts] = useState<Prompt[]>([]);
  const prompts = searchInput.length > 0 ? searchPrompts : allPrompts;

  const [editingPromptId, setEditingPromptId] = useState<string>();

  useEffect(() => {
    if (searchInput.length > 0) {
      const searchResult = SearchService.search(searchInput);
      setSearchPrompts(searchResult);
    } else {
      setSearchPrompts([]);
    }
  }, [searchInput]);

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Settings.Prompt.Modal.Title}
        onClose={() => props.onClose?.()}
        actions={[
          <IconButton
            key="add"
            onClick={() => {
              const promptId = promptStore.add({
                id: nanoid(),
                createdAt: Date.now(),
                title: "Empty Prompt",
                content: "Empty Prompt Content",
              });
              setEditingPromptId(promptId);
            }}
            icon={<AddIcon />}
            bordered
            text={Locale.Settings.Prompt.Modal.Add}
          />,
        ]}
      >
        <div className={styles["user-prompt-modal"]}>
          <input
            type="text"
            className={styles["user-prompt-search"]}
            placeholder={Locale.Settings.Prompt.Modal.Search}
            value={searchInput}
            onInput={(e) => setSearchInput(e.currentTarget.value)}
          ></input>

          <div className={styles["user-prompt-list"]}>
            {prompts.map((v, _) => (
              <div className={styles["user-prompt-item"]} key={v.id ?? v.title}>
                <div className={styles["user-prompt-header"]}>
                  <div className={styles["user-prompt-title"]}>{v.title}</div>
                  <div className={styles["user-prompt-content"] + " one-line"}>
                    {v.content}
                  </div>
                </div>

                <div className={styles["user-prompt-buttons"]}>
                  {v.isUser && (
                    <IconButton
                      icon={<ClearIcon />}
                      className={styles["user-prompt-button"]}
                      onClick={() => promptStore.remove(v.id!)}
                    />
                  )}
                  {v.isUser ? (
                    <IconButton
                      icon={<EditIcon />}
                      className={styles["user-prompt-button"]}
                      onClick={() => setEditingPromptId(v.id)}
                    />
                  ) : (
                    <IconButton
                      icon={<EyeIcon />}
                      className={styles["user-prompt-button"]}
                      onClick={() => setEditingPromptId(v.id)}
                    />
                  )}
                  <IconButton
                    icon={<CopyIcon />}
                    className={styles["user-prompt-button"]}
                    onClick={() => copyToClipboard(v.content)}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Modal>

      {editingPromptId !== undefined && (
        <EditPromptModal
          id={editingPromptId!}
          onClose={() => setEditingPromptId(undefined)}
        />
      )}
    </div>
  );
}

function DangerItems() {
  const chatStore = useChatStore();
  const appConfig = useAppConfig();
  const bedrockModelsStore = useBedrockModelsStore();

  return (
    <List>
      <ListItem
        title={Locale.Settings.Danger.Reset.Title}
        subTitle={Locale.Settings.Danger.Reset.SubTitle}
      >
        <IconButton
          text={Locale.Settings.Danger.Reset.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Reset.Confirm)) {
              console.log('[Settings] Resetting all configurations...');
              
              // Reset all stores first
              appConfig.reset();
              bedrockModelsStore.reset();
              
              // After reset, load models and apply all suggestion settings
              console.log('[Settings] Loading models and applying suggestion settings...');
              
              try {
                // Load models first (since reset cleared them)
                await bedrockModelsStore.loadModels();
                
                // Now apply suggestions to all active models
                const activeModels = bedrockModelsStore.getActiveModels();
                let appliedCount = 0;
                
                for (const model of activeModels) {
                  const suggestions = bedrockModelsStore.applySuggestionSettingsIfNew(model.modelId);
                  if (suggestions && Object.keys(suggestions).length > 0) {
                    appliedCount++;
                    console.log(`[Settings] Applied ${Object.keys(suggestions).length} suggestions for ${model.modelName}:`, suggestions);
                  }
                }
                
                console.log(`[Settings] All configurations reset successfully. Applied suggestions to ${appliedCount} models.`);
                showToast(`All settings reset and suggestion settings applied to ${appliedCount} models`);
              } catch (error) {
                console.error('[Settings] Error during reset and suggestion application:', error);
                showToast("Settings reset successfully, but some suggestion settings could not be applied");
              }
            }
          }}
          type="danger"
        />
      </ListItem>
      <ListItem
        title={Locale.Settings.Danger.Clear.Title}
        subTitle={Locale.Settings.Danger.Clear.SubTitle}
      >
        <IconButton
          text={Locale.Settings.Danger.Clear.Action}
          onClick={async () => {
            if (await showConfirm(Locale.Settings.Danger.Clear.Confirm)) {
              chatStore.clearAllData();
            }
          }}
          type="danger"
        />
      </ListItem>
    </List>
  );
}

function BedrockModelSettings() {
  const {
    models,
    selectedModelId,
    isLoading,
    error,
    getActiveModels,
    getModelsByProvider,
    setSelectedModel,
    checkConfigVersion,
    syncModelsWithConfig,
    getModelById,
    getSupportedParameters,
    getSuggestionSettings,
    applySuggestionSettingsIfNew,
    getCurrentParameterValues,
    updateParameterValue,
    resetParameterToSuggestion,
    getParameterType,
    getParameterConstraints,
    getModelParameters,
    hasCustomParameters,
    resetAllParametersToSuggestion,
    clearModelParameters,
    getPreferRegion,
    setPreferRegion,
    clearPreferRegion,
  } = useBedrockModelsStore();

  const [checkingUpdates, setCheckingUpdates] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>("");

  const activeModels = getActiveModels();
  const modelsByProvider = getModelsByProvider();

  // Debug logging
  useEffect(() => {
    console.log('[BedrockModelSettings] Store state update:', {
      modelsCount: models.length,
      activeModelsCount: activeModels.length,
      isLoading,
      error,
      selectedModelId,
    });
    console.log('[BedrockModelSettings] Models by provider:', modelsByProvider);
  }, [models, activeModels, isLoading, error, selectedModelId, modelsByProvider]);

  // Test HTTP access to the JSON file
  const testJsonAccess = async () => {
    try {
      console.log('[BedrockModelSettings] Testing JSON file access...');
      const response = await fetch('/ddconfig/default_models.json');
      const status = `HTTP ${response.status} ${response.statusText}`;
      console.log('[BedrockModelSettings] JSON access test:', status);
      
      if (response.ok) {
        const text = await response.text();
        setDebugInfo(`✅ JSON accessible - ${status} - ${text.length} bytes`);
      } else {
        setDebugInfo(`❌ JSON not accessible - ${status}`);
      }
    } catch (error) {
      const errorMsg = `❌ Network error: ${error instanceof Error ? error.message : 'Unknown'}`;
      console.error('[BedrockModelSettings] JSON access test failed:', error);
      setDebugInfo(errorMsg);
    }
  };

  const handleCheckUpdates = async () => {
    console.log('[BedrockModelSettings] Checking for updates manually...');
    setCheckingUpdates(true);
    try {
      const needsUpdate = await checkConfigVersion();
      console.log('[BedrockModelSettings] Manual check - needs update:', needsUpdate);
      if (needsUpdate) {
        await syncModelsWithConfig();
        showToast("Model configurations updated successfully");
      } else {
        showToast("Model configurations are up to date");
      }
    } catch (error) {
      console.error('[BedrockModelSettings] Manual update check failed:', error);
      showToast("Failed to check for model updates");
      console.error("Model update check failed:", error);
    } finally {
      setCheckingUpdates(false);
    }
  };

  // Helper function to render parameter input based on type
  const renderParameterInput = (paramName: string, value: any, suggestionValue: any, uuid: string) => {
    const paramType = getParameterType(paramName);
    const constraints = getParameterConstraints(paramName);
    const isCustomValue = value !== suggestionValue;

    switch (paramType) {
      case 'number':
        if (constraints.min !== undefined && constraints.max !== undefined) {
          // Use InputRange for numeric parameters with known ranges
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <InputRange
                title={`${value?.toFixed(2) ?? suggestionValue?.toFixed(2) ?? '0'}`}
                value={value ?? suggestionValue ?? constraints.min}
                min={constraints.min.toString()}
                max={constraints.max.toString()}
                step={constraints.step?.toString() ?? '0.01'}
                onChange={(e) => {
                  const newValue = e.currentTarget.valueAsNumber;
                  updateParameterValue(uuid, paramName, newValue);
                }}
              />
              {isCustomValue && (
                <IconButton
                  icon={<ResetIcon />}
                  title="Reset to suggested value"
                  onClick={() => resetParameterToSuggestion(uuid, paramName)}
                />
              )}
            </div>
          );
        } else {
          // Use regular number input for parameters without known ranges
          return (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input
                type="number"
                value={value ?? suggestionValue ?? ''}
                min={constraints.min}
                max={constraints.max}
                step={constraints.step ?? 'any'}
                onChange={(e) => {
                  const newValue = e.currentTarget.valueAsNumber;
                  if (!isNaN(newValue)) {
                    updateParameterValue(uuid, paramName, newValue);
                  }
                }}
                style={{ width: '100px' }}
              />
              {isCustomValue && (
                <IconButton
                  icon={<ResetIcon />}
                  title="Reset to suggested value"
                  onClick={() => resetParameterToSuggestion(uuid, paramName)}
                />
              )}
            </div>
          );
        }

      case 'boolean':
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="checkbox"
              checked={value ?? suggestionValue ?? false}
              onChange={(e) => {
                updateParameterValue(uuid, paramName, e.currentTarget.checked);
              }}
            />
            {isCustomValue && (
              <IconButton
                icon={<ResetIcon />}
                title="Reset to suggested value"
                onClick={() => resetParameterToSuggestion(uuid, paramName)}
              />
            )}
          </div>
        );

      default:
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <input
              type="text"
              value={value ?? suggestionValue ?? ''}
              onChange={(e) => {
                updateParameterValue(uuid, paramName, e.currentTarget.value);
              }}
              style={{ minWidth: '150px' }}
            />
            {isCustomValue && (
              <IconButton
                icon={<ResetIcon />}
                title="Reset to suggested value"
                onClick={() => resetParameterToSuggestion(uuid, paramName)}
              />
            )}
          </div>
        );
    }
  };

  console.log('[BedrockModelSettings] Rendering with:', {
    modelsCount: models.length,
    activeModelsCount: activeModels.length,
    isLoading,
    error,
  });

  return (
    <List>
      <ListItem
        title="Bedrock Model Configuration"
        subTitle={`${activeModels.length} active models available`}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <IconButton
            icon={checkingUpdates ? <LoadingIcon /> : <ResetIcon />}
            text={checkingUpdates ? "Checking..." : "Check Updates"}
            onClick={handleCheckUpdates}
            disabled={checkingUpdates}
          />
        </div>
      </ListItem>

      {/* Debug section */}
      {/* <ListItem
        title="Debug Information"
        subTitle="Test JSON file access and store state"
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <button 
            onClick={testJsonAccess}
            style={{ padding: "4px 8px", fontSize: "0.8em" }}
          >
            Test JSON Access
          </button>
          {debugInfo && (
            <div style={{ fontSize: "0.8em", color: debugInfo.includes('✅') ? 'green' : 'red' }}>
              {debugInfo}
            </div>
          )}
          <div style={{ fontSize: "0.8em", color: "#666" }}>
            Store: {models.length} models, Loading: {isLoading ? 'Yes' : 'No'}, Error: {error || 'None'}
          </div>
        </div>
      </ListItem> */}

      {error && (
        <ListItem
          title="Model Loading Error"
          subTitle={error}
        >
          <div style={{ color: "#d32f2f", fontSize: "0.9em" }}>
            Failed to load model configurations
          </div>
        </ListItem>
      )}

      <ListItem
        title="Selected Model"
        subTitle={selectedModelId || "No model selected"}
      >
        <Select
          value={selectedModelId || ""}
          onChange={(e) => {
            if (e.target.value) {
              setSelectedModel(e.target.value);
            }
          }}
        >
          <option value="">-- Select a Bedrock Model --</option>
          {Object.entries(modelsByProvider).map(([provider, providerModels]) => (
            <optgroup key={provider} label={provider}>
              {providerModels.map((model) => (
                <option key={model.modelId} value={model.modelId}>
                  {model.modelName}
                  {model.isReasoningModel && " (Reasoning)"}
                  {model.inputModalities.includes("IMAGE") && " (Vision)"}
                </option>
              ))}
            </optgroup>
          ))}
        </Select>
      </ListItem>

      {/* Preferred Region for Selected Model */}
      {selectedModelId && (
        <ListItem
          title="Preferred Region"
          subTitle={`Custom region for ${getModelById(selectedModelId)?.modelName || 'this model'} (optional)`}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <input
              type="text"
              value={getPreferRegion(getModelById(selectedModelId)?.uuid || '') || ""}
              placeholder={`Default: ${useAccessStore.getState().awsRegion || 'us-west-2'}`}
              onChange={(e) => {
                const selectedModel = getModelById(selectedModelId);
                if (!selectedModel) return;
                
                const region = e.target.value.trim();
                if (region) {
                  setPreferRegion(selectedModel.uuid, region);
                } else {
                  clearPreferRegion(selectedModel.uuid);
                }
              }}
              style={{ minWidth: '150px' }}
            />
            {getPreferRegion(getModelById(selectedModelId)?.uuid || '') && (
              <IconButton
                icon={<ClearIcon />}
                title="Clear custom region (use default)"
                onClick={() => {
                  const selectedModel = getModelById(selectedModelId);
                  if (selectedModel) {
                    clearPreferRegion(selectedModel.uuid);
                  }
                }}
              />
            )}
          </div>
        </ListItem>
      )}

      {/* <ListItem
        title="Model Capabilities"
        subTitle="Available model capabilities and features"
      >
        <div style={{ fontSize: "0.9em", color: "#666" }}>
          <div>• Text models: {activeModels.filter(m => m.inputModalities.includes("TEXT")).length}</div>
          <div>• Vision models: {activeModels.filter(m => m.inputModalities.includes("IMAGE")).length}</div>
          <div>• Reasoning models: {activeModels.filter(m => m.isReasoningModel).length}</div>
          <div>• Streaming support: {activeModels.filter(m => m.responseStreamingSupported).length}</div>
        </div>
      </ListItem> */}

      {/* Selected Model Details with Editable Parameters */}
      {selectedModelId && (
        <>
          {(() => {
            const selectedModel = getModelById(selectedModelId);
            if (!selectedModel) return null;
            
            const supportedParams = getSupportedParameters(selectedModelId);
            const suggestionSettings = getSuggestionSettings(selectedModelId);
            const currentValues = getCurrentParameterValues(selectedModel.uuid);
            
            return (
              <>
                {/* <ListItem
                  title="Selected Model Parameters"
                  subTitle={`${selectedModel?.modelName} - Parameter Support`}
                >
                  <div style={{ fontSize: "0.9em", color: "#666" }}>
                    {supportedParams.length > 0 ? (
                      <div>
                        <div><strong>Supported Parameters:</strong></div>
                        <div style={{ marginLeft: "10px" }}>
                          {supportedParams.map((param: string) => (
                            <div key={param}>• {param}</div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div>• No additional parameters supported</div>
                    )}
                  </div>
                </ListItem> */}

                {/* Model Name and Status */}
                {/* <ListItem
                  title={selectedModel?.modelName ?? "Unknown Model"}
                  subTitle="Parameter Settings (automatically saved)"
                >
                  <div style={{ fontSize: "0.8em", color: "#666", padding: "8px", backgroundColor: "#f5f5f5", borderRadius: "4px" }}>
                    <div><strong>Model Status:</strong></div>
                    <div>• Custom parameters: {hasCustomParameters(selectedModel.uuid) ? 'Yes' : 'No'}</div>
                    <div>• Parameters stored separately for each model</div>
                  </div>
                </ListItem> */}

                {/* Individual Parameter ListItems */}
                {supportedParams.length > 0 && supportedParams.map((param: string) => {
                  const currentValue = currentValues[param];
                  const suggestionValue = suggestionSettings[param];
                  const hasCustomValue = (getModelParameters(selectedModel.uuid) as any)[param] !== undefined;
                  
                  return (
                    <ListItem
                      key={param}
                      title={`${param}${hasCustomValue ? ' (custom)' : ''}`}
                      subTitle="Parameter Setting"
                    >
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        {renderParameterInput(param, currentValue, suggestionValue, selectedModel.uuid)}
                      </div>
                    </ListItem>
                  );
                })}

                {supportedParams.length > 0 && (
                  <div style={{ fontSize: "0.8em", color: "#888", margin: "8px 16px" }}>
                    💡 Parameter values are saved per model. Blue "(custom)" indicates you've modified the suggested value for this specific model.
                  </div>
                )}

                {/* Model Parameter Management */}
                {supportedParams.length > 0 && (
                  <ListItem
                    title="Parameter Management"
                    subTitle={`Manage parameter settings for ${selectedModel?.modelName}`}
                  >
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <IconButton
                        icon={<ResetIcon />}
                        text="Apply All Suggestions"
                        onClick={() => {
                          const success = resetAllParametersToSuggestion(selectedModel.uuid);
                          if (success) {
                            showToast(`Applied all suggested settings for ${selectedModel?.modelName}`);
                          } else {
                            showToast("No suggestions available to apply");
                          }
                        }}
                        bordered
                      />
                      
                      {hasCustomParameters(selectedModel.uuid) && (
                        <IconButton
                          icon={<ClearIcon />}
                          text="Clear Custom Settings"
                          onClick={async () => {
                            if (await showConfirm(`Clear all custom parameter settings for ${selectedModel?.modelName}? This will revert to suggestion values only.`)) {
                              clearModelParameters(selectedModel.uuid);
                              showToast(`Cleared custom settings for ${selectedModel?.modelName}`);
                            }
                          }}
                          type="danger"
                          bordered
                        />
                      )}
                    </div>
                  </ListItem>
                )}

                {/* Show suggested values for reference */}
                {/* {Object.keys(suggestionSettings).length > 0 && (
                  <ListItem
                    title="Suggested Reference Values"
                    subTitle="Original suggested values for this model"
                  >
                    <div style={{ fontSize: "0.9em", color: "#666" }}>
                      <div><strong>Suggested Values:</strong></div>
                      <div style={{ marginLeft: "10px" }}>
                        {Object.entries(suggestionSettings).map(([param, value]) => (
                          <div key={param}>• {param}: {typeof value === 'number' ? value.toFixed(2) : String(value)}</div>
                        ))}
                      </div>
                    </div>
                  </ListItem>
                )} */}

                {/* Show current active parameter values for debugging */}
                {/* {hasCustomParameters(selectedModel.uuid) && (
                  <ListItem
                    title="Current Active Values"
                    subTitle="Values that will be used for API calls"
                  >
                    <div style={{ fontSize: "0.9em", color: "#666" }}>
                      <div><strong>Active Parameter Values:</strong></div>
                      <div style={{ marginLeft: "10px" }}>
                        {Object.entries(currentValues).map(([param, value]) => (
                          <div key={param}>• {param}: {typeof value === 'number' ? value.toFixed(2) : String(value)}</div>
                        ))}
                      </div>
                      <div style={{ marginTop: "8px", fontSize: "0.8em", color: "#888" }}>
                        🔧 These are the actual values that will be sent to the model during conversations.
                      </div>
                    </div>
                  </ListItem>
                )} */}

                {/* <ListItem
                  title="Legacy Notice"
                  subTitle="About the new parameter system"
                >
                  <div style={{ fontSize: "0.9em", color: "#666" }}>
                    <div><strong>✨ New Feature:</strong></div>
                    <div>• Each Bedrock model now has separate parameter configurations</div>
                    <div>• Your settings are automatically saved per model</div>
                    <div>• This replaces the shared parameter system from the legacy model config above</div>
                    <div style={{ marginTop: "8px", fontSize: "0.8em", color: "#888" }}>
                      💡 Tip: You can now optimize parameters differently for each model!
                    </div>
                  </div>
                </ListItem> */}
              </>
            );
          })()}
        </>
      )}

      {isLoading && (
        <ListItem
          title="Loading Models"
          subTitle="Synchronizing model configurations..."
        >
          <LoadingIcon />
        </ListItem>
      )}
    </List>
  );
}

function CheckButton() {
  const syncStore = useSyncStore();

  const couldCheck = useMemo(() => {
    return syncStore.cloudSync();
  }, [syncStore]);

  const [checkState, setCheckState] = useState<
    "none" | "checking" | "success" | "failed"
  >("none");

  async function check() {
    setCheckState("checking");
    const valid = await syncStore.check();
    setCheckState(valid ? "success" : "failed");
  }

  if (!couldCheck) return null;

  return (
    <IconButton
      text={Locale.Settings.Sync.Config.Modal.Check}
      bordered
      onClick={check}
      icon={
        checkState === "none" ? (
          <ConnectionIcon />
        ) : checkState === "checking" ? (
          <LoadingIcon />
        ) : checkState === "success" ? (
          <CloudSuccessIcon />
        ) : checkState === "failed" ? (
          <CloudFailIcon />
        ) : (
          <ConnectionIcon />
        )
      }
    ></IconButton>
  );
}

function SyncConfigModal(props: { onClose?: () => void }) {
  const syncStore = useSyncStore();

  return (
    <div className="modal-mask">
      <Modal
        title={Locale.Settings.Sync.Config.Modal.Title}
        onClose={() => props.onClose?.()}
        actions={[
          <CheckButton key="check" />,
          <IconButton
            key="confirm"
            onClick={props.onClose}
            icon={<ConfirmIcon />}
            bordered
            text={Locale.UI.Confirm}
          />,
        ]}
      >
        <List>
          <ListItem
            title={Locale.Settings.Sync.Config.SyncType.Title}
            subTitle={Locale.Settings.Sync.Config.SyncType.SubTitle}
          >
            <select
              value={syncStore.provider}
              onChange={(e) => {
                syncStore.update(
                  (config) =>
                    (config.provider = e.target.value as ProviderType),
                );
              }}
            >
              {Object.entries(ProviderType).map(([k, v]) => (
                <option value={v} key={k}>
                  {k}
                </option>
              ))}
            </select>
          </ListItem>

          <ListItem
            title={Locale.Settings.Sync.Config.Proxy.Title}
            subTitle={Locale.Settings.Sync.Config.Proxy.SubTitle}
          >
            <input
              type="checkbox"
              checked={syncStore.useProxy}
              onChange={(e) => {
                syncStore.update(
                  (config) => (config.useProxy = e.currentTarget.checked),
                );
              }}
            ></input>
          </ListItem>
          {syncStore.useProxy ? (
            <ListItem
              title={Locale.Settings.Sync.Config.ProxyUrl.Title}
              subTitle={Locale.Settings.Sync.Config.ProxyUrl.SubTitle}
            >
              <input
                type="text"
                value={syncStore.proxyUrl}
                onChange={(e) => {
                  syncStore.update(
                    (config) => (config.proxyUrl = e.currentTarget.value),
                  );
                }}
              ></input>
            </ListItem>
          ) : null}
        </List>

        {syncStore.provider === ProviderType.WebDAV && (
          <>
            <List>
              <ListItem title={Locale.Settings.Sync.Config.WebDav.Endpoint}>
                <input
                  type="text"
                  value={syncStore.webdav.endpoint}
                  onChange={(e) => {
                    syncStore.update(
                      (config) =>
                        (config.webdav.endpoint = e.currentTarget.value),
                    );
                  }}
                ></input>
              </ListItem>

              <ListItem title={Locale.Settings.Sync.Config.WebDav.UserName}>
                <input
                  type="text"
                  value={syncStore.webdav.username}
                  onChange={(e) => {
                    syncStore.update(
                      (config) =>
                        (config.webdav.username = e.currentTarget.value),
                    );
                  }}
                ></input>
              </ListItem>
              <ListItem title={Locale.Settings.Sync.Config.WebDav.Password}>
                <PasswordInput
                  value={syncStore.webdav.password}
                  onChange={(e) => {
                    syncStore.update(
                      (config) =>
                        (config.webdav.password = e.currentTarget.value),
                    );
                  }}
                ></PasswordInput>
              </ListItem>
            </List>
          </>
        )}

        {syncStore.provider === ProviderType.UpStash && (
          <List>
            <ListItem title={Locale.Settings.Sync.Config.UpStash.Endpoint}>
              <input
                type="text"
                value={syncStore.upstash.endpoint}
                onChange={(e) => {
                  syncStore.update(
                    (config) =>
                      (config.upstash.endpoint = e.currentTarget.value),
                  );
                }}
              ></input>
            </ListItem>

            <ListItem title={Locale.Settings.Sync.Config.UpStash.UserName}>
              <input
                type="text"
                value={syncStore.upstash.username}
                placeholder={STORAGE_KEY}
                onChange={(e) => {
                  syncStore.update(
                    (config) =>
                      (config.upstash.username = e.currentTarget.value),
                  );
                }}
              ></input>
            </ListItem>
            <ListItem title={Locale.Settings.Sync.Config.UpStash.Password}>
              <PasswordInput
                value={syncStore.upstash.apiKey}
                onChange={(e) => {
                  syncStore.update(
                    (config) => (config.upstash.apiKey = e.currentTarget.value),
                  );
                }}
              ></PasswordInput>
            </ListItem>
          </List>
        )}
      </Modal>
    </div>
  );
}

function SyncItems() {
  const syncStore = useSyncStore();
  const chatStore = useChatStore();
  const promptStore = usePromptStore();
  const maskStore = useMaskStore();
  const couldSync = useMemo(() => {
    return syncStore.cloudSync();
  }, [syncStore]);

  const [showSyncConfigModal, setShowSyncConfigModal] = useState(false);

  const stateOverview = useMemo(() => {
    const sessions = chatStore.sessions;
    const messageCount = sessions.reduce((p, c) => p + c.messages.length, 0);

    return {
      chat: sessions.length,
      message: messageCount,
      prompt: Object.keys(promptStore.prompts).length,
      mask: Object.keys(maskStore.masks).length,
    };
  }, [chatStore.sessions, maskStore.masks, promptStore.prompts]);

  return (
    <>
      <List>
        <ListItem
          title={Locale.Settings.Sync.CloudState}
          subTitle={
            syncStore.lastProvider
              ? `${new Date(syncStore.lastSyncTime).toLocaleString()} [${syncStore.lastProvider
              }]`
              : Locale.Settings.Sync.NotSyncYet
          }
        >
          <div style={{ display: "flex" }}>
            <IconButton
              icon={<ConfigIcon />}
              text={Locale.UI.Config}
              onClick={() => {
                setShowSyncConfigModal(true);
              }}
            />
            {couldSync && (
              <IconButton
                icon={<ResetIcon />}
                text={Locale.UI.Sync}
                onClick={async () => {
                  try {
                    await syncStore.sync();
                    showToast(Locale.Settings.Sync.Success);
                  } catch (e) {
                    showToast(Locale.Settings.Sync.Fail);
                    console.error("[Sync]", e);
                  }
                }}
              />
            )}
          </div>
        </ListItem>

        <ListItem
          title={Locale.Settings.Sync.LocalState}
          subTitle={Locale.Settings.Sync.Overview(stateOverview)}
        >
          <div style={{ display: "flex" }}>
            <IconButton
              icon={<UploadIcon />}
              text={Locale.UI.Export}
              onClick={() => {
                syncStore.export();
              }}
            />
            <IconButton
              icon={<DownloadIcon />}
              text={Locale.UI.Import}
              onClick={() => {
                syncStore.import();
              }}
            />
          </div>
        </ListItem>
      </List>

      {showSyncConfigModal && (
        <SyncConfigModal onClose={() => setShowSyncConfigModal(false)} />
      )}
    </>
  );
}

export function Settings() {
  const navigate = useNavigate();
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const config = useAppConfig();
  const updateConfig = config.update;

  // Auto-sync Bedrock models on component mount
  useAutoModelSync();

  const updateStore = useUpdateStore();
  const [checkingUpdate, setCheckingUpdate] = useState(false);
  const currentVersion = updateStore.formatVersion(updateStore.version);
  const remoteId = updateStore.formatVersion(updateStore.remoteVersion);
  const hasNewVersion = currentVersion !== remoteId;
  const updateUrl = getClientConfig()?.isApp ? RELEASE_URL : UPDATE_URL;

  function checkUpdate(force = false) {
    setCheckingUpdate(true);
    updateStore.getLatestVersion(force).then(() => {
      setCheckingUpdate(false);
    });

    console.log("[Update] local version ", updateStore.version);
    console.log("[Update] remote version ", updateStore.remoteVersion);
  }

  const accessStore = useAccessStore();
  const shouldHideBalanceQuery = useMemo(() => {
    const isOpenAiUrl = accessStore.openaiUrl.includes(OPENAI_BASE_URL);

    return (
      accessStore.hideBalanceQuery ||
      isOpenAiUrl ||
      accessStore.provider === ServiceProvider.Azure
    );
  }, [
    accessStore.hideBalanceQuery,
    accessStore.openaiUrl,
    accessStore.provider,
  ]);

  const usage = {
    used: updateStore.used,
    subscription: updateStore.subscription,
  };
  const [loadingUsage, setLoadingUsage] = useState(false);
  function checkUsage(force = false) {
    if (shouldHideBalanceQuery) {
      return;
    }

    setLoadingUsage(true);
    updateStore.updateUsage(force).finally(() => {
      setLoadingUsage(false);
    });
  }

  const enabledAccessControl = useMemo(
    () => accessStore.enabledAccessControl(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const promptStore = usePromptStore();
  const builtinCount = SearchService.count.builtin;
  const customCount = promptStore.getUserPrompts().length ?? 0;
  const [shouldShowPromptModal, setShowPromptModal] = useState(false);

  // Add state for showing model sync status
  const [showModelSyncStatus, setShowModelSyncStatus] = useState(false);

  const showUsage = accessStore.isAuthorized();
  useEffect(() => {
    // checks per minutes
    // checkUpdate();
    showUsage && checkUsage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const keydownEvent = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        navigate(Path.Home);
      }
    };
    if (clientConfig?.isApp) {
      // Force to set custom endpoint to true if it's app
      accessStore.update((state) => {
        state.useCustomConfig = true;
      });
    }
    document.addEventListener("keydown", keydownEvent);
    return () => {
      document.removeEventListener("keydown", keydownEvent);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const clientConfig = useMemo(() => getClientConfig(), []);
  const showAccessCode = enabledAccessControl && !clientConfig?.isApp;

  return (
    <ErrorBoundary>
      <div className="window-header" data-tauri-drag-region>
        <div className="window-header-title">
          <div className="window-header-main-title">
            {Locale.Settings.Title}
          </div>
          <div className="window-header-sub-title">
            {Locale.Settings.SubTitle}
          </div>
        </div>
        <div className="window-actions">
          <div className="window-action-button"></div>
          <div className="window-action-button"></div>
          <div className="window-action-button">
            <IconButton
              icon={<CloseIcon />}
              onClick={() => navigate(Path.Home)}
              bordered
            />
          </div>
        </div>
      </div>
      <div className={styles["settings"]}>
        <List>
          <ListItem title={Locale.Settings.Avatar}>
            <Popover
              onClose={() => setShowEmojiPicker(false)}
              content={
                <AvatarPicker
                  onEmojiClick={(avatar: string) => {
                    updateConfig((config) => (config.avatar = avatar));
                    setShowEmojiPicker(false);
                  }}
                />
              }
              open={showEmojiPicker}
            >
              <div
                className={styles.avatar}
                onClick={() => setShowEmojiPicker(true)}
              >
                <Avatar avatar={config.avatar} />
              </div>
            </Popover>
          </ListItem>

          {/* <ListItem
            title={Locale.Settings.Update.Version(currentVersion ?? "unknown")}
            subTitle={
              checkingUpdate
                ? Locale.Settings.Update.IsChecking
                : hasNewVersion
                  ? Locale.Settings.Update.FoundUpdate(remoteId ?? "ERROR")
                  : Locale.Settings.Update.IsLatest
            }
          >
            {checkingUpdate ? (
              <LoadingIcon />
            ) : hasNewVersion ? (
              <Link href={updateUrl} target="_blank" className="link">
                {Locale.Settings.Update.GoToUpdate}
              </Link>
            ) : (
              <IconButton
                icon={<ResetIcon></ResetIcon>}
                text={Locale.Settings.Update.CheckUpdate}
                onClick={() => checkUpdate(true)}
              />
            )}
          </ListItem> */}

          <ListItem title={Locale.Settings.SendKey}>
            <Select
              value={config.submitKey}
              onChange={(e) => {
                updateConfig(
                  (config) =>
                    (config.submitKey = e.target.value as any as SubmitKey),
                );
              }}
            >
              {Object.values(SubmitKey).map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </Select>
          </ListItem>

          <ListItem title={Locale.Settings.Theme}>
            <Select
              value={config.theme}
              onChange={(e) => {
                updateConfig(
                  (config) => (config.theme = e.target.value as any as Theme),
                );
              }}
            >
              {Object.values(Theme).map((v) => (
                <option value={v} key={v}>
                  {v}
                </option>
              ))}
            </Select>
          </ListItem>

          <ListItem title={Locale.Settings.Lang.Name}>
            <Select
              value={getLang()}
              onChange={(e) => {
                changeLang(e.target.value as any);
              }}
            >
              {AllLangs.map((lang) => (
                <option value={lang} key={lang}>
                  {ALL_LANG_OPTIONS[lang]}
                </option>
              ))}
            </Select>
          </ListItem>

          <ListItem
            title={Locale.Settings.FontSize.Title}
            subTitle={Locale.Settings.FontSize.SubTitle}
          >
            <InputRange
              title={`${config.fontSize ?? 14}px`}
              value={config.fontSize}
              min="12"
              max="40"
              step="1"
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.fontSize = Number.parseInt(e.currentTarget.value)),
                )
              }
            ></InputRange>
          </ListItem>

          <ListItem
            title={Locale.Settings.AutoGenerateTitle.Title}
            subTitle={Locale.Settings.AutoGenerateTitle.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.enableAutoGenerateTitle}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.enableAutoGenerateTitle = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>

          <ListItem
            title={Locale.Settings.SendPreviewBubble.Title}
            subTitle={Locale.Settings.SendPreviewBubble.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.sendPreviewBubble}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.sendPreviewBubble = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>

          <ListItem
            title={Locale.Settings.Metrics.Title}
            subTitle={Locale.Settings.Metrics.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.metrics}
              onChange={(e) =>
                updateConfig(
                  (config) => (config.metrics = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>
        </List>

        <SyncItems />

        <List>
          <ListItem
            title="Model Sync Status"
            subTitle="Bedrock model configuration synchronization"
          >
            <IconButton
              icon={showModelSyncStatus ? <CloseIcon /> : <ConfigIcon />}
              text={showModelSyncStatus ? "Hide" : "Show Status"}
              onClick={() => setShowModelSyncStatus(!showModelSyncStatus)}
            />
          </ListItem>
        </List>

        {showModelSyncStatus && (
          <div style={{ margin: "16px 0" }}>
            <ModelSyncStatus />
          </div>
        )}

        <List>
          <ListItem
            title={Locale.Settings.Mask.Splash.Title}
            subTitle={Locale.Settings.Mask.Splash.SubTitle}
          >
            <input
              type="checkbox"
              checked={!config.dontShowMaskSplashScreen}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                  (config.dontShowMaskSplashScreen =
                    !e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>

          <ListItem
            title={Locale.Settings.Mask.Builtin.Title}
            subTitle={Locale.Settings.Mask.Builtin.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.hideBuiltinMasks}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.hideBuiltinMasks = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>
        </List>

        <List>
          <ListItem
            title={Locale.Settings.Prompt.Disable.Title}
            subTitle={Locale.Settings.Prompt.Disable.SubTitle}
          >
            <input
              type="checkbox"
              checked={config.disablePromptHint}
              onChange={(e) =>
                updateConfig(
                  (config) =>
                    (config.disablePromptHint = e.currentTarget.checked),
                )
              }
            ></input>
          </ListItem>

          <ListItem
            title={Locale.Settings.Prompt.List}
            subTitle={Locale.Settings.Prompt.ListCount(
              builtinCount,
              customCount,
            )}
          >
            <IconButton
              icon={<EditIcon />}
              text={Locale.Settings.Prompt.Edit}
              onClick={() => setShowPromptModal(true)}
            />
          </ListItem>
        </List>

        <List id={SlotID.CustomModel}>
          {showAccessCode && (
            <ListItem
              title={Locale.Settings.Access.AccessCode.Title}
              subTitle={Locale.Settings.Access.AccessCode.SubTitle}
            >
              <PasswordInput
                value={accessStore.accessCode}
                type="text"
                placeholder={Locale.Settings.Access.AccessCode.Placeholder}
                onChange={(e) => {
                  accessStore.update(
                    (access) => (access.accessCode = e.currentTarget.value),
                  );
                }}
              />
            </ListItem>
          )}

          {!accessStore.hideUserApiKey && (
            <>
              {
                // Conditionally render the following ListItem based on clientConfig.isApp
                !clientConfig?.isApp && ( // only show if isApp is false
                  <ListItem
                    title={Locale.Settings.Access.CustomEndpoint.Title}
                    subTitle={Locale.Settings.Access.CustomEndpoint.SubTitle}
                  >
                    {/* <input
                      type="checkbox"
                      checked={accessStore.useCustomConfig}
                      onChange={(e) =>
                        accessStore.update(
                          (access) =>
                            (access.useCustomConfig = e.currentTarget.checked),
                        )
                      }
                    ></input> */}
                  </ListItem>
                )
              }
              {accessStore.useCustomConfig && (
                <>
                  {/* <ListItem
                    title={Locale.Settings.Access.Provider.Title}
                    subTitle={Locale.Settings.Access.Provider.SubTitle}
                  >
                    <Select
                      value={accessStore.provider}
                      onChange={(e) => {
                        accessStore.update(
                          (access) =>
                          (access.provider = e.target
                            .value as ServiceProvider),
                        );
                      }}
                    >
                      {Object.entries(ServiceProvider).map(([k, v]) => (
                        <option value={v} key={k}>
                          {k}
                        </option>
                      ))}
                    </Select>
                  </ListItem> */}

                  {accessStore.provider === "AWS" &&
                  !accessStore.awsCognitoUser ? (
                    <>
                      {/* <ListItem
                        title={Locale.Settings.Access.BRProxy.Title}
                        subTitle={Locale.Settings.Access.BRProxy.SubTitle}
                      >
                        <Select
                          value={accessStore.useBRProxy}
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.useBRProxy = e.target
                                  .value as UseBRProxy),
                            );
                          }}
                        >
                          {Object.entries(UseBRProxy).map(([k, v]) => (
                            <option value={v} key={k}>
                              {k}
                            </option>
                          ))}
                        </Select>
                      </ListItem> */}
                      <ListItem
                        title={Locale.Settings.Access.BRProxy.Title}
                        subTitle={Locale.Settings.Access.BRProxy.SubTitle}
                      >
                        <a href="https://github.com/aws-samples/sample-connector-for-bedrock" target="_blank">
                          <IconButton
                            text="BRConnector"
                            icon={<GithubIcon />}
                            bordered
                          /></a>
                        <input
                          type="checkbox"
                          checked={accessStore.useBRProxy === "True"}
                          onChange={(e) =>
                            accessStore.update(
                              (access) => {
                                access.useBRProxy = e.currentTarget.checked ? "True" : "False";
                              },
                            )
                          }
                        ></input>
                      </ListItem>
                      {accessStore.useBRProxy === "False" ? (
                        <>
                          <ListItem
                            title={Locale.Settings.Access.AWS.BedRockEndpoint.Title}
                            subTitle={
                              Locale.Settings.Access.AWS.BedRockEndpoint.SubTitle
                            }
                          >
                            <input
                              type="text"
                              value={accessStore.bedrockEndpoint}
                              onChange={(e) =>
                                accessStore.update(
                                  (access) =>
                                    (access.bedrockEndpoint = e.currentTarget.value),
                                )
                              }
                            ></input>
                          </ListItem>
                          <ListItem
                            title={Locale.Settings.Access.AWS.Region.Title}
                            subTitle={
                              Locale.Settings.Access.AWS.Region.SubTitle
                            }
                          >
                            <input
                              type="text"
                              value={accessStore.awsRegion}
                              placeholder={
                                Locale.Settings.Access.AWS.Region.Placeholder
                              }
                              onChange={(e) =>
                                accessStore.update(
                                  (access) =>
                                    (access.awsRegion = e.currentTarget.value),
                                )
                              }
                            ></input>
                          </ListItem>
                          <ListItem
                            title={Locale.Settings.Access.AWS.AccessKey.Title}
                            subTitle={
                              Locale.Settings.Access.AWS.AccessKey.SubTitle
                            }
                          >
                            <PasswordInput
                              value={accessStore.awsAccessKeyId}
                              type="text"
                              placeholder={
                                Locale.Settings.Access.AWS.AccessKey.Placeholder
                              }
                              onChange={(e) => {
                                accessStore.update(
                                  (access) =>
                                  (access.awsAccessKeyId =
                                    e.currentTarget.value),
                                );
                              }}
                            />
                          </ListItem>
                          <ListItem
                            title={Locale.Settings.Access.AWS.SecretKey.Title}
                            subTitle={
                              Locale.Settings.Access.AWS.SecretKey.SubTitle
                            }
                          >
                            <PasswordInput
                              value={accessStore.awsSecretAccessKey}
                              type="text"
                              placeholder={
                                Locale.Settings.Access.AWS.SecretKey.Placeholder
                              }
                              onChange={(e) => {
                                accessStore.update(
                                  (access) =>
                                  (access.awsSecretAccessKey =
                                    e.currentTarget.value),
                                );
                              }}
                            />
                          </ListItem>
                        </>
                      ) : accessStore.useBRProxy === "True" ? (
                        <>
                          <ListItem
                            title={Locale.Settings.Access.AWS.Endpoint.Title}
                            subTitle={
                              Locale.Settings.Access.AWS.Endpoint.SubTitle
                            }
                          >
                            <input
                              type="text"
                              value={accessStore.BRProxyUrl}
                              placeholder={BRProxy.ExampleEndpoint}
                              onChange={(e) =>
                                accessStore.update(
                                  (access) =>
                                    (access.BRProxyUrl = e.currentTarget.value),
                                )
                              }
                            ></input>
                          </ListItem>
                          <ListItem
                            title={Locale.Settings.Access.AWS.ApiKey.Title}
                            subTitle={
                              Locale.Settings.Access.AWS.ApiKey.SubTitle
                            }
                          >
                            <PasswordInput
                              value={accessStore.openaiApiKey}
                              type="text"
                              placeholder={
                                Locale.Settings.Access.OpenAI.ApiKey.Placeholder
                              }
                              onChange={(e) => {
                                accessStore.update(
                                  (access) =>
                                  (access.openaiApiKey =
                                    e.currentTarget.value),
                                );
                              }}
                            />
                          </ListItem>
                        </>
                      ) : null}
                    </>
                  ) : accessStore.provider === "OpenAI" ? (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.OpenAI.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.OpenAI.Endpoint.SubTitle
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.openaiUrl}
                          placeholder={OPENAI_BASE_URL}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.openaiUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.OpenAI.ApiKey.Title}
                        subTitle={Locale.Settings.Access.OpenAI.ApiKey.SubTitle}
                      >
                        <PasswordInput
                          value={accessStore.openaiApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.OpenAI.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.openaiApiKey = e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                    </>
                  ) : accessStore.provider === "Azure" ? (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.Azure.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.Azure.Endpoint.SubTitle +
                          Azure.ExampleEndpoint
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.azureUrl}
                          placeholder={Azure.ExampleEndpoint}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.azureUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Azure.ApiKey.Title}
                        subTitle={Locale.Settings.Access.Azure.ApiKey.SubTitle}
                      >
                        <PasswordInput
                          value={accessStore.azureApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.Azure.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.azureApiKey = e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Azure.ApiVerion.Title}
                        subTitle={
                          Locale.Settings.Access.Azure.ApiVerion.SubTitle
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.azureApiVersion}
                          placeholder="2023-08-01-preview"
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                              (access.azureApiVersion =
                                e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                    </>
                  ) : accessStore.provider === "Google" ? (
                    <>
                      <ListItem
                        title={Locale.Settings.Access.Google.Endpoint.Title}
                        subTitle={
                          Locale.Settings.Access.Google.Endpoint.SubTitle +
                          Google.ExampleEndpoint
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.googleUrl}
                          placeholder={Google.ExampleEndpoint}
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                                (access.googleUrl = e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Google.ApiKey.Title}
                        subTitle={Locale.Settings.Access.Google.ApiKey.SubTitle}
                      >
                        <PasswordInput
                          value={accessStore.googleApiKey}
                          type="text"
                          placeholder={
                            Locale.Settings.Access.Google.ApiKey.Placeholder
                          }
                          onChange={(e) => {
                            accessStore.update(
                              (access) =>
                                (access.googleApiKey = e.currentTarget.value),
                            );
                          }}
                        />
                      </ListItem>
                      <ListItem
                        title={Locale.Settings.Access.Google.ApiVersion.Title}
                        subTitle={
                          Locale.Settings.Access.Google.ApiVersion.SubTitle
                        }
                      >
                        <input
                          type="text"
                          value={accessStore.googleApiVersion}
                          placeholder="2023-08-01-preview"
                          onChange={(e) =>
                            accessStore.update(
                              (access) =>
                              (access.googleApiVersion =
                                e.currentTarget.value),
                            )
                          }
                        ></input>
                      </ListItem>
                    </>
                  ) : null}
                </>
              )}
            </>
          )}

          {!shouldHideBalanceQuery && !clientConfig?.isApp ? (
            <ListItem
              title={Locale.Settings.Usage.Title}
              subTitle={
                showUsage
                  ? loadingUsage
                    ? Locale.Settings.Usage.IsChecking
                    : Locale.Settings.Usage.SubTitle(
                      usage?.used ?? "[?]",
                      usage?.subscription ?? "[?]",
                    )
                  : Locale.Settings.Usage.NoAccess
              }
            >
              {!showUsage || loadingUsage ? (
                <div />
              ) : (
                <IconButton
                  icon={<ResetIcon></ResetIcon>}
                  text={Locale.Settings.Usage.Check}
                  onClick={() => checkUsage(true)}
                />
              )}
            </ListItem>
          ) : null}

          <ListItem
            title={Locale.Settings.Access.CustomModel.Title}
            subTitle={Locale.Settings.Access.CustomModel.SubTitle}
          >
            <input
              type="text"
              value={config.customModels}
              placeholder="model1,model2,model3"
              onChange={(e) =>
                config.update(
                  (config) => (config.customModels = e.currentTarget.value),
                )
              }
            ></input>
          </ListItem>
        </List>

        <List>
          <ModelConfigList
            modelConfig={config.modelConfig}
            updateConfig={(updater) => {
              const modelConfig = { ...config.modelConfig };
              updater(modelConfig);
              config.update((config) => (config.modelConfig = modelConfig));
            }}
          />
        </List>

        {shouldShowPromptModal && (
          <UserPromptModal onClose={() => setShowPromptModal(false)} />
        )}

        <BedrockModelSettings />

        <DangerItems />
      </div>
    </ErrorBoundary >
  );
}