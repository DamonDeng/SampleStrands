import { useState, useRef, useCallback } from 'react';
import { DocumentAttachment } from '../utils/pythonAPI';
import { RiAttachment2, RiCloseLine, RiFileTextLine, RiImageLine } from 'react-icons/ri';
import styles from '../styles/DocumentUpload.module.css';

interface DocumentUploadProps {
  onFilesSelected: (files: File[]) => void;
  selectedFiles: File[];
  onRemoveFile: (index: number) => void;
  disabled?: boolean;
  maxFiles?: number;
  maxFileSizeMB?: number;
  supportedTypes?: string[];
}

export default function DocumentUpload({
  onFilesSelected,
  selectedFiles,
  onRemoveFile,
  disabled = false,
  maxFiles = 5,
  maxFileSizeMB = 20,
  supportedTypes = ['pdf', 'docx', 'txt', 'png', 'jpg', 'jpeg']
}: DocumentUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Check file size
    const fileSizeMB = file.size / (1024 * 1024);
    if (fileSizeMB > maxFileSizeMB) {
      return `File "${file.name}" is too large. Maximum size is ${maxFileSizeMB}MB.`;
    }

    // Check file type
    const extension = file.name.split('.').pop()?.toLowerCase();
    if (!extension || !supportedTypes.includes(extension)) {
      return `File type "${extension}" is not supported. Supported types: ${supportedTypes.join(', ')}.`;
    }

    return null;
  }, [maxFileSizeMB, supportedTypes]);

  const handleFileSelection = useCallback((files: FileList) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Check total file count
    if (selectedFiles.length + fileArray.length > maxFiles) {
      errors.push(`Maximum ${maxFiles} files allowed. Currently have ${selectedFiles.length} files.`);
      return;
    }

    // Validate each file
    for (const file of fileArray) {
      const error = validateFile(file);
      if (error) {
        errors.push(error);
      } else {
        validFiles.push(file);
      }
    }

    // Show errors if any
    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    // Add valid files
    if (validFiles.length > 0) {
      onFilesSelected(validFiles);
    }
  }, [selectedFiles.length, maxFiles, validateFile, onFilesSelected]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragOver(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (disabled) return;

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelection(files);
    }
  }, [disabled, handleFileSelection]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelection(files);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  }, [handleFileSelection]);

  const handleAttachClick = useCallback(() => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, [disabled]);

  const getFileIcon = (fileName: string) => {
    const extension = fileName.split('.').pop()?.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'gif', 'webp'].includes(extension || '')) {
      return <RiImageLine />;
    }
    return <RiFileTextLine />;
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className={styles.documentUpload}>
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={supportedTypes.map(type => `.${type}`).join(',')}
        onChange={handleFileInputChange}
        style={{ display: 'none' }}
      />

      {/* Attach button */}
      <button
        type="button"
        className={`${styles.attachButton} ${disabled ? styles.disabled : ''}`}
        onClick={handleAttachClick}
        disabled={disabled}
        title="Attach files"
      >
        <RiAttachment2 />
      </button>

      {/* Selected files display */}
      {selectedFiles.length > 0 && (
        <div className={styles.selectedFiles}>
          {selectedFiles.map((file, index) => (
            <div key={`${file.name}-${index}`} className={styles.fileItem}>
              <div className={styles.fileIcon}>
                {getFileIcon(file.name)}
              </div>
              <div className={styles.fileInfo}>
                <span className={styles.fileName}>{file.name}</span>
                <span className={styles.fileSize}>{formatFileSize(file.size)}</span>
              </div>
              <button
                type="button"
                className={styles.removeButton}
                onClick={() => onRemoveFile(index)}
                title="Remove file"
              >
                <RiCloseLine />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drag and drop overlay */}
      {isDragOver && (
        <div
          className={styles.dragOverlay}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className={styles.dragContent}>
            <RiAttachment2 size={48} />
            <p>Drop files here to attach</p>
          </div>
        </div>
      )}
    </div>
  );
}
