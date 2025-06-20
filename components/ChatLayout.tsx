import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import SessionList from './SessionList';
import ChatArea from './ChatArea';
import { Session, Message } from '../types/chat';
import { pythonAPI } from '../utils/pythonAPI';
import { convertBackendSession } from '../utils/typeConverters';
import { sessionSync } from '../utils/sessionSync';
import styles from '../styles/ChatLayout.module.css';

interface ChatLayoutProps {
  isElectron: boolean;
}

export default function ChatLayout({ isElectron }: ChatLayoutProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Load sessions from backend on component mount
  useEffect(() => {
    loadSessionsFromBackend();
  }, []);

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
          // Create a welcome session if no sessions exist
          await createNewSession('Welcome to AI Chat Desktop!');
        }
      } else {
        // Fallback to mock session when backend is unavailable
        console.warn('🐍 Backend unavailable, using fallback session');
        const fallbackSession: Session = {
          id: 'fallback-1',
          title: 'Welcome Chat (Offline)',
          messages: [
            {
              id: 'fallback-msg-1',
              content: 'Welcome to AI Chat Desktop! Backend is currently unavailable, using mock responses.',
              sender: 'assistant',
              timestamp: new Date(),
            }
          ],
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        setSessions([fallbackSession]);
        setActiveSessionId(fallbackSession.id);
      }
    } catch (error) {
      console.error('Failed to load sessions:', error);
      setBackendAvailable(false);
      // Use fallback session on error
      const errorSession: Session = {
        id: 'error-1',
        title: 'Welcome Chat (Error)',
        messages: [
          {
            id: 'error-msg-1',
            content: 'Welcome to AI Chat Desktop! There was an error connecting to the backend.',
            sender: 'assistant',
            timestamp: new Date(),
          }
        ],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      setSessions([errorSession]);
      setActiveSessionId(errorSession.id);
    } finally {
      setIsLoading(false);
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
        // Fallback to local session creation
        const newSession: Session = {
          id: Date.now().toString(),
          title: `Chat ${sessions.length + 1}`,
          messages: initialMessage ? [{
            id: Date.now().toString() + '-msg',
            content: initialMessage,
            sender: 'assistant',
            timestamp: new Date(),
          }] : [],
          createdAt: new Date(),
          updatedAt: new Date(),
        };

        setSessions(prev => [newSession, ...prev]);
        setActiveSessionId(newSession.id);

        return newSession;
      }
    } catch (error) {
      console.error('Failed to create session:', error);

      // Fallback to local session on error
      const fallbackSession: Session = {
        id: Date.now().toString(),
        title: `Chat ${sessions.length + 1} (Local)`,
        messages: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setSessions(prev => [fallbackSession, ...prev]);
      setActiveSessionId(fallbackSession.id);

      return fallbackSession;
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

      if (backendAvailable && sessionToDelete && !sessionToDelete.id.startsWith('fallback-') && !sessionToDelete.id.startsWith('error-')) {
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
      if (backendAvailable && sessionToUpdate && !sessionToUpdate.id.startsWith('fallback-') && !sessionToUpdate.id.startsWith('error-')) {
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
    <div className={styles.chatLayout}>
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
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={() => createNewSession()}
      />

      <SessionList
        sessions={sessions}
        activeSessionId={activeSessionId}
        onSelectSession={setActiveSessionId}
        onDeleteSession={deleteSession}
        onUpdateTitle={updateSessionTitle}
        collapsed={sidebarCollapsed}
      />

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
        isElectron={isElectron}
        backendAvailable={backendAvailable}
        sessionId={activeSessionId}
      />
    </div>
  );
}
