import React from "react";
import {
  ModalConfigValidator, ModelConfig, useAppConfig, useAccessStore,
} from "../store";
import { getServerSideConfig } from "../config/server";
import { useEffect, useState } from "react";
import Locale from "../locales";
import { InputRange } from "./input-range";
import { ListItem, Select } from "./ui-lib";
// import { useAllModels } from "../utils/hooks";
import { IconButton } from "./button";
import ResetIcon from "../icons/reload.svg";
import { LLMModel } from "../client/api";
import { DEFAULT_MODELS } from "@/app/constant";

// Import new Bedrock model system
import { useBedrockModelsStore } from "../store/bedrock-models";
import { bedrockModelsToLLMModels } from "../utils/bedrock-models";

// 每个模型的特定配置定义
const MODEL_SPECIFIC_CONFIGS = {
  "claude-3.7-sonnet": {
    hasReasoning: true,
  },
  "anthropic.claude-3-7-sonnet-20250219-v1:0": {
    hasReasoning: true,
  },
};

// 默认配置
const DEFAULT_MODEL_CONFIG = {
  hasReasoning: false,
};

export function ModelConfigList(props: {
  modelConfig: ModelConfig;
  updateConfig: (updater: (config: ModelConfig) => void) => void;
}) {
  const appConfig = useAppConfig();
  const accessStore = useAccessStore();

  // New Bedrock models store
  const bedrockStore = useBedrockModelsStore();

  const { provider, useBRProxy, BRProxyUrl, openaiApiKey } = accessStore;

  // Combine legacy models with new Bedrock models
  const allAvailableModels = React.useMemo(() => {
    const legacyModels = appConfig.models?.filter(m => m.available) || [];
    const bedrockModels = bedrockModelsToLLMModels(bedrockStore.getActiveModels());
    
    // Remove duplicates by modelId, preferring Bedrock models
    const modelMap = new Map<string, LLMModel>();
    
    // Add legacy models first
    legacyModels.forEach(model => {
      modelMap.set(model.modelId || model.name, model);
    });
    
    // Add Bedrock models (will override legacy models with same ID)
    bedrockModels.forEach(model => {
      modelMap.set(model.modelId || model.name, {
        ...model,
        displayName: `[Bedrock] ${model.displayName}`, // Mark Bedrock models
      });
    });
    
    return Array.from(modelMap.values());
  }, [appConfig.models, bedrockStore.models]);

  // 获取当前模型的特定配置
  const getModelConfig = (modelName: string) => {
    // 查找完全匹配
    if (MODEL_SPECIFIC_CONFIGS[modelName as keyof typeof MODEL_SPECIFIC_CONFIGS]) {
      return {
        ...DEFAULT_MODEL_CONFIG,
        ...MODEL_SPECIFIC_CONFIGS[modelName as keyof typeof MODEL_SPECIFIC_CONFIGS]
      };
    }
    
    // 查找部分匹配
    for (const key in MODEL_SPECIFIC_CONFIGS) {
      if (modelName.includes(key)) {
        return {
          ...DEFAULT_MODEL_CONFIG,
          ...MODEL_SPECIFIC_CONFIGS[key as keyof typeof MODEL_SPECIFIC_CONFIGS]
        };
      }
    }
    
    // 没有匹配，返回默认配置
    return { ...DEFAULT_MODEL_CONFIG };
  };
  
  const [modelSpecificConfig, setModelSpecificConfig] = useState(getModelConfig(props.modelConfig.model));
  
  // 当模型变化时更新特定配置
  useEffect(() => {
    setModelSpecificConfig(getModelConfig(props.modelConfig.model));
  }, [props.modelConfig.model]);

  useEffect(() => {
    const storedModels: LLMModel[] = appConfig.models;
    if (
      !storedModels ||
      storedModels.length === 0 ||
      !storedModels[0]?.displayName
    ) {
      appConfig.update(
        (config) => (config.models = DEFAULT_MODELS as any as LLMModel[]),
      );
    }
  }, [appConfig]);

  const handleRefreshModels = async () => {
    try {
      const http_headers: any = {};
      let model_url = "https://eiai.fun/bedrock-models.json";
      
      if (provider === "AWS" && useBRProxy === "True") {
        http_headers["Authorization"] = `Bearer ${openaiApiKey}`;
        model_url = BRProxyUrl + "/user/model/list-for-brclient?f=";
      }

      const response = await fetch(
        model_url + "?f=" + new Date().getTime().toString(),
        {
          method: 'GET',
          headers: http_headers,
        },
      );
      
      let remote_models = await response.json();
      if (provider === "AWS" && useBRProxy === "True") {
        remote_models = remote_models.data;
      }
      
      // Update legacy models
      appConfig.update(
        (config) => (config.models = remote_models as any as LLMModel[]),
      );
      
      // Also refresh Bedrock models
      await bedrockStore.refreshModels();
      
    } catch (e) {
      console.error("Failed to refresh models:", e);
    }
  };

  return (
    <>
      <ListItem title={Locale.Settings.DefaultModel.Title}>
        <div className="password-input-container">
          <Select
            value={props.modelConfig.model}
            onChange={(e) => {
              props.updateConfig(
                (config) =>
                (config.model = ModalConfigValidator.model(
                  e.currentTarget.value,
                )),
              );
              // 更新模型特定配置
              setModelSpecificConfig(getModelConfig(e.currentTarget.value));
            }}
          >
            <option value="">-- Select a Model --</option>
            
            {/* Group models by source */}
            {/* {appConfig.models?.filter(v => v.available).length > 0 && (
              <optgroup label="Legacy Models">
                {appConfig.models
                  .filter((v) => v.available)
                  .map((v, i) => (
                    <option value={v.name} key={`legacy-${i}`}>
                      {v.displayName || v.name} ({v.provider?.providerName})
                    </option>
                  ))}
              </optgroup>
            )} */}
            
            {bedrockStore.getActiveModels().length > 0 && (
              <optgroup label="Bedrock Models">
                {bedrockStore.getActiveModels().map((model) => (
                  <option value={model.modelId} key={`bedrock-${model.uuid}`}>
                    {model.modelName} ({model.providerName})
                    {model.isReasoningModel && " 🧠"}
                    {model.inputModalities.includes("IMAGE") && " 👁️"}
                  </option>
                ))}
              </optgroup>
            )}
          </Select>

          {/* <IconButton
            onClick={handleRefreshModels}
            icon={<ResetIcon />}
            title="Refresh both legacy and Bedrock models"
          /> */}
        </div>
      </ListItem>

      {/* Show model source info */}
      <ListItem
        title="Model Source"
        subTitle={
          bedrockStore.getModelById(props.modelConfig.model) 
            ? "Bedrock Model (New Configuration System)"
            : "Legacy Model"
        }
      >
        <div style={{ fontSize: "0.9em", color: "#666" }}>
          {bedrockStore.getModelById(props.modelConfig.model) ? (
            <div>
              • Config Version: {bedrockStore.getModelById(props.modelConfig.model)?.configVersion}
              • UUID: {bedrockStore.getModelById(props.modelConfig.model)?.uuid.slice(0, 8)}...
            </div>
          ) : (
            <div>• Using legacy model configuration</div>
          )}
        </div>
      </ListItem>
      {/* <ListItem
        title={Locale.Settings.Temperature.Title}
        subTitle={Locale.Settings.Temperature.SubTitle}
      >
        <InputRange
          value={props.modelConfig.temperature?.toFixed(1)}
          min="0"
          max="1" // lets limit it to 0-1
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
              (config.temperature = ModalConfigValidator.temperature(
                e.currentTarget.valueAsNumber,
              )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.TopP.Title}
        subTitle={Locale.Settings.TopP.SubTitle}
      >
        <InputRange
          value={(props.modelConfig.top_p ?? 1).toFixed(1)}
          min="0"
          max="1"
          step="0.1"
          onChange={(e) => {
            props.updateConfig(
              (config) =>
              (config.top_p = ModalConfigValidator.top_p(
                e.currentTarget.valueAsNumber,
              )),
            );
          }}
        ></InputRange>
      </ListItem>
      <ListItem
        title={Locale.Settings.MaxTokens.Title}
        subTitle={Locale.Settings.MaxTokens.SubTitle}
      >
        <input
          type="number"
          min={1024}
          max={512000}
          value={props.modelConfig.max_tokens}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
              (config.max_tokens = ModalConfigValidator.max_tokens(
                e.currentTarget.valueAsNumber,
              )),
            )
          }
        ></input>
      </ListItem>
      <ListItem
        title={Locale.Settings.InjectSystemPrompts.Title}
        subTitle={Locale.Settings.InjectSystemPrompts.SubTitle}
      >
        <input
          type="checkbox"
          checked={props.modelConfig.enableInjectSystemPrompts}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
              (config.enableInjectSystemPrompts =
                e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>

      <ListItem
        title={Locale.Settings.InputTemplate.Title}
        subTitle={Locale.Settings.InputTemplate.SubTitle}
      >
        <input
          type="text"
          value={props.modelConfig.template}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.template = e.currentTarget.value),
            )
          }
        ></input>
      </ListItem>

      <ListItem
        title={Locale.Settings.HistoryCount.Title}
        subTitle={Locale.Settings.HistoryCount.SubTitle}
      >
        <InputRange
          title={props.modelConfig.historyMessageCount.toString()}
          value={props.modelConfig.historyMessageCount}
          min="0"
          max="64"
          step="1"
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.historyMessageCount = e.target.valueAsNumber),
            )
          }
        ></InputRange>
      </ListItem> */}

      <ListItem
        title={Locale.Settings.CompressThreshold.Title}
        subTitle={Locale.Settings.CompressThreshold.SubTitle}
      >
        <input
          type="number"
          min={500}
          max={4000}
          value={props.modelConfig.compressMessageLengthThreshold}
          onChange={(e) =>
            props.updateConfig(
              (config) =>
              (config.compressMessageLengthThreshold =
                e.currentTarget.valueAsNumber),
            )
          }
        ></input>
      </ListItem>
      <ListItem title={Locale.Memory.Title} subTitle={Locale.Memory.Send}>
        <input
          type="checkbox"
          checked={props.modelConfig.sendMemory}
          onChange={(e) =>
            props.updateConfig(
              (config) => (config.sendMemory = e.currentTarget.checked),
            )
          }
        ></input>
      </ListItem>
      {/* 添加 Reasoning Config 配置项 */}
      {modelSpecificConfig.hasReasoning && (
        <>
          <ListItem
            title={Locale.Settings.Reasoning.Title}
            subTitle={Locale.Settings.Reasoning.SubTitle}
          >
            <Select
              value={props.modelConfig.reasoning_config?.type || "disabled"}
              onChange={(e) => {
                const type = e.currentTarget.value as "enabled" | "disabled";
                props.updateConfig((config) => {
                  // 确保 reasoning_config 存在
                  if (!config.reasoning_config) {
                    config.reasoning_config = {
                      type,
                      budget_tokens: Math.min(1024, config.max_tokens - 1)
                    };
                  } else {
                    config.reasoning_config.type = type;
                  }
                });
              }}
            >
              <option value="enabled">{Locale.Settings.Reasoning.Type.Enabled}</option>
              <option value="disabled">{Locale.Settings.Reasoning.Type.Disabled}</option>
            </Select>
          </ListItem>

          {props.modelConfig.reasoning_config?.type === "enabled" && (
            <ListItem
              title={Locale.Settings.ReasoningBudget.Title}
              subTitle={Locale.Settings.ReasoningBudget.SubTitle}
            >
              <input
                type="number"
                min={1024}
                max={props.modelConfig.max_tokens - 1}
                value={props.modelConfig.reasoning_config?.budget_tokens || 1024}
                onChange={(e) => {
                  const value = parseInt(e.currentTarget.value);
                  const safeValue = Math.max(1024, Math.min(value, props.modelConfig.max_tokens - 1));
                  
                  props.updateConfig((config) => {
                    if (config.reasoning_config) {
                      config.reasoning_config.budget_tokens = safeValue;
                    }
                  });
                }}
              />
            </ListItem>
          )}
        </>
      )}
    </>
  );
}
