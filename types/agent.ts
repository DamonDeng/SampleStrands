// Agent types matching the backend API models

export interface ModelConfig {
  model_id: string;
  model_name: string;
  provider: string;
  temperature: number;
  max_tokens: number;
  top_p: number;
  stop_sequences: string[];
}

export interface ToolConfig {
  tool_id: string;
  tool_name: string;
  description: string;
  enabled: boolean;
  parameters: Record<string, any>;
}

export interface AgentConfig {
  name: string;
  description?: string;
  system_prompt?: string;
  preferred_region?: string;  // AWS region preference
  enable_advanced_settings?: boolean;  // Show/hide advanced model settings
  model_config: ModelConfig;  // Keep as model_config for frontend consistency
  tools: ToolConfig[];
  metadata?: Record<string, any>;
}

export interface Agent {
  id: string;
  config: AgentConfig;
  created_at: string;
  updated_at: string;
  active: boolean;
  usage_stats: Record<string, any>;
}

export interface AgentCreateRequest {
  config: AgentConfig;
}

export interface AgentUpdateRequest {
  config?: AgentConfig;
  active?: boolean;
}

export interface AgentListResponse {
  agents: Agent[];
  total: number;
}

export interface SupportedModel {
  model_id: string;
  model_name: string;
  provider: string;
  description: string;
  max_tokens: number;
  supports_streaming: boolean;
  supports_tools: boolean;
  category?: string;
}

export interface SupportedTool {
  tool_id: string;
  tool_name: string;
  description: string;
  category: string;
  parameters_schema: Record<string, any>;
  examples: string[];
}

export interface ModelsResponse {
  models: SupportedModel[];
  models_by_category: Record<string, SupportedModel[]>;
  total: number;
}

export interface ToolsResponse {
  tools: SupportedTool[];
  tools_by_category: Record<string, SupportedTool[]>;
  total: number;
}

// UI State types
export interface AgentState {
  agents: Agent[];
  selectedAgentId: string | null;
  isLoading: boolean;
  error: string | null;
  supportedModels: SupportedModel[];
  supportedTools: SupportedTool[];
}
