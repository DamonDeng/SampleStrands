export interface DocumentAttachment {
  id: string;
  original_filename: string;
  file_size: number;
  file_format: string;
  mime_type: string;
  document_type: 'document' | 'image';
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
  isLoading?: boolean;
  attachments?: DocumentAttachment[];
}

export interface Session {
  id: string;
  title: string;
  agentId?: string;
  messages: Message[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ChatState {
  sessions: Session[];
  activeSessionId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface SidebarItem {
  id: string;
  label: string;
  icon: string;
  active?: boolean;
  onClick?: () => void;
}
