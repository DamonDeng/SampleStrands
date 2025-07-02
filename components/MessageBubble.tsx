import { Message } from '../types/chat';
import { IoPersonOutline } from 'react-icons/io5';
import { RiRobot2Line, RiFileTextLine, RiImageLine, RiAttachment2 } from 'react-icons/ri';
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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const getFileIcon = (attachment: any) => {
    if (attachment.document_type === 'image') {
      return <RiImageLine />;
    }
    return <RiFileTextLine />;
  };

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
            {/* Display attachments if any */}
            {message.attachments && message.attachments.length > 0 && (
              <div className={styles.attachments}>
                {message.attachments.map((attachment, index) => (
                  <div key={attachment.id || index} className={styles.attachment}>
                    <div className={styles.attachmentIcon}>
                      {getFileIcon(attachment)}
                    </div>
                    <div className={styles.attachmentInfo}>
                      <span className={styles.attachmentName}>
                        {attachment.original_filename}
                      </span>
                      <span className={styles.attachmentSize}>
                        {formatFileSize(attachment.file_size)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
