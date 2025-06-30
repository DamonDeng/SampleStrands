/**
 * API client for App Settings management
 */

export interface AppSetting {
  id: string;
  setting_title: string;
  json_data: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface AppSettingCreateRequest {
  setting_title: string;
  json_data: Record<string, any>;
}

export interface AppSettingUpdateRequest {
  json_data: Record<string, any>;
}

export interface AppSettingListResponse {
  settings: AppSetting[];
  total: number;
}

class AppSettingAPI {
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

        console.log('🔐 AppSettingAPI: Security configuration initialized:', {
          useHttps: this.useHttps,
          baseURL: this.baseURL,
          hasToken: !!this.authToken
        });
      }
    } catch (error) {
      console.warn('⚠️ AppSettingAPI: Failed to initialize security config:', error);
    }
  }

  /**
   * Make authenticated request
   */
  private async request(url: string, options: RequestInit = {}): Promise<Response> {
    // Ensure security config is initialized
    if (!this.authToken && typeof window !== 'undefined' && window.electronAPI) {
      await this.initializeSecurityConfig();
    }

    // Prepare headers with authentication
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    // Add authentication token if available
    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    return fetch(url, {
      ...options,
      headers
    });
  }

  /**
   * Get all application settings
   */
  async getAllSettings(): Promise<AppSetting[]> {
    try {
      const response = await this.request(`${this.baseURL}/settings`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: AppSettingListResponse = await response.json();
      return data.settings;
    } catch (error) {
      console.error('Failed to fetch app settings:', error);
      throw error;
    }
  }

  /**
   * Get a specific setting by title
   */
  async getSettingByTitle(title: string): Promise<AppSetting | null> {
    try {
      const response = await this.request(`${this.baseURL}/settings/${encodeURIComponent(title)}`);
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch setting '${title}':`, error);
      throw error;
    }
  }

  /**
   * Create a new application setting
   */
  async createSetting(request: AppSettingCreateRequest): Promise<AppSetting> {
    try {
      const response = await this.request(`${this.baseURL}/settings`, {
        method: 'POST',
        body: JSON.stringify(request),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to create app setting:', error);
      throw error;
    }
  }

  /**
   * Update an existing application setting
   */
  async updateSetting(title: string, request: AppSettingUpdateRequest): Promise<AppSetting | null> {
    try {
      const response = await this.request(`${this.baseURL}/settings/${encodeURIComponent(title)}`, {
        method: 'PUT',
        body: JSON.stringify(request),
      });
      if (response.status === 404) {
        return null;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Failed to update setting '${title}':`, error);
      throw error;
    }
  }

  /**
   * Delete an application setting
   */
  async deleteSetting(title: string): Promise<boolean> {
    try {
      const response = await this.request(`${this.baseURL}/settings/${encodeURIComponent(title)}`, {
        method: 'DELETE',
      });
      if (response.status === 404) {
        return false;
      }
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error(`Failed to delete setting '${title}':`, error);
      throw error;
    }
  }

  /**
   * Get settings summary statistics
   */
  async getSettingsSummary(): Promise<{ total_settings: number; setting_titles: string[] }> {
    try {
      const response = await this.request(`${this.baseURL}/settings/stats/summary`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch settings summary:', error);
      throw error;
    }
  }

  /**
   * Initialize default application settings
   */
  async initializeDefaultSettings(): Promise<boolean> {
    try {
      const response = await this.request(`${this.baseURL}/settings/initialize`, {
        method: 'POST',
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }
      return true;
    } catch (error) {
      console.error('Failed to initialize default settings:', error);
      throw error;
    }
  }

  /**
   * Check if backend is available
   */
  async isBackendAvailable(): Promise<boolean> {
    try {
      const response = await this.request(`${this.baseURL}/health`, {
        method: 'GET',
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Update security configuration
   */
  async updateSecurityConfig(): Promise<void> {
    await this.initializeSecurityConfig();
  }
}

// Export singleton instance
export const appSettingAPI = new AppSettingAPI();
