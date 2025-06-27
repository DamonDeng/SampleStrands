import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import SessionList from './SessionList';
import ChatArea from './ChatArea';
import AgentList from './AgentList';
import AgentDetail from './AgentDetail';
import AgentCreateModal from './AgentCreateModal';
import SettingList from './SettingList';
import SettingGeneralDetail from './SettingGeneralDetail';
import SettingAdvancedDetail from './SettingAdvancedDetail';
import AppLoadingScreen from './AppLoadingScreen';
import { Session, Message } from '../types/chat';
import { Agent, SupportedModel, SupportedTool, AgentCreateRequest } from '../types/agent';
import { AppSetting, appSettingAPI } from '../utils/appSettingAPI';
import { pythonAPI } from '../utils/pythonAPI';
import { agentAPI } from '../utils/agentAPI';
import { convertBackendSession, convertBackendMessage } from '../utils/typeConverters';
import { sessionSync } from '../utils/sessionSync';
import styles from '../styles/ChatLayout.module.css';

interface ChatLayoutProps {
  isElectron: boolean;
}

export default function ChatLayout({ isElectron }: ChatLayoutProps) {
  // Chat state
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);

  // Agent state
  const [agents, setAgents] = useState<Agent[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [supportedModels, setSupportedModels] = useState<SupportedModel[]>([]);
  const [supportedTools, setSupportedTools] = useState<SupportedTool[]>([]);

  // Settings state
  const [settings, setSettings] = useState<AppSetting[]>([]);
  const [selectedSettingTitle, setSelectedSettingTitle] = useState<string | null>(null);
  const [settingsLoading, setSettingsLoading] = useState(false);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  // Debug logging for state changes
  useEffect(() => {
    console.log('🔄 supportedModels state changed:', {
      count: supportedModels.length,
      models: supportedModels
    });
  }, [supportedModels]);

  useEffect(() => {
    console.log('🔄 supportedTools state changed:', {
      count: supportedTools.length,
      tools: supportedTools
    });
  }, [supportedTools]);

  // UI state
  const [currentView, setCurrentView] = useState<'chat' | 'agents' | 'settings' | 'help'>('chat');
  const [isLoading, setIsLoading] = useState(true);
  const [isInitializing, setIsInitializing] = useState(true); // New state for app initialization
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [sessionListWidth, setSessionListWidth] = useState(280); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [lastManualResize, setLastManualResize] = useState<number>(0); // Timestamp of last manual resize

  // Debug: Track sessionListWidth changes
  useEffect(() => {
    const gridTemplate = `60px ${sessionListWidth}px 4px 1fr`;
    console.log('📏 Session list width changed to:', sessionListWidth);
    console.log('🎨 CSS Grid template:', gridTemplate);
  }, [sessionListWidth]);

  // Constants for resize constraints
  const SIDEBAR_WIDTH = 60;
  const RESIZE_HANDLE_WIDTH = 4;
  const MIN_SESSION_WIDTH = 150; // Reduced from 200px for better small screen support
  const MAX_SESSION_WIDTH = 500;
  const MIN_CHAT_AREA_WIDTH = 300; // Minimum width for the third column (chat area)

  // Initialize app - check backend availability first
  useEffect(() => {
    console.log('🚀 Initializing app...');
    setIsInitializing(true);
    // Start by loading sessions, which will check backend availability
    loadSessionsFromBackend();
  }, []);

  // Load agents and settings when backend becomes available
  useEffect(() => {
    if (backendAvailable && isInitializing) {
      console.log('✅ Backend available, loading agents and settings...');
      Promise.all([
        loadAgentsFromBackend(),
        loadSettingsFromBackend()
      ]).then(() => {
        setIsInitializing(false);
        console.log('🎉 App initialization complete');
      }).catch(error => {
        console.error('Failed to load initial data:', error);
        setIsInitializing(false);
      });
    } else if (!backendAvailable && !isLoading) {
      // Backend not available and we're done checking
      setIsInitializing(false);
      console.log('⚠️ App initialized without backend');
    }
  }, [backendAvailable, isInitializing, isLoading]);

  // Load agents when switching to agent view
  useEffect(() => {
    if (currentView === 'agents' && backendAvailable) {
      loadAgentsFromBackend();
    }
  }, [currentView, backendAvailable]);

  // Load settings and agents when switching to settings view
  useEffect(() => {
    if (currentView === 'settings' && backendAvailable) {
      loadSettingsFromBackend();
      // Also load agents for the default agent dropdown in general settings
      if (agents.length === 0) {
        loadAgentsFromBackend();
      }
    }
  }, [currentView, backendAvailable, agents.length]);

  // Periodic sync with backend (every 30 seconds)
  useEffect(() => {
    if (!backendAvailable) return;

    const syncInterval = setInterval(async () => {
      try {
        const isStillHealthy = await sessionSync.checkBackendConnectivity();
        if (isStillHealthy !== backendAvailable) {
          setBackendAvailable(isStillHealthy);

          if (isStillHealthy) {
            console.log('🔄 Backend reconnected, syncing sessions...');
            await loadSessionsFromBackend();
          } else {
            console.warn('⚠️ Backend connection lost');
          }
        }
      } catch (error) {
        console.error('Sync check failed:', error);
      }
    }, 30000); // 30 seconds

    return () => clearInterval(syncInterval);
  }, [backendAvailable]);

  const loadSessionsFromBackend = async () => {
    try {
      setIsLoading(true);

      // Check if backend is available
      const isHealthy = await pythonAPI.isBackendHealthy();
      setBackendAvailable(isHealthy);

      if (isHealthy) {
        // Load sessions from backend
        const response = await pythonAPI.getSessions();
        const backendSessions = response.sessions.map(convertBackendSession);
        setSessions(backendSessions);

        // Set active session to the first one, or create a new one if none exist
        if (backendSessions.length > 0) {
          // Use selectSession to properly load messages for the first session
          await selectSession(backendSessions[0].id);
        } else {
          // No sessions exist, user can create a new one
          setSessions([]);
          setActiveSessionId(null);
        }
      } else {
        // Backend unavailable - show empty state
        console.warn('🐍 Backend unavailable, showing empty state');
        setSessions([]);
        setActiveSessionId(null);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setBackendAvailable(false);
      // Show empty state on error
      setSessions([]);
      setActiveSessionId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const loadAgentsFromBackend = async () => {
    try {
      if (!backendAvailable) {
        console.log('⚠️ Backend not available, skipping agent loading');
        return;
      }

      console.log('🔄 Loading agents, models, and tools from backend...');

      // Test models and tools first (separately from agents)
      console.log('🧪 Testing models and tools APIs independently...');
      try {
        const modelsResponse = await agentAPI.getSupportedModels();
        console.log('✅ Models API works:', modelsResponse);
        setSupportedModels(modelsResponse.models);

        const toolsResponse = await agentAPI.getSupportedTools();
        console.log('✅ Tools API works:', toolsResponse);

        console.log('📋 Models response:', modelsResponse);
        console.log('🔧 Tools response:', toolsResponse);


        // setSupportedTools(toolsResponse.tools);
        setSupportedModels(modelsResponse.models);
        setSupportedTools(toolsResponse.tools);

      } catch (error) {
        console.error('❌ Models/Tools API failed:', error);
      }

      // Now try agents (this might fail)
      try {
        const agentsResponse = await agentAPI.getAgents();
        console.log('🤖 Agents response:', agentsResponse);
        setAgents(agentsResponse.agents);
      } catch (error) {
        console.error('❌ Agents API failed (but continuing with models/tools):', error);
        // Continue anyway - we have models and tools
      }




      // console.log(`✅ Successfully loaded:`, {
      //   agents: agentsResponse.agents.length,
      //   models: modelsResponse.models.length,
      //   tools: toolsResponse.tools.length
      // });

      // console.log('📊 Supported models details:', modelsResponse.models);
    } catch (error) {
      console.error('❌ Failed to load agents:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(`Failed to load agents: ${errorMessage}`);
      setTimeout(() => setSyncError(null), 5000);
    }
  };

  const createNewSession = useCallback(async (initialMessage?: string, agentId?: string) => {
    try {
      if (backendAvailable) {
        // Create session via backend API
        const backendSession = await pythonAPI.createSession({
          title: `Chat ${sessions.length + 1}`,
          initial_message: initialMessage,
          agent_id: agentId
        });

        const newSession = convertBackendSession(backendSession);

        // Optimistic update: add to local state immediately
        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);

        return newSession;
      } else {
        // Backend unavailable - cannot create session
        console.warn('🐍 Cannot create session: Backend unavailable');
        throw new Error('Backend unavailable - cannot create new session');
      }
    } catch (error) {
      console.error('Failed to create session:', error);

      // Re-throw the error to let the caller handle it
      throw error;
    }
  }, [sessions.length, backendAvailable]);

  // Listen for new chat events from Electron menu
  useEffect(() => {
    if (isElectron && window.electronAPI) {
      const handleNewChat = () => {
        createNewSession();
      };

      window.electronAPI.onNewChat(handleNewChat);

      return () => {
        if (window.electronAPI) {
          window.electronAPI.removeAllListeners('new-chat');
        }
      };
    }
  }, [isElectron, createNewSession]);

  const loadSessionMessages = async (sessionId: string) => {
    try {
      if (!backendAvailable) {
        console.warn('🐍 Backend not available, cannot load session messages');
        return;
      }

      console.log(`📥 Loading messages for session ${sessionId}`);
      const messages = await pythonAPI.getSessionMessages(sessionId);

      // Update the session in our local state with the loaded messages
      setSessions(prev => prev.map(session => {
        if (session.id === sessionId) {
          const backendMessages = messages.map(convertBackendMessage);
          console.log(`✅ Loaded ${backendMessages.length} messages for session ${sessionId}`);
          return {
            ...session,
            messages: backendMessages
          };
        }
        return session;
      }));
    } catch (error) {
      console.error(`❌ Failed to load messages for session ${sessionId}:`, error);
    }
  };

  const selectSession = async (sessionId: string) => {
    console.log(`🎯 Selecting session ${sessionId}`);

    // Set the active session immediately for UI responsiveness
    setActiveSessionId(sessionId);

    // Check if this session already has messages loaded
    const session = sessions.find(s => s.id === sessionId);
    if (session && session.messages.length === 0) {
      // Session has no messages loaded, fetch them from backend
      await loadSessionMessages(sessionId);
    }
  };

  const deleteSession = async (sessionId: string) => {
    try {
      // Optimistic update: remove from local state immediately
      const sessionToDelete = sessions.find(s => s.id === sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));

      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        if (remainingSessions.length > 0) {
          // Use selectSession to properly load messages for the next session
          await selectSession(remainingSessions[0].id);
        } else {
          setActiveSessionId(null);
        }
      }

      if (backendAvailable && sessionToDelete) {
        // Delete from backend (fire and forget, optimistic update already done)
        pythonAPI.deleteSession(sessionId).catch(error => {
          console.error('Failed to delete session from backend:', error);
          setSyncError(`Failed to sync session deletion: ${error.message}`);

          // Clear error after 5 seconds
          setTimeout(() => setSyncError(null), 5000);
        });
      }
    } catch (error) {
      console.error('Failed to delete session:', error);
    }
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    try {
      // Optimistic update: update local state immediately
      setSessions(prev =>
        prev.map(session =>
          session.id === sessionId
            ? { ...session, title, updatedAt: new Date() }
            : session
        )
      );

      const sessionToUpdate = sessions.find(s => s.id === sessionId);
      if (backendAvailable && sessionToUpdate) {
        // Update backend (fire and forget, optimistic update already done)
        pythonAPI.updateSession(sessionId, { title }).catch(error => {
          console.error('Failed to update session title in backend:', error);
          setSyncError(`Failed to sync title update: ${error.message}`);

          // Clear error after 5 seconds
          setTimeout(() => setSyncError(null), 5000);
        });
      }
    } catch (error) {
      console.error('Failed to update session title:', error);
    }
  };

  const addMessage = (sessionId: string, message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
    };

    // Optimistic update: add to local state immediately
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              updatedAt: new Date()
            }
          : session
      )
    );

    // Note: Backend message handling is done in ChatArea component
    // when AI responses are generated, not here for user messages
  };

  const addAIMessage = (sessionId: string, content: string) => {
    const newMessage: Message = {
      content,
      sender: 'assistant',
      timestamp: new Date(),
      id: Date.now().toString(),
    };

    // Add AI response to local state
    setSessions(prev =>
      prev.map(session =>
        session.id === sessionId
          ? {
              ...session,
              messages: [...session.messages, newMessage],
              updatedAt: new Date()
            }
          : session
      )
    );
  };

  const handleStreamingUpdate = (content: string) => {
    // This is called during streaming to update the UI
    // The actual message will be added when streaming completes via onAIResponse
    // For now, this is just for UI feedback - the streaming content is handled in ChatArea
    console.log('🌊 Streaming update:', content.length, 'characters');
  };

  // Agent management functions
  const handleSelectAgent = (agentId: string) => {
    // If switching to a different agent, trigger auto-save for current agent
    if (selectedAgentId && selectedAgentId !== agentId) {
      // The AgentDetail component will handle auto-save on unmount
    }
    setSelectedAgentId(agentId);
  };

  const handleAgentChange = () => {
    // Called when navigating away from an agent
    // This can be used for additional cleanup if needed
    console.log('🔄 Agent navigation detected');
  };

  const handleDeleteAgent = async (agentId: string) => {
    try {
      // Optimistic update: remove from local state immediately
      setAgents(prev => prev.filter(a => a.id !== agentId));

      if (selectedAgentId === agentId) {
        setSelectedAgentId(null);
      }

      if (backendAvailable) {
        // Delete from backend
        await agentAPI.deleteAgent(agentId);
        console.log(`🗑️ Deleted agent ${agentId}`);
      }
    } catch (error) {
      console.error('Failed to delete agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(`Failed to delete agent: ${errorMessage}`);
      setTimeout(() => setSyncError(null), 5000);

      // Reload agents to restore state
      loadAgentsFromBackend();
    }
  };

  const handleUpdateAgent = async (agentId: string, updates: any) => {
    try {
      if (backendAvailable) {
        const updatedAgent = await agentAPI.updateAgent(agentId, updates);

        // Update local state
        setAgents(prev => prev.map(agent =>
          agent.id === agentId ? updatedAgent : agent
        ));

        console.log(`✏️ Updated agent ${agentId}`);
      }
    } catch (error) {
      console.error('Failed to update agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(`Failed to update agent: ${errorMessage}`);
      setTimeout(() => setSyncError(null), 5000);
    }
  };

  const handleToggleAgent = async (agentId: string, isActive: boolean) => {
    try {
      if (backendAvailable) {
        if (isActive) {
          await agentAPI.activateAgent(agentId);
        } else {
          await agentAPI.deactivateAgent(agentId);
        }

        // Update local state
        setAgents(prev => prev.map(agent =>
          agent.id === agentId ? { ...agent, is_active: isActive } : agent
        ));

        console.log(`${isActive ? '▶️' : '⏸️'} ${isActive ? 'Activated' : 'Deactivated'} agent ${agentId}`);
      }
    } catch (error) {
      console.error('Failed to toggle agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(`Failed to toggle agent: ${errorMessage}`);
      setTimeout(() => setSyncError(null), 5000);
    }
  };

  const handleCreateAgent = () => {
    setShowCreateModal(true);
  };

  const handleQuickCreateAgent = async () => {
    try {
      if (backendAvailable) {
        const newAgent = await agentAPI.quickCreateAgent();

        // Add to local state
        setAgents(prev => [newAgent, ...prev]);
        setSelectedAgentId(newAgent.id);

        console.log(`🚀 Quick created new agent: ${newAgent.config.name}`);
      }
    } catch (error) {
      console.error('Failed to quick create agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(`Failed to create agent: ${errorMessage}`);
      setTimeout(() => setSyncError(null), 5000);
    }
  };

  const handleCreateAgentSubmit = async (request: AgentCreateRequest) => {
    try {
      if (backendAvailable) {
        const newAgent = await agentAPI.createAgent(request);

        // Add to local state
        setAgents(prev => [newAgent, ...prev]);
        setSelectedAgentId(newAgent.id);

        console.log(`🆕 Created new agent: ${newAgent.config.name}`);
      }
    } catch (error) {
      console.error('Failed to create agent:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(`Failed to create agent: ${errorMessage}`);
      setTimeout(() => setSyncError(null), 5000);
      throw error; // Re-throw to let modal handle it
    }
  };

  const loadSettingsFromBackend = async () => {
    try {
      if (!backendAvailable) {
        console.log('⚠️ Backend not available, skipping settings loading');
        return;
      }

      setSettingsLoading(true);
      setSettingsError(null);

      console.log('🔄 Loading settings from backend...');
      const settingsData = await appSettingAPI.getAllSettings();
      setSettings(settingsData);

      // Auto-select general setting if available and none selected
      if (settingsData.length > 0 && !selectedSettingTitle) {
        const generalSetting = settingsData.find(s => s.setting_title === 'general');
        setSelectedSettingTitle(generalSetting ? 'general' : settingsData[0].setting_title);
      }

      console.log(`✅ Successfully loaded ${settingsData.length} settings`);
    } catch (error) {
      console.error('❌ Failed to load settings:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSettingsError(`Failed to load settings: ${errorMessage}`);
    } finally {
      setSettingsLoading(false);
    }
  };

  // Settings management functions
  const handleSelectSetting = (settingTitle: string) => {
    setSelectedSettingTitle(settingTitle);
  };

  const handleUpdateSetting = async (settingTitle: string, jsonData: Record<string, any>) => {
    try {
      if (backendAvailable) {
        const updatedSetting = await appSettingAPI.updateSetting(settingTitle, { json_data: jsonData });

        if (updatedSetting) {
          // Update local state
          setSettings(prev => prev.map(setting =>
            setting.setting_title === settingTitle ? updatedSetting : setting
          ));

          console.log(`✏️ Updated setting ${settingTitle}`);
        }
      }
    } catch (error) {
      console.error('Failed to update setting:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setSyncError(`Failed to update setting: ${errorMessage}`);
      setTimeout(() => setSyncError(null), 5000);
    }
  };

  const handleSettingChange = () => {
    // Called when navigating away from a setting
    console.log('🔄 Setting navigation detected');
  };

  // Get shortcut preference from settings
  const getShortcutToSend = useCallback((): 'enter' | 'shift_enter' => {
    const generalSetting = settings.find(s => s.setting_title === 'general');
    return generalSetting?.json_data?.shortcut_to_send || 'shift_enter';
  }, [settings]);

  // Get default agent from settings
  const getDefaultAgent = useCallback(() => {
    const generalSetting = settings.find(s => s.setting_title === 'general');
    console.log('🔍 Getting default agent:', {
      settingsCount: settings.length,
      generalSetting: generalSetting?.json_data,
      agentsCount: agents.length,
      activeAgentsCount: agents.filter(a => a.is_active).length
    });

    if (!generalSetting?.json_data?.default_agent) {
      console.log('⚠️ No default agent set in settings');
      return null;
    }

    const defaultAgentId = generalSetting.json_data.default_agent;
    const defaultAgent = agents.find(agent => agent.id === defaultAgentId && agent.is_active);
    console.log('🎯 Default agent result:', defaultAgent?.config.name || 'Not found');
    return defaultAgent || null;
  }, [settings, agents]);

  // Set default agent in settings
  const handleSetDefaultAgent = useCallback(async (agentId: string) => {
    try {
      const generalSetting = settings.find(s => s.setting_title === 'general');
      if (!generalSetting) {
        console.error('General setting not found');
        return;
      }

      const updatedJsonData = {
        ...generalSetting.json_data,
        default_agent: agentId
      };

      await appSettingAPI.updateSetting('general', {
        json_data: updatedJsonData
      });

      // Update local settings state
      setSettings(prev => prev.map(setting =>
        setting.setting_title === 'general'
          ? { ...setting, json_data: updatedJsonData }
          : setting
      ));

      console.log(`✅ Set default agent to: ${agentId}`);
    } catch (error) {
      console.error('Failed to set default agent:', error);
    }
  }, [settings]);

  const handleNavigation = (view: 'chat' | 'agents' | 'settings' | 'help') => {
    // If leaving agents view with a selected agent, trigger auto-save
    if (currentView === 'agents' && selectedAgentId && view !== 'agents') {
      console.log('🔄 Leaving agents view, auto-save will be triggered by AgentDetail unmount');
    }

    setCurrentView(view);

    // Reset selections when switching views
    if (view === 'chat') {
      setSelectedAgentId(null);
    } else if (view === 'agents') {
      setActiveSessionId(null);
    }
  };

  // Resize handlers for session list
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    console.log('🖱️ Resize handle mouse down');
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const windowWidth = window.innerWidth;
    const newSessionWidth = e.clientX - SIDEBAR_WIDTH; // Subtract sidebar width

    // Ensure chat area doesn't go below minimum
    const maxAllowedSessionWidth = windowWidth - SIDEBAR_WIDTH - RESIZE_HANDLE_WIDTH - MIN_CHAT_AREA_WIDTH;

    // Apply all constraints
    const constrainedWidth = Math.max(
      MIN_SESSION_WIDTH,
      Math.min(MAX_SESSION_WIDTH, Math.min(newSessionWidth, maxAllowedSessionWidth))
    );

    console.log('🖱️ Resizing:', {
      currentSessionWidth: sessionListWidth,
      newSessionWidth,
      constrainedWidth,
      windowWidth,
      maxAllowed: maxAllowedSessionWidth,
      willUpdate: constrainedWidth !== sessionListWidth
    });

    // Only update if the width actually changed
    if (constrainedWidth !== sessionListWidth) {
      console.log('📏 Updating session width from', sessionListWidth, 'to', constrainedWidth);
      setSessionListWidth(constrainedWidth);
    }
  }, [isResizing, sessionListWidth, MIN_SESSION_WIDTH, MAX_SESSION_WIDTH, SIDEBAR_WIDTH, RESIZE_HANDLE_WIDTH, MIN_CHAT_AREA_WIDTH]);

  const handleMouseUp = useCallback(() => {
    console.log('🖱️ Resize handle mouse up');
    setIsResizing(false);
    setLastManualResize(Date.now()); // Record when manual resize ended
  }, []);

  // Window resize handler for intelligent column resizing
  const handleWindowResize = useCallback(() => {
    // Don't interfere with manual resizing
    if (isResizing) {
      console.log('🚫 Skipping window resize handler - manual resize in progress');
      return;
    }

    // Don't interfere shortly after manual resize to prevent snap-back
    const timeSinceManualResize = Date.now() - lastManualResize;
    if (timeSinceManualResize < 500) { // 500ms grace period
      console.log('🚫 Skipping window resize handler - recent manual resize');
      return;
    }

    const windowWidth = window.innerWidth;
    const minTotalWidth = SIDEBAR_WIDTH + MIN_SESSION_WIDTH + RESIZE_HANDLE_WIDTH + MIN_CHAT_AREA_WIDTH;

    console.log('🪟 Window resize handler triggered:', { windowWidth, minTotalWidth, currentSessionWidth: sessionListWidth });

    // If window is too small, let content overflow (don't resize columns)
    if (windowWidth < minTotalWidth) {
      console.log('🚫 Window too small, allowing overflow');
      return;
    }

    // Calculate available width for session list and chat area
    const availableWidth = windowWidth - SIDEBAR_WIDTH - RESIZE_HANDLE_WIDTH;
    const desiredChatAreaWidth = availableWidth - sessionListWidth;

    // Only adjust if there's a real constraint violation, not for optimization
    // This prevents the handler from "correcting" manual user adjustments

    // ONLY reduce session width if chat area is actually too small
    if (desiredChatAreaWidth < MIN_CHAT_AREA_WIDTH) {
      const newSessionWidth = Math.max(MIN_SESSION_WIDTH, availableWidth - MIN_CHAT_AREA_WIDTH);
      console.log('🔄 Window resize: reducing session width to', newSessionWidth, '(chat area too small)');
      setSessionListWidth(newSessionWidth);
    }
    // Don't automatically expand - let user control this manually
    // The old auto-expand logic was causing the snap-back behavior
  }, [sessionListWidth, isResizing, lastManualResize, SIDEBAR_WIDTH, RESIZE_HANDLE_WIDTH, MIN_SESSION_WIDTH, MIN_CHAT_AREA_WIDTH]);

  // Add window resize listener for intelligent resizing
  useEffect(() => {
    window.addEventListener('resize', handleWindowResize);
    // Initial resize check
    handleWindowResize();

    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
  }, [handleWindowResize]);

  // Add global mouse event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, handleMouseMove, handleMouseUp]);

  const activeSession = sessions.find(s => s.id === activeSessionId);

  // Show loading screen while app is initializing
  if (isInitializing) {
    return (
      <AppLoadingScreen
        backendAvailable={backendAvailable}
        isLoading={isLoading}
      />
    );
  }

  return (
    <div
      className={styles.chatLayout}
      style={{
        gridTemplateColumns: `60px ${sessionListWidth}px 4px 1fr`
      }}
    >
      {syncError && (
        <div style={{
          position: 'fixed',
          top: '10px',
          right: '10px',
          background: '#ff4444',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '4px',
          fontSize: '12px',
          zIndex: 1000,
          maxWidth: '300px'
        }}>
          ⚠️ {syncError}
        </div>
      )}

      <Sidebar
        onNewChat={() => createNewSession()}
        onNavigate={handleNavigation}
        activeView={currentView}
      />

      {currentView === 'chat' ? (
        <SessionList
          sessions={sessions}
          activeSessionId={activeSessionId}
          onSelectSession={selectSession}
          onDeleteSession={deleteSession}
          onUpdateTitle={updateSessionTitle}
          defaultAgent={getDefaultAgent()}
          agents={agents}
          onCreateSession={(agentId) => createNewSession(undefined, agentId)}
          onSetDefaultAgent={handleSetDefaultAgent}
          backendAvailable={backendAvailable}
        />
      ) : currentView === 'agents' ? (
        <AgentList
          agents={agents}
          selectedAgentId={selectedAgentId}
          onSelectAgent={handleSelectAgent}
          onDeleteAgent={handleDeleteAgent}
          onUpdateAgent={(agentId, name) => handleUpdateAgent(agentId, { config: { name } })}
          onToggleAgent={handleToggleAgent}
          onCreateAgent={handleQuickCreateAgent}
        />
      ) : currentView === 'settings' ? (
        <SettingList
          settings={settings}
          selectedSettingTitle={selectedSettingTitle}
          onSelectSetting={handleSelectSetting}
          loading={settingsLoading}
          error={settingsError}
        />
      ) : (
        <div style={{
          background: '#36393f',
          borderRight: '1px solid #40444b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#72767d',
          fontSize: '14px'
        }}>
          Help
        </div>
      )}

      {/* Resize handle */}
      <div
        className={styles.resizeHandle}
        onMouseDown={handleMouseDown}
        style={{
          cursor: isResizing ? 'col-resize' : 'col-resize'
        }}
      />

      {currentView === 'chat' ? (
        activeSession ? (
          <ChatArea
            session={activeSession}
            onSendMessage={(content) => {
              if (activeSessionId) {
                addMessage(activeSessionId, {
                  content,
                  sender: 'user',
                  timestamp: new Date(),
                });
              }
            }}
            onAIResponse={(content) => {
              if (activeSessionId) {
                addAIMessage(activeSessionId, content);
              }
            }}
            onStreamingUpdate={handleStreamingUpdate}
            isElectron={isElectron}
            backendAvailable={backendAvailable}
            sessionId={activeSessionId}
            shortcutToSend={getShortcutToSend()}
          />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <h2>Welcome to SampleStrands</h2>
              {backendAvailable ? (
                <>
                  <p>You don&apos;t have any chat sessions yet.</p>
                  <button
                    className={styles.createSessionButton}
                    onClick={() => createNewSession().catch(console.error)}
                  >
                    Start New Chat
                  </button>
                </>
              ) : (
                <>
                  <p>Backend service is currently unavailable.</p>
                  <p>Please check that the Python backend is running.</p>
                  <button
                    className={styles.retryButton}
                    onClick={() => loadSessionsFromBackend()}
                  >
                    Retry Connection
                  </button>
                </>
              )}
            </div>
          </div>
        )
      ) : currentView === 'settings' ? (
        selectedSettingTitle && settings.find(s => s.setting_title === selectedSettingTitle) ? (
          selectedSettingTitle === 'general' ? (
            <SettingGeneralDetail
              setting={settings.find(s => s.setting_title === 'general')!}
              agents={agents}
              onUpdateSetting={handleUpdateSetting}
              onSettingChange={handleSettingChange}
            />
          ) : selectedSettingTitle === 'advanced' ? (
            <SettingAdvancedDetail
              setting={settings.find(s => s.setting_title === 'advanced')!}
              onUpdateSetting={handleUpdateSetting}
              onSettingChange={handleSettingChange}
            />
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyStateContent}>
                <h2>Unknown Setting</h2>
                <p>The selected setting type is not recognized.</p>
              </div>
            </div>
          )
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <h2>Settings</h2>
              {backendAvailable ? (
                <p>Select a setting category to configure your preferences.</p>
              ) : (
                <>
                  <p>Backend service is currently unavailable.</p>
                  <p>Please check that the Python backend is running.</p>
                  <button
                    className={styles.retryButton}
                    onClick={() => loadSettingsFromBackend()}
                  >
                    Retry Connection
                  </button>
                </>
              )}
            </div>
          </div>
        )
      ) : currentView === 'agents' ? (
        selectedAgentId && agents.find(a => a.id === selectedAgentId) ? (
          <AgentDetail
            agent={agents.find(a => a.id === selectedAgentId)!}
            supportedModels={supportedModels}
            supportedTools={supportedTools}
            onUpdateAgent={handleUpdateAgent}
            onToggleAgent={handleToggleAgent}
            onAgentChange={handleAgentChange}
          />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <h2>Agent Management</h2>
              {backendAvailable ? (
                <>
                  <p>Select an agent to view its configuration.</p>
                  <button
                    className={styles.createSessionButton}
                    onClick={handleQuickCreateAgent}
                  >
                    Create New Agent
                  </button>
                </>
              ) : (
                <>
                  <p>Backend service is currently unavailable.</p>
                  <p>Please check that the Python backend is running.</p>
                  <button
                    className={styles.retryButton}
                    onClick={() => loadSessionsFromBackend()}
                  >
                    Retry Connection
                  </button>
                </>
              )}
            </div>
          </div>
        )
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyStateContent}>
            <h2>Help</h2>
            <p>This feature is coming soon.</p>
          </div>
        </div>
      )}

      {/* Agent Creation Modal */}
      <AgentCreateModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateAgent={handleCreateAgentSubmit}
        supportedModels={supportedModels}
        supportedTools={supportedTools}
      />
    </div>
  );
}
