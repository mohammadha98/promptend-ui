/**
 * Interface for chat session with branching support
 */
export interface ChatSession {
  id: string;
  title: string;
  createdAt: string;
  branches: Branch[];
}

/**
 * Interface for individual branch within a chat session
 */
export interface Branch {
  branchId: string;
  name: string;
  createdAt: string;
  isActive: boolean;
  messages: BranchMessage[];
  parentBranchId?: string; // For tracking branch hierarchy
}

/**
 * Interface for messages within a branch
 */
export interface BranchMessage {
  id: string;
  messageType: 'user' | 'ai';
  content: string;
  timestamp: string;
  userTokens: number;
  model: string;
  order: number;
}

/**
 * Interface for branch creation options
 */
export interface CreateBranchOptions {
  sessionId: string;
  sourceBranchId: string;
  branchName?: string;
}

/**
 * Interface for branch switching options
 */
export interface SwitchBranchOptions {
  sessionId: string;
  targetBranchId: string;
}

/**
 * Interface for creating new messages (without auto-generated fields)
 */
export interface CreateMessageInput {
  messageType: 'user' | 'ai';
  content: string;
  userTokens: number;
  model: string;
}

/**
 * Interface for error handling in branching operations
 */
export interface BranchingError {
  type: 'storage' | 'validation' | 'not_found';
  message: string;
  retryable: boolean;
}