import { Message } from '../types/chat';
import { IoPersonOutline } from 'react-icons/io5';
import { RiRobot2Line } from 'react-icons/ri';
import { Markdown } from './Markdown';
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

  // Remove the old formatContent function as we'll use Markdown component

  return (
    <div className={`${styles.messageContainer} ${isUser ? styles.user : styles.assistant}`}>
      <div className={`${styles.messageWrapper} ${isUser ? styles.userMessageWrapper : ''}`}>
        {!isUser && isFirst && (
          <div className={styles.avatar}>
            <span className={styles.avatarIcon}><RiRobot2Line /></span>
          </div>
        )}
        
        {!isUser && !isFirst && (
          <div className={styles.avatarSpacer} />
        )}
        
        <div className={`${styles.messageContent} ${isUser ? styles.userMessageContent : ''}`}>
          {isFirst && !isUser && (
            <div className={styles.senderName}>AI Assistant</div>
          )}
          
          <div className={`${styles.messageBubble} ${isUser ? styles.userBubble : styles.assistantBubble}`}>
            <div className={styles.messageText}>
              <Markdown content={message.content} fontSize={14} />
            </div>
          </div>
          
          {isLast && (
            <div className={`${styles.messageTime} ${isUser ? styles.userMessageTime : ''}`}>
              {formatTime(message.timestamp)}
            </div>
          )}
        </div>
        
        {isUser && (
          <div className={styles.userAvatar}>
            <span className={styles.avatarIcon}><IoPersonOutline /></span>
          </div>
        )}
      </div>
    </div>
  );
}
