export interface MessageModel {
  id?: string;
  messageType: 'user' | 'ai';
  content: string;
  userTokens: number;
  model: string;
  isEditing?: boolean;
  editedText?: string;
  diffSpans?: DiffSpan[];
  explanations?: ExplainBlock[];
  isCollapsed?: boolean;
}

export interface DiffSpan {
  text: string;
  changed: boolean;
}

export interface ExplainBlock {
  id: string;
  range: {
    startOffset: number;
    endOffset: number;
  };
  promptText: string;
  content?: string;
  isCollapsed: boolean;
  loading: boolean;
}