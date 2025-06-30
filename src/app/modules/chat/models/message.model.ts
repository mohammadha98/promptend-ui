export interface MessageModel {
    id?: string;
    messageType: 'user' | 'ai';
    content: string;
    userTokens: number;
    model: string; 
  }