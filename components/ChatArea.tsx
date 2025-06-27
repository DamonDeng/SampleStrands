import { useState, useRef, useEffect } from 'react';
import { Session } from '../types/chat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import { mockAI } from '../utils/mockAI';
import { pythonAPI, StreamChunk } from '../utils/pythonAPI';
import { RiRobot2Line } from 'react-icons/ri';
import { IoChatbubbleEllipsesOutline, IoLockClosedOutline, IoFlashOutline, IoDesktopOutline } from 'react-icons/io5';
import styles from '../styles/ChatArea.module.css';

interface ChatAreaProps {
  session: Session | undefined;
  onSendMessage: (content: string) => void;
  onAIResponse: (content: string) => void;
  onStreamingUpdate: (content: string) => void;
  isElectron: boolean;
  backendAvailable: boolean;
  sessionId: string | null;
  shortcutToSend?: 'enter' | 'shift_enter';
}

export default function ChatArea({ session, onSendMessage, onAIResponse, onStreamingUpdate, isElectron, backendAvailable, sessionId, shortcutToSend = 'shift_enter' }: ChatAreaProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingContent, setStreamingContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session?.messages]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && streamingContent) {
      scrollToBottom();
    }
  }, [isStreaming, streamingContent]);

  const handleSendMessage = async (content: string) => {
    if (!session || isLoading || isStreaming || !sessionId) return;

    // Send user message (optimistic update)
    onSendMessage(content);
    setIsLoading(true);
    setStreamingContent('');

    try {
      if (backendAvailable) {
        // Use streaming backend API for AI response with agent information
        setIsStreaming(true);
        setIsLoading(false); // Not loading anymore, but streaming

        let accumulatedContent = '';

        await pythonAPI.streamMessage(
          sessionId,
          {
            message: content,
            agent_id: session.agentId,  // Send agent ID from session
            stream: true
          },
          // onChunk callback - called for each streaming chunk
          (chunk: StreamChunk) => {
            accumulatedContent += chunk.content;
            setStreamingContent(accumulatedContent);
            onStreamingUpdate(accumulatedContent);
          },
          // onError callback
          (error: Error) => {
            console.error('Streaming error:', error);
            setIsStreaming(false);
            setStreamingContent('');

            // Try fallback to mock AI on streaming error
            handleFallbackToMock(content);
          },
          // onComplete callback
          () => {
            console.log('🌊 Streaming completed');
            setIsStreaming(false);

            // Add the complete AI response to UI
            if (accumulatedContent) {
              onAIResponse(accumulatedContent);
            }
            setStreamingContent('');
          }
        );
      } else {
        // Fallback to mock AI service when backend unavailable
        console.log('🤖 Using mock AI service (backend unavailable)');
        const aiResponse = await mockAI.generateResponse(content);
        onAIResponse(aiResponse.content);
      }
    } catch (error) {
      console.error('Error generating AI response:', error);
      setIsStreaming(false);
      setStreamingContent('');

      // Try fallback to mock AI on backend error
      handleFallbackToMock(content);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFallbackToMock = async (content: string) => {
    try {
      console.log('🤖 Backend failed, trying mock AI service');
      const aiResponse = await mockAI.generateResponse(content);
      onAIResponse(aiResponse.content);
    } catch (mockError) {
      console.error('Mock AI also failed:', mockError);
      onAIResponse('Sorry, I encountered an error while processing your message. Please try again.');
    }
  };

  if (!session) {
    return (
      <div className={styles.chatArea}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}><RiRobot2Line /></div>
          <h2 className={styles.emptyTitle}>Welcome to SampleStrands</h2>
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
        <MessageList
          messages={session.messages}
          isLoading={isLoading}
          isStreaming={isStreaming}
          streamingContent={streamingContent}
        />
        <div ref={messagesEndRef} />
      </div>

      <div className={styles.inputContainer}>
        <MessageInput
          onSendMessage={handleSendMessage}
          disabled={isLoading || isStreaming}
          shortcutToSend={shortcutToSend}
          placeholder={
            isLoading ? "AI is thinking..." :
            isStreaming ? "AI is responding..." :
            "Type your message..."
          }
        />
      </div>
    </div>
  );
}
