import { useState } from 'react';
import { Session } from '../types/chat';
import { Agent } from '../types/agent';
import { IoChatbubbleEllipsesOutline, IoPencilOutline, IoTrashOutline } from 'react-icons/io5';
import { useAppTranslation } from '../contexts/I18nContext';
import NewChatButton from './NewChatButton';
import styles from '../styles/SessionList.module.css';

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateTitle: (sessionId: string, title: string) => void;
  // New Chat Button props
  defaultAgent: Agent | null;
  agents: Agent[];
  onCreateSession: (agentId?: string) => void;
  onSetDefaultAgent: (agentId: string) => void;
  backendAvailable: boolean;
}

export default function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onUpdateTitle,
  defaultAgent,
  agents,
  onCreateSession,
  onSetDefaultAgent,
  backendAvailable
}: SessionListProps) {
  const { t } = useAppTranslation('chat');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState('');

  const handleStartEdit = (session: Session) => {
    setEditingSessionId(session.id);
    setEditingTitle(session.title);
  };

  const handleSaveEdit = () => {
    if (editingSessionId && editingTitle.trim()) {
      onUpdateTitle(editingSessionId, editingTitle.trim());
    }
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const handleCancelEdit = () => {
    setEditingSessionId(null);
    setEditingTitle('');
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
  };

  const getLastMessage = (session: Session) => {
    if (session.messages.length === 0) return 'No messages yet';
    const lastMessage = session.messages[session.messages.length - 1];
    return lastMessage.content.length > 50 
      ? lastMessage.content.substring(0, 50) + '...'
      : lastMessage.content;
  };



  return (
    <div className={styles.sessionList}>
      <div className={styles.header}>
        <h2 className={styles.title}>{t('sessions.title')}</h2>
        <div className={styles.sessionCount}>{sessions.length}</div>
      </div>

      <div className={styles.sessions}>
        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}><IoChatbubbleEllipsesOutline /></div>
            <p className={styles.emptyText}>No conversations yet</p>
            <p className={styles.emptySubtext}>Start a new chat to begin</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              className={`${styles.sessionItem} ${
                activeSessionId === session.id ? styles.active : ''
              }`}
              onClick={() => onSelectSession(session.id)}
            >
              <div className={styles.sessionContent}>
                {editingSessionId === session.id ? (
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      className={styles.editInput}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveEdit();
                        if (e.key === 'Escape') handleCancelEdit();
                      }}
                      onBlur={handleSaveEdit}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <div className={styles.sessionHeader}>
                      <h3 className={styles.sessionTitle}>{session.title}</h3>
                      <div className={styles.sessionActions}>
                        <button
                          className={styles.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStartEdit(session);
                          }}
                          title={t('sessions.editTitle')}
                        >
                          <IoPencilOutline />
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          title={t('sessions.deleteConversation')}
                        >
                          <IoTrashOutline />
                        </button>
                      </div>
                    </div>
                    <p className={styles.lastMessage}>{getLastMessage(session)}</p>
                    <div className={styles.sessionMeta}>
                      <span className={styles.messageCount}>
                        {t('sessions.messages', { count: session.messages.length })}
                      </span>
                      <span className={styles.timestamp}>
                        {formatDate(session.updatedAt)}
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Chat Button - Fixed at bottom */}
      <div className={styles.newChatButtonWrapper}>
        <NewChatButton
          defaultAgent={defaultAgent}
          agents={agents}
          onCreateSession={onCreateSession}
          onSetDefaultAgent={onSetDefaultAgent}
          disabled={!backendAvailable}
        />
      </div>
    </div>
  );
}
