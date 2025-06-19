import { useState, useEffect, useCallback } from 'react';
import Sidebar from './Sidebar';
import SessionList from './SessionList';
import ChatArea from './ChatArea';
import { Session, Message } from '../types/chat';
import styles from '../styles/ChatLayout.module.css';

interface ChatLayoutProps {
  isElectron: boolean;
}

export default function ChatLayout({ isElectron }: ChatLayoutProps) {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Initialize with a default session
  useEffect(() => {
    const defaultSession: Session = {
      id: '1',
      title: 'Welcome Chat',
      messages: [
        {
          id: '1',
          content: 'Welcome to AI Chat Desktop! This is your first conversation.',
          sender: 'assistant',
          timestamp: new Date(),
        }
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions([defaultSession]);
    setActiveSessionId(defaultSession.id);
  }, []);

  const createNewSession = useCallback(() => {
    const newSession: Session = {
      id: Date.now().toString(),
      title: `Chat ${sessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
  }, [sessions.length]);

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

  const deleteSession = (sessionId: string) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    
    if (activeSessionId === sessionId) {
      const remainingSessions = sessions.filter(s => s.id !== sessionId);
      setActiveSessionId(remainingSessions.length > 0 ? remainingSessions[0].id : null);
    }
  };

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions(prev => 
      prev.map(session => 
        session.id === sessionId 
          ? { ...session, title, updatedAt: new Date() }
          : session
      )
    );
  };

  const addMessage = (sessionId: string, message: Omit<Message, 'id'>) => {
    const newMessage: Message = {
      ...message,
      id: Date.now().toString(),
    };

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

  const activeSession = sessions.find(s => s.id === activeSessionId);

  return (
    <div className={styles.chatLayout}>
      <Sidebar 
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={createNewSession}
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
      />
    </div>
  );
}
