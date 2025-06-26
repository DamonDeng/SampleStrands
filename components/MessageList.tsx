import { Message } from '../types/chat';
import MessageBubble from './MessageBubble';
import { RiRobot2Line } from 'react-icons/ri';
import { Markdown } from './Markdown';
import styles from '../styles/MessageList.module.css';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
  isStreaming?: boolean;
  streamingContent?: string;
}

export default function MessageList({ messages, isLoading, isStreaming, streamingContent }: MessageListProps) {
  return (
    <div className={styles.messageList}>
      {messages.map((message, index) => (
        <MessageBubble
          key={message.id}
          message={message}
          isFirst={index === 0 || messages[index - 1].sender !== message.sender}
          isLast={index === messages.length - 1 || messages[index + 1]?.sender !== message.sender}
        />
      ))}

      {/* Show streaming message while AI is responding */}
      {isStreaming && streamingContent && (
        <div className={styles.streamingMessage}>
          <div className={styles.avatar}>
            <span className={styles.avatarIcon}><RiRobot2Line /></span>
          </div>
          <div className={styles.streamingBubble}>
            <div className={styles.streamingContent}>
              <Markdown content={streamingContent} fontSize={14} />
              <span className={styles.cursor}>|</span>
            </div>
          </div>
        </div>
      )}

      {/* Show loading indicator when waiting for AI to start */}
      {isLoading && (
        <div className={styles.loadingMessage}>
          <div className={styles.avatar}>
            <span className={styles.avatarIcon}><RiRobot2Line /></span>
          </div>
          <div className={styles.loadingBubble}>
            <div className={styles.typingIndicator}>
              <span></span>
              <span></span>
              <span></span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
