import { useState, useRef, useEffect } from 'react';
import styles from '../styles/MessageInput.module.css';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export default function MessageInput({ 
  onSendMessage, 
  disabled = false, 
  placeholder = "Type your message..." 
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      resetTextareaHeight();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const resetTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const adjustTextareaHeight = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      const maxHeight = 120; // Maximum height in pixels
      textareaRef.current.style.height = `${Math.min(scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  return (
    <form onSubmit={handleSubmit} className={styles.messageForm}>
      <div className={styles.inputContainer}>
        <textarea
          ref={textareaRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          className={`${styles.messageInput} ${disabled ? styles.disabled : ''}`}
          rows={1}
        />
        
        <div className={styles.inputActions}>
          <button
            type="button"
            className={styles.actionButton}
            title="Attach file"
            disabled={disabled}
          >
            📎
          </button>
          
          <button
            type="submit"
            className={`${styles.sendButton} ${message.trim() && !disabled ? styles.active : ''}`}
            disabled={!message.trim() || disabled}
            title="Send message (Enter)"
          >
            {disabled ? (
              <div className={styles.spinner} />
            ) : (
              '➤'
            )}
          </button>
        </div>
      </div>
      
      <div className={styles.inputHint}>
        <span className={styles.hintText}>
          Press <kbd>Enter</kbd> to send, <kbd>Shift + Enter</kbd> for new line
        </span>
      </div>
    </form>
  );
}
