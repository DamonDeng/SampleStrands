import { useState, useRef, useEffect } from 'react';
import styles from '../styles/MessageInput.module.css';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  shortcutToSend?: 'enter' | 'shift_enter';
}

export default function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  shortcutToSend = 'shift_enter'
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate dynamic placeholder with shortcut hint
  const getPlaceholder = () => {
    if (disabled || message.trim()) return placeholder;

    const shortcutHint = shortcutToSend === 'enter'
      ? 'Enter to send, Shift+Enter for new line'
      : 'Shift+Enter to send, Enter for new line';

    return `${placeholder} (${shortcutHint})`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message.trim());
      setMessage('');
      resetTextareaHeight();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (shortcutToSend === 'enter' && !e.shiftKey) {
        // Enter to send, Shift+Enter for new line
        e.preventDefault();
        handleSubmit(e);
      } else if (shortcutToSend === 'shift_enter' && e.shiftKey) {
        // Shift+Enter to send, Enter for new line
        e.preventDefault();
        handleSubmit(e);
      }
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
          placeholder={getPlaceholder()}
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
            title={`Send message (${shortcutToSend === 'enter' ? 'Enter' : 'Shift+Enter'})`}
          >
            {disabled ? (
              <div className={styles.spinner} />
            ) : (
              '➤'
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
