import { Message } from '../types/chat';
import styles from '../styles/MessageBubble.module.css';

interface MessageBubbleProps {
  message: Message;
  isFirst: boolean;
  isLast: boolean;
}

export default function MessageBubble({ message, isFirst, isLast }: MessageBubbleProps) {
  const isUser = message.sender === 'user';
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatContent = (content: string) => {
    // Simple formatting for line breaks
    return content.split('\n').map((line, index) => (
      <span key={index}>
        {line}
        {index < content.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  return (
    <div className={`${styles.messageContainer} ${isUser ? styles.user : styles.assistant}`}>
      <div className={styles.messageWrapper}>
        {!isUser && isFirst && (
          <div className={styles.avatar}>
            <span className={styles.avatarIcon}>🤖</span>
          </div>
        )}
        
        {!isUser && !isFirst && (
          <div className={styles.avatarSpacer} />
        )}
        
        <div className={styles.messageContent}>
          {isFirst && !isUser && (
            <div className={styles.senderName}>AI Assistant</div>
          )}
          
          <div className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
            <div className={styles.messageText}>
              {formatContent(message.content)}
            </div>
          </div>
          
          {isLast && (
            <div className={styles.messageTime}>
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>
        
        {isUser && (
          <div className={styles.userAvatar}>
            <span className={styles.avatarIcon}>👤</span>
          </div>
        )}
      </div>
    </div>
  );
}
