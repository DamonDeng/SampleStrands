import { useState, useRef, useEffect } from 'react';
import { RiSendPlaneFill } from 'react-icons/ri';
import DocumentUpload from './DocumentUpload';
import styles from '../styles/MessageInput.module.css';

interface MessageInputProps {
  onSendMessage: (content: string, files?: File[]) => void;
  disabled?: boolean;
  placeholder?: string;
  shortcutToSend?: 'enter' | 'shift_enter';
  maxFiles?: number;
  maxFileSizeMB?: number;
  supportedTypes?: string[];
}

export default function MessageInput({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  shortcutToSend = 'shift_enter',
  maxFiles = 5,
  maxFileSizeMB = 20,
  supportedTypes = ['pdf', 'docx', 'doc', 'txt', 'csv', 'xlsx', 'xls', 'html', 'md', 'png', 'jpg', 'jpeg', 'gif', 'webp']
}: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
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
    if ((message.trim() || selectedFiles.length > 0) && !disabled) {
      onSendMessage(message.trim() || "Please analyze the attached files.", selectedFiles);
      setMessage('');
      setSelectedFiles([]);
      resetTextareaHeight();
    }
  };

  const handleFilesSelected = (newFiles: File[]) => {
    setSelectedFiles(prev => [...prev, ...newFiles]);
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
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
      {/* File attachments display */}
      {selectedFiles.length > 0 && (
        <div className={styles.attachmentsContainer}>
          <DocumentUpload
            onFilesSelected={() => {}} // Not used in display mode
            selectedFiles={selectedFiles}
            onRemoveFile={handleRemoveFile}
            disabled={disabled}
            maxFiles={maxFiles}
            maxFileSizeMB={maxFileSizeMB}
            supportedTypes={supportedTypes}
          />
        </div>
      )}

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
          <DocumentUpload
            onFilesSelected={handleFilesSelected}
            selectedFiles={[]} // Only show attach button, not files
            onRemoveFile={() => {}} // Not used in button mode
            disabled={disabled}
            maxFiles={maxFiles}
            maxFileSizeMB={maxFileSizeMB}
            supportedTypes={supportedTypes}
          />

          <button
            type="submit"
            className={`${styles.sendButton} ${(message.trim() || selectedFiles.length > 0) && !disabled ? styles.active : ''}`}
            disabled={!(message.trim() || selectedFiles.length > 0) || disabled}
            title={`Send message (${shortcutToSend === 'enter' ? 'Enter' : 'Shift+Enter'})`}
          >
            {disabled ? (
              <div className={styles.spinner} />
            ) : (
              <RiSendPlaneFill />
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
