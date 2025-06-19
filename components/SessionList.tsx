import { useState } from 'react';
import { Session } from '../types/chat';
import styles from '../styles/SessionList.module.css';

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onDeleteSession: (sessionId: string) => void;
  onUpdateTitle: (sessionId: string, title: string) => void;
  collapsed: boolean;
}

export default function SessionList({
  sessions,
  activeSessionId,
  onSelectSession,
  onDeleteSession,
  onUpdateTitle,
  collapsed
}: SessionListProps) {
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

  if (collapsed) {
    return null;
  }

  return (
    <div className={styles.sessionList}>
      <div className={styles.header}>
        <h2 className={styles.title}>Conversations</h2>
        <div className={styles.sessionCount}>{sessions.length}</div>
      </div>

      <div className={styles.sessions}>
        {sessions.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>💬</div>
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
                          title="Edit title"
                        >
                          ✏️
                        </button>
                        <button
                          className={styles.actionButton}
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteSession(session.id);
                          }}
                          title="Delete conversation"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                    <p className={styles.lastMessage}>{getLastMessage(session)}</p>
                    <div className={styles.sessionMeta}>
                      <span className={styles.messageCount}>
                        {session.messages.length} messages
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
    </div>
  );
}
