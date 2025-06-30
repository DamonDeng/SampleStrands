// Agent API client functions

import { 
  Agent, 
  AgentCreateRequest, 
  AgentUpdateRequest, 
  AgentListResponse,
  SupportedModel,
  SupportedTool,
  ModelsResponse,
  ToolsResponse
} from '../types/agent';

class AgentAPI {
  private baseURL: string = 'http://127.0.0.1:3867/api/v1';
  private authToken: string | null = null;
  private useHttps: boolean = false;

  constructor() {
    this.initializeSecurityConfig();
  }

  /**
   * Initialize security configuration from Electron
   */
  private async initializeSecurityConfig(): Promise<void> {
    try {
      if (typeof window !== 'undefined' && window.electronAPI) {
        // Get security configuration from Electron
        const securityConfig = await window.electronAPI.getSecurityConfig();
        this.useHttps = securityConfig.useHttps;
        this.baseURL = `${securityConfig.baseURL}/api/v1`;

        // Get authentication token
        this.authToken = await window.electronAPI.getAuthToken();

        console.log('🔐 AgentAPI: Security configuration initialized:', {
          useHttps: this.useHttps,
          baseURL: this.baseURL,
          hasToken: !!this.authToken
        });
      }
    } catch (error) {
      console.warn('⚠️ AgentAPI: Failed to initialize security config:', error);
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // Ensure security config is initialized
    if (!this.authToken && typeof window !== 'undefined' && window.electronAPI) {
      await this.initializeSecurityConfig();
    }

    const url = `${this.baseURL}${endpoint}`;

    // Prepare headers with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authentication token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.detail || errorData.message || errorMessage;
      } catch {
        // If parsing fails, use the raw text
        errorMessage = errorText || errorMessage;
      }
      
      throw new Error(errorMessage);
    }

    return response.json();
  }

  // Agent CRUD operations
  async getAgents(): Promise<AgentListResponse> {
    console.log('🌐 AgentAPI: Fetching agents from /agents');
    console.log('🌐 Full URL will be:', `${this.baseURL}/agents`);
    try {
      const response = await this.request<AgentListResponse>('/agents');
      console.log('✅ AgentAPI: Successfully fetched agents:', response);
      return response;
    } catch (error) {
      console.error('❌ AgentAPI: Failed to fetch agents:', error);
      throw error;
    }
  }

  async getAgent(agentId: string): Promise<Agent> {
    return this.request<Agent>(`/agents/${agentId}`);
  }

  async quickCreateAgent(): Promise<Agent> {
    console.log('🚀 AgentAPI: Quick creating agent with defaults');
    try {
      const response = await this.request<Agent>('/agents/quick', {
        method: 'POST',
      });
      console.log('✅ AgentAPI: Successfully quick created agent:', response);
      return response;
    } catch (error) {
      console.error('❌ AgentAPI: Failed to quick create agent:', error);
      throw error;
    }
  }

  async createAgent(request: AgentCreateRequest): Promise<Agent> {
    return this.request<Agent>('/agents', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async updateAgent(agentId: string, request: AgentUpdateRequest): Promise<Agent> {
    return this.request<Agent>(`/agents/${agentId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteAgent(agentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/agents/${agentId}`, {
      method: 'DELETE',
    });
  }

  // Agent operations
  async getAgentConfig(agentId: string): Promise<any> {
    return this.request<any>(`/agents/${agentId}/config`);
  }

  async activateAgent(agentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/agents/${agentId}/activate`, {
      method: 'POST',
    });
  }

  async deactivateAgent(agentId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/agents/${agentId}/deactivate`, {
      method: 'POST',
    });
  }

  async getAgentStats(agentId: string): Promise<any> {
    return this.request<any>(`/agents/${agentId}/stats`);
  }

  // Configuration selection
  async getSupportedModels(): Promise<ModelsResponse> {
    console.log('🌐 AgentAPI: Fetching supported models from /models');
    try {
      const response = await this.request<ModelsResponse>('/models');
      console.log('✅ AgentAPI: Successfully fetched models:', response);
      return response;
    } catch (error) {
      console.error('❌ AgentAPI: Failed to fetch models:', error);
      throw error;
    }
  }

  async getModelInfo(modelId: string): Promise<{ model: SupportedModel }> {
    return this.request<{ model: SupportedModel }>(`/models/${modelId}`);
  }

  async getSupportedTools(): Promise<ToolsResponse> {
    console.log('🌐 AgentAPI: Fetching supported tools from /tools');
    try {
      const response = await this.request<ToolsResponse>('/tools');
      console.log('✅ AgentAPI: Successfully fetched tools:', response);
      return response;
    } catch (error) {
      console.error('❌ AgentAPI: Failed to fetch tools:', error);
      throw error;
    }
  }

  async getToolInfo(toolId: string): Promise<{ tool: SupportedTool }> {
    return this.request<{ tool: SupportedTool }>(`/tools/${toolId}`);
  }

  // Health check
  async isBackendHealthy(): Promise<boolean> {
    try {
      await this.request('/health');
      return true;
    } catch {
      return false;
    }
  }

  // Utility methods
  async checkBackendConnectivity(): Promise<boolean> {
    return this.isBackendHealthy();
  }

  /**
   * Update security configuration
   */
  async updateSecurityConfig(): Promise<void> {
    await this.initializeSecurityConfig();
  }

  /**
   * Get current security status
   */
  getSecurityStatus(): {
    useHttps: boolean;
    hasToken: boolean;
    baseURL: string;
  } {
    return {
      useHttps: this.useHttps,
      hasToken: !!this.authToken,
      baseURL: this.baseURL
    };
  }
}

// Export singleton instance
export const agentAPI = new AgentAPI();

// Export individual functions for convenience
export const {
  getAgents,
  getAgent,
  quickCreateAgent,
  createAgent,
  updateAgent,
  deleteAgent,
  getAgentConfig,
  activateAgent,
  deactivateAgent,
  getAgentStats,
  getSupportedModels,
  getModelInfo,
  getSupportedTools,
  getToolInfo,
  isBackendHealthy,
  checkBackendConnectivity,
} = agentAPI;
