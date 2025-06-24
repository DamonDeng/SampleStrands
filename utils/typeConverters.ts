/**
 * Type converters between frontend and backend data models
 */

import { Session as FrontendSession, Message as FrontendMessage } from '../types/chat';
import { Session as BackendSession, Message as BackendMessage } from './pythonAPI';

/**
 * Convert backend message to frontend message format
 */
export function convertBackendMessage(backendMessage: BackendMessage): FrontendMessage {
  return {
    id: backendMessage.id,
    content: backendMessage.content,
    sender: backendMessage.role === 'user' ? 'user' : 'assistant',
    timestamp: new Date(backendMessage.timestamp),
    isLoading: backendMessage.status === 'pending'
  };
}

/**
 * Convert frontend message to backend message format
 */
export function convertFrontendMessage(frontendMessage: FrontendMessage): BackendMessage {
  return {
    id: frontendMessage.id,
    content: frontendMessage.content,
    role: frontendMessage.sender === 'user' ? 'user' : 'assistant',
    timestamp: frontendMessage.timestamp.toISOString(),
    status: frontendMessage.isLoading ? 'pending' : 'completed'
  };
}

/**
 * Convert backend session to frontend session format
 */
export function convertBackendSession(backendSession: BackendSession): FrontendSession {
  return {
    id: backendSession.id,
    title: backendSession.title,
    agentId: backendSession.agent_id,
    messages: backendSession.messages.map(convertBackendMessage),
    createdAt: new Date(backendSession.created_at),
    updatedAt: new Date(backendSession.updated_at)
  };
}

/**
 * Convert frontend session to backend session format
 */
export function convertFrontendSession(frontendSession: FrontendSession): BackendSession {
  return {
    id: frontendSession.id,
    title: frontendSession.title,
    agent_id: frontendSession.agentId,
    messages: frontendSession.messages.map(convertFrontendMessage),
    created_at: frontendSession.createdAt.toISOString(),
    updated_at: frontendSession.updatedAt.toISOString()
  };
}
