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
import { Session, Message } from '../types/chat';
import { Agent, SupportedModel, SupportedTool, AgentCreateRequest } from '../types/agent';
import { AppSetting, appSettingAPI } from '../utils/appSettingAPI';
import { pythonAPI } from '../utils/pythonAPI';
import { agentAPI } from '../utils/agentAPI';
import { convertBackendSession } from '../utils/typeConverters';
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
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [sessionListWidth, setSessionListWidth] = useState(280); // Default width
  const [isResizing, setIsResizing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Constants for resize constraints
  const MIN_SESSION_WIDTH = 200;
  const MAX_SESSION_WIDTH = 500;

  // Load data from backend on component mount
  useEffect(() => {
    loadSessionsFromBackend();
    if (currentView === 'agents') {
      loadAgentsFromBackend();
    }
  }, []);

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
          setActiveSessionId(backendSessions[0].id);
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

  const createNewSession = useCallback(async (initialMessage?: string) => {
    try {
      if (backendAvailable) {
        // Create session via backend API
        const backendSession = await pythonAPI.createSession({
          title: `Chat ${sessions.length + 1}`,
          initial_message: initialMessage
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

  const deleteSession = async (sessionId: string) => {
    try {
      // Optimistic update: remove from local state immediately
      const sessionToDelete = sessions.find(s => s.id === sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));

      if (activeSessionId === sessionId) {
        const remainingSessions = sessions.filter(s => s.id !== sessionId);
        setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
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
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing) return;

    const newWidth = e.clientX - 60; // Subtract sidebar width
    const constrainedWidth = Math.max(MIN_SESSION_WIDTH, Math.min(MAX_SESSION_WIDTH, newWidth));
    setSessionListWidth(constrainedWidth);
  }, [isResizing, MIN_SESSION_WIDTH, MAX_SESSION_WIDTH]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
  }, []);

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

  // Show loading state while initializing
  if (isLoading) {
    return (
      <div className={styles.chatLayout}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%',
          color: '#888',
          fontSize: '16px'
        }}>
          Loading sessions...
        </div>
      </div>
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
          onSelectSession={setActiveSessionId}
          onDeleteSession={deleteSession}
          onUpdateTitle={updateSessionTitle}
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
            isElectron={isElectron}
            backendAvailable={backendAvailable}
            sessionId={activeSessionId}
          />
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyStateContent}>
              <h2>Welcome to AI Chat Desktop</h2>
              {backendAvailable ? (
                <>
                  <p>You don't have any chat sessions yet.</p>
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
