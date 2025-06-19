import { useState, useRef, useEffect } from 'react';
import { Session, Message } from '../types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { mockAI } from '../utils/mockAI';
import styles from '../styles/ChatArea.module.css';

interface ChatAreaProps {
  session: Session | undefined;
  onSendMessage: (content: string) => void;
  isElectron: boolean;
}

export default function ChatArea({ session, onSendMessage, isElectron }: ChatAreaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSendMessage = async (content: string) => {
    if (!session || isLoading) return;

    // Send user message
    onSendMessage(content);
    setIsLoading(true);

    try {
      // Get AI response using mock service
      const aiResponse = await mockAI.generateResponse(content);
      onSendMessage(aiResponse.content);
    } catch (error) {
      console.error('Error generating AI response:', error);
      onSendMessage('Sorry, I encountered an error while processing your message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className={styles.chatArea}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>🤖</div>
          <h2 className={styles.emptyTitle}>Welcome to AI Chat Desktop</h2>
          <p className={styles.emptyDescription}>
            Select a conversation from the sidebar or create a new one to start chatting.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>💬</span>
              <span>Natural conversations with AI</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>🔒</span>
              <span>Secure desktop application</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>⚡</span>
              <span>Fast and responsive interface</span>
            </div>
            {isElectron && (
              <div className={styles.feature}>
                <span className={styles.featureIcon}>🖥️</span>
                <span>Native desktop experience</span>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.chatArea}>
      <div className={styles.header}>
        <div className={styles.sessionInfo}>
          <h1 className={styles.sessionTitle}>{session.title}</h1>
          <p className={styles.sessionMeta}>
            {session.messages.length} messages • Last updated {session.updatedAt.toLocaleString()}
          </p>
        </div>
      </div>

      <div className={styles.messagesContainer}>
        <MessageList messages={session.messages} isLoading={isLoading} />
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <MessageInput 
          onSendMessage={handleSendMessage}
          disabled={isLoading}
          placeholder={isLoading ? "AI is thinking..." : "Type your message..."}
        />
      </div>
    </div>
  );
}
