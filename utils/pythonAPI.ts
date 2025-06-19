/**
 * Python Backend API Client
 * HTTP client for communicating with the Python FastAPI backend
 */

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  status?: 'pending' | 'completed' | 'failed';
  metadata?: Record<string, any>;
}

export interface Session {
  id: string;
  title: string;
  messages: Message[];
  created_at: string;
  updated_at: string;
  metadata?: Record<string, any>;
}

export interface ChatRequest {
  message: string;
  stream?: boolean;
  temperature?: number;
  max_tokens?: number;
  model?: string;
}

export interface ChatResponse {
  message: Message;
  session_id: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface StreamChunk {
  content: string;
  finished: boolean;
  message_id?: string;
}

export interface SessionCreateRequest {
  title?: string;
  initial_message?: string;
}

export interface SessionUpdateRequest {
  title?: string;
}

export interface HealthResponse {
  status: string;
  timestamp: string;
  version: string;
  services: Record<string, string>;
}

export class PythonAPIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'PythonAPIError';
  }
}

export class PythonAPI {
  private baseURL: string;
  private timeout: number;

  constructor(
    baseURL: string = 'http://127.0.0.1:3867',
    timeout: number = 30000
  ) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/api/v1${endpoint}`;
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new PythonAPIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (error instanceof PythonAPIError) {
        throw error;
      }

      if (error instanceof Error && error.name === 'AbortError') {
        throw new PythonAPIError('Request timeout');
      }

      throw new PythonAPIError(
        error instanceof Error ? error.message : 'Network error occurred'
      );
    }
  }

  // Health and status
  async checkHealth(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/health');
  }

  async getStats(): Promise<any> {
    return this.request('/stats');
  }

  // Session management
  async getSessions(): Promise<{ sessions: Session[]; total: number }> {
    return this.request('/sessions');
  }

  async createSession(request: SessionCreateRequest): Promise<Session> {
    return this.request('/sessions', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async getSession(sessionId: string): Promise<Session> {
    return this.request(`/sessions/${sessionId}`);
  }

  async updateSession(
    sessionId: string,
    request: SessionUpdateRequest
  ): Promise<Session> {
    return this.request(`/sessions/${sessionId}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
  }

  async deleteSession(sessionId: string): Promise<{ message: string }> {
    return this.request(`/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async getSessionMessages(
    sessionId: string,
    limit?: number
  ): Promise<Message[]> {
    const params = limit ? `?limit=${limit}` : '';
    return this.request(`/sessions/${sessionId}/messages${params}`);
  }

  // Chat functionality
  async sendMessage(
    sessionId: string,
    request: ChatRequest
  ): Promise<ChatResponse> {
    return this.request(`/sessions/${sessionId}/chat`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

  async streamMessage(
    sessionId: string,
    request: ChatRequest,
    onChunk: (chunk: StreamChunk) => void,
    onError?: (error: Error) => void,
    onComplete?: () => void
  ): Promise<void> {
    const url = `${this.baseURL}/api/v1/sessions/${sessionId}/stream`;
    
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new PythonAPIError(
          errorData.message || `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new PythonAPIError('No response body reader available');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              onComplete?.();
              return;
            }

            try {
              const chunk: StreamChunk = JSON.parse(data);
              onChunk(chunk);
              
              if (chunk.finished) {
                onComplete?.();
                return;
              }
            } catch (error) {
              console.warn('Failed to parse chunk:', data);
            }
          }
        }
      }
    } catch (error) {
      onError?.(error instanceof Error ? error : new Error(String(error)));
    }
  }

  // Model information
  async getAvailableModels(): Promise<{ models: string[] }> {
    return this.request('/models');
  }

  async getModelInfo(modelName: string): Promise<{ model: string; info: any }> {
    return this.request(`/models/${modelName}`);
  }

  // Utility methods
  async isBackendHealthy(): Promise<boolean> {
    try {
      const health = await this.checkHealth();
      return health.status === 'healthy';
    } catch {
      return false;
    }
  }

  setBaseURL(url: string): void {
    this.baseURL = url;
  }

  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }
}

// Export singleton instance
export const pythonAPI = new PythonAPI();
