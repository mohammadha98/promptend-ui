export interface MessageModel {
    messageType: 'user' | 'ai';
    content: string;
    userTokens: number;
    model: string; 
  }