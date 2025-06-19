import { Message } from '../types/chat';
import MessageBubble from './MessageBubble';
import styles from '../styles/MessageList.module.css';

interface MessageListProps {
  messages: Message[];
  isLoading: boolean;
}

export default function MessageList({ messages, isLoading }: MessageListProps) {
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
      
      {isLoading && (
        <div className={styles.loadingMessage}>
          <div className={styles.avatar}>
            <span className={styles.avatarIcon}>🤖</span>
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
