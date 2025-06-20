import { useState, useRef, useEffect } from 'react';
import { Session, Message } from '../types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { mockAI } from '../utils/mockAI';
import { pythonAPI } from '../utils/pythonAPI';
import { RiRobot2Line } from 'react-icons/ri';
import { IoChatbubbleEllipsesOutline, IoLockClosedOutline, IoFlashOutline, IoDesktopOutline } from 'react-icons/io5';
import styles from '../styles/ChatArea.module.css';

interface ChatAreaProps {
  session: Session | undefined;
  onSendMessage: (content: string) => void;
  isElectron: boolean;
  backendAvailable: boolean;
  sessionId: string | null;
}

export default function ChatArea({ session, onSendMessage, isElectron, backendAvailable, sessionId }: ChatAreaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  const handleSendMessage = async (content: string) => {
    if (!session || isLoading || !sessionId) return;

    // Send user message (optimistic update)
    onSendMessage(content);
    setIsLoading(true);

    try {
      if (backendAvailable) {
        // Use backend API for AI response
        const response = await pythonAPI.sendMessage(sessionId, {
          message: content,
          stream: false
        });

        // Add AI response to UI
        onSendMessage(response.message.content);
      } else {
        // Fallback to mock AI service when backend unavailable
        console.log('🤖 Using mock AI service (backend unavailable)');
        const aiResponse = await mockAI.generateResponse(content);
        onSendMessage(aiResponse.content);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);

      // Try fallback to mock AI on backend error
      try {
        console.log('🤖 Backend failed, trying mock AI service');
        const aiResponse = await mockAI.generateResponse(content);
        onSendMessage(aiResponse.content);
      } catch (mockError) {
        console.error('Mock AI also failed:', mockError);
        onSendMessage('Sorry, I encountered an error while processing your message. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!session) {
    return (
      <div className={styles.chatArea}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><RiRobot2Line /></div>
          <h2 className={styles.emptyTitle}>Welcome to AI Chat Desktop</h2>
          <p className={styles.emptyDescription}>
            Select a conversation from the sidebar or create a new one to start chatting.
          </p>
          <div className={styles.features}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}><IoChatbubbleEllipsesOutline /></span>
              <span>Natural conversations with AI</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}><IoLockClosedOutline /></span>
              <span>Secure desktop application</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}><IoFlashOutline /></span>
              <span>Fast and responsive interface</span>
            </div>
            {isElectron && (
              <div className={styles.feature}>
                <span className={styles.featureIcon}><IoDesktopOutline /></span>
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
