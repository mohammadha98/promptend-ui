import { Injectable, signal, WritableSignal, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of, throwError } from 'rxjs';
import { catchError, map, tap, switchMap } from 'rxjs/operators';
import { environment } from '../../../../environments/environment.development';
import { ChatHistoryItem } from '../models/message-list.model';
import { MessageModel } from '../models/message.model';

// LangChain imports
import { ChatOpenAI } from '@langchain/openai';
import { HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { BufferMemory, ChatMessageHistory } from 'langchain/memory';
import { BaseChatMessageHistory } from '@langchain/core/chat_history';
import { ConversationChain } from 'langchain/chains';

@Injectable({
    providedIn: 'root'
})
export class AIChatService {
    private apiKey = environment.OPENAI_API_KEY;
    private fakeUserID = '67a8a06a76652af2c9e45143';
    private chatHistory: WritableSignal<ChatHistoryItem[]> = signal([]);
    
    // LangChain model instance
    private chatModel: ChatOpenAI;
    
    // Store conversation chains by conversation ID
    private conversationChains: Map<string, ConversationChain> = new Map();
    
    // Store message histories by conversation ID
    private messageHistories: Map<string, BaseChatMessageHistory> = new Map();
    
    constructor(private http: HttpClient) {
        // Initialize the ChatOpenAI model
        this.chatModel = new ChatOpenAI({
            openAIApiKey: this.apiKey,
            modelName: 'gpt-3.5-turbo', // Default model, can be changed
            temperature: 0.7,
            maxTokens: 1000
        });
        
        // Initialize with an empty chat history
        this.loadChatHistory();
    }
    
    /**
     * Load chat history from local storage or initialize with empty array
     */
    private loadChatHistory(): void {
        const savedHistory = localStorage.getItem('ai_chat_history');
        if (savedHistory) {
            try {
                const parsedHistory = JSON.parse(savedHistory) as ChatHistoryItem[];
                this.chatHistory.set(parsedHistory);
            } catch (error) {
                console.error('Error parsing chat history:', error);
                this.chatHistory.set([]);
            }
        } else {
            this.chatHistory.set([]);
        }
    }
    
    /**
     * Save chat history to local storage
     */
    private saveChatHistory(): void {
        localStorage.setItem('ai_chat_history', JSON.stringify(this.chatHistory()));
    }
    
    /**
     * Get the read-only chat history signal
     */
    getChatHistory(): Signal<ChatHistoryItem[]> {
        return this.chatHistory.asReadonly();
    }
    
    /**
     * Add a new chat item to the history
     */
    addChatItem(newItem: ChatHistoryItem): void {
        this.chatHistory.update((currentHistory) => {
            const updatedHistory = [...currentHistory, newItem];
            return updatedHistory;
        });
        this.saveChatHistory();
    }
    
    /**
     * Create a new conversation
     */
    addConversation(title: string): Observable<any> {
        // Generate a unique ID for the conversation
        const conversationId = this.generateUniqueId();
        
        // Create a new conversation chain with memory
        const messageHistory = new ChatMessageHistory();
        this.messageHistories.set(conversationId, messageHistory);
        
        const memory = new BufferMemory({
            chatHistory: messageHistory,
            returnMessages: true,
            memoryKey: 'history'
        });
        
        const chain = new ConversationChain({
            llm: this.chatModel,
            memory: memory
        });
        
        this.conversationChains.set(conversationId, chain);
        
        // Create a new chat history item
        const newConversation: ChatHistoryItem = {
            id: conversationId,
            title: title,
            branches: 0,
            status: 'active',
            lastUpdated: new Date().toISOString(),
            branchesDetails: []
        };
        
        // Add to chat history
        this.addChatItem(newConversation);
        
        // Return an observable with the new conversation
        return of({
            id: conversationId,
            title: title,
            createdAt: new Date().toISOString(),
            userId: this.fakeUserID
        });
    }
    
    /**
     * Send a message to the AI and get a response
     */
    sendMessage(message: string, chatId?: string): Observable<MessageModel> {
        if (!chatId) {
            return throwError(() => new Error('Chat ID is required'));
        }
        
        // Get the conversation chain for this chat ID
        const chain = this.conversationChains.get(chatId);
        if (!chain) {
            return throwError(() => new Error('Conversation not found'));
        }
        
        // Add the human message to the history
        const messageHistory = this.messageHistories.get(chatId);
        if (messageHistory) {
            messageHistory.addMessage(new HumanMessage(message));
        }
        
        // Process the message with LangChain
        return from(chain.call({ input: message })).pipe(
            map(response => {
                // Add the AI message to the history
                if (messageHistory) {
                    messageHistory.addMessage(new AIMessage(response['response']));
                }
                
                // Update the last updated time for this conversation
                this.updateConversationTimestamp(chatId);
                
                // Return a message model
                return {
                    messageType: 'ai',
                    content: response['response'],
                    userTokens: this.estimateTokens(response['response']),
                    model: 'gpt-3.5-turbo' // This should match the model used
                } as MessageModel;
            }),
            catchError(error => {
                console.error('Error sending message:', error);
                return throwError(() => new Error(`Failed to get AI response: ${error.message}`));
            })
        );
    }
    
    /**
     * Get all messages for a specific chat
     */
    getMessages(chatId: string): Observable<MessageModel[]> {
        const messageHistory = this.messageHistories.get(chatId);
        if (!messageHistory) {
            return of([]);
        }
        
        return from(messageHistory.getMessages()).pipe(
            map(messages => {
                return messages.map(msg => {
                    const content = msg.content;
                    const isHuman = msg._getType() === 'human';
                    
                    return {
                        messageType: isHuman ? 'user' : 'ai',
                        content: content,
                        userTokens: this.estimateTokens(content.toString()),
                        model: 'gpt-3.5-turbo'
                    } as MessageModel;
                });
            })
        );
    }
    
    /**
     * Update the timestamp of a conversation
     */
    private updateConversationTimestamp(chatId: string): void {
        this.chatHistory.update(history => {
            return history.map(item => {
                if (item.id === chatId) {
                    return {
                        ...item,
                        lastUpdated: new Date().toISOString()
                    };
                }
                return item;
            });
        });
        this.saveChatHistory();
    }
    
    /**
     * Generate a unique ID for a conversation
     */
    private generateUniqueId(): string {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    }
    
    /**
     * Estimate the number of tokens in a string
     * This is a very rough estimate - in production you'd want a more accurate method
     */
    private estimateTokens(text: string): number {
        // A very rough estimate: ~4 characters per token
        return Math.ceil(text.length / 4);
    }
    
    /**
     * Change the model for future conversations
     */
    setModel(modelName: string): void {
        this.chatModel = new ChatOpenAI({
            openAIApiKey: this.apiKey,
            modelName: modelName,
            temperature: 0.7,
            maxTokens: 1000
        });
    }
    
    /**
     * Delete a conversation
     */
    deleteConversation(chatId: string): Observable<boolean> {
        // Remove from maps
        this.conversationChains.delete(chatId);
        this.messageHistories.delete(chatId);
        
        // Remove from chat history
        this.chatHistory.update(history => {
            return history.filter(item => item.id !== chatId);
        });
        this.saveChatHistory();
        
        return of(true);
    }
    
    /**
     * Rebuild conversation from a specific message with override prompt
     * @param conversationId The ID of the conversation
     * @param messageId The ID of the message to rebuild from
     * @param overridePrompt The new prompt to replace the original message
     * @returns Observable of the rebuilt conversation messages
     */
    rebuildConversationFrom(
        conversationId: string,
        messageId: string,
        overridePrompt: string
    ): Observable<MessageModel[]> {
        const messageHistory = this.messageHistories.get(conversationId);
        if (!messageHistory) {
            return throwError(() => new Error('Conversation not found'));
        }

        return from(messageHistory.getMessages()).pipe(
            map(messages => {
                // Find the index of the message to rebuild from
                const messageIndex = messages.findIndex((msg, index) => {
                    // Since we don't have message IDs in LangChain messages,
                    // we'll use the index as a simple identifier
                    return index.toString() === messageId;
                });

                if (messageIndex < 0) {
                    throw new Error('Message to rebuild not found');
                }

                // Create new message history up to the rebuild point
                const newHistory = new ChatMessageHistory();
                
                // Add messages before the rebuild point
                for (let i = 0; i < messageIndex; i++) {
                    newHistory.addMessage(messages[i]);
                }

                // Add the override prompt as a human message
                newHistory.addMessage(new HumanMessage(overridePrompt));

                // Replace the message history for this conversation
                this.messageHistories.set(conversationId, newHistory);

                // Create new conversation chain with updated history
                const memory = new BufferMemory({
                    chatHistory: newHistory,
                    returnMessages: true,
                    memoryKey: 'history'
                });

                const chain = new ConversationChain({
                    llm: this.chatModel,
                    memory: memory
                });

                this.conversationChains.set(conversationId, chain);

                // Generate AI response for the override prompt
                return from(chain.call({ input: overridePrompt })).pipe(
                    map(response => {
                        // Add the AI response to history
                        newHistory.addMessage(new AIMessage(response['response']));

                        // Convert all messages to MessageModel array
                        return from(newHistory.getMessages()).pipe(
                            map(allMessages => {
                                return allMessages.map((msg, index) => {
                                    const content = msg.content;
                                    const isHuman = msg._getType() === 'human';
                                    
                                    return {
                                        id: index.toString(),
                                        messageType: isHuman ? 'user' : 'ai',
                                        content: content.toString(),
                                        userTokens: this.estimateTokens(content.toString()),
                                        model: 'gpt-3.5-turbo'
                                    } as MessageModel;
                                });
                            })
                        );
                    }),
                    switchMap(messageObservable => messageObservable),
                    tap(() => {
                        // Update conversation timestamp
                        this.updateConversationTimestamp(conversationId);
                    }),
                    catchError(error => {
                        console.error('Error rebuilding conversation:', error);
                        return throwError(() => new Error(`Failed to rebuild conversation: ${error.message}`));
                    })
                );
            }),
            switchMap(rebuildObservable => rebuildObservable)
        );
    }

    /**
     * Create a new branch from an existing conversation
     */
    createBranch(chatId: string, branchName: string): Observable<any> {
        const originalHistory = this.messageHistories.get(chatId);
        if (!originalHistory) {
            return throwError(() => new Error('Original conversation not found'));
        }
        
        // Generate a new ID for the branch
        const branchId = this.generateUniqueId();
        
        // Clone the message history
        const clonedHistory = new ChatMessageHistory();
        from(originalHistory.getMessages()).pipe(
            tap(messages => {
                messages.forEach(msg => {
                    clonedHistory.addMessage(msg);
                });
            })
        ).subscribe();
        
        this.messageHistories.set(branchId, clonedHistory);
        
        // Create a new conversation chain with the cloned history
        const memory = new BufferMemory({
            chatHistory: clonedHistory,
            returnMessages: true,
            memoryKey: 'history'
        });
        
        const chain = new ConversationChain({
            llm: this.chatModel,
            memory: memory
        });
        
        this.conversationChains.set(branchId, chain);
        
        // Find the original conversation to update its branches
        this.chatHistory.update(history => {
            return history.map(item => {
                if (item.id === chatId) {
                    // Create a random color for the branch
                    const colors = ['blue', 'green', 'purple', 'red', 'orange'];
                    const randomColor = colors[Math.floor(Math.random() * colors.length)];
                    
                    // Add branch details
                    const updatedBranchDetails = [
                        ...item.branchesDetails,
                        {
                            name: branchName,
                            timeAgo: 'just now',
                            color: randomColor
                        }
                    ];
                    
                    return {
                        ...item,
                        branches: item.branches + 1,
                        branchesDetails: updatedBranchDetails
                    };
                }
                return item;
            });
        });
        
        // Create a new chat history item for the branch
        const parentConversation = this.chatHistory().find(item => item.id === chatId);
        const newBranch: ChatHistoryItem = {
            id: branchId,
            title: `${parentConversation?.title || 'Conversation'} - ${branchName}`,
            branches: 0,
            status: 'active',
            lastUpdated: new Date().toISOString(),
            branchesDetails: []
        };
        
        this.addChatItem(newBranch);
        this.saveChatHistory();
        
        return of({
            id: branchId,
            title: newBranch.title,
            createdAt: new Date().toISOString(),
            userId: this.fakeUserID,
            parentId: chatId
        });
    }

    /**
     * Generate an explanation for a selected text in a message
     * @param msgId The ID of the message containing the text
     * @param promptText The selected text to explain
     * @returns Observable of the explanation text
     */
    explainText(msgId: string, promptText: string): Observable<string> {
        // Create a prompt for the LLM to explain the selected text
        const explainPrompt = `Please provide a more detailed explanation of the following text:\n\n"${promptText}"\n\nExplain in a clear and concise way, providing additional context or examples if helpful.`;
        
        // Use the chat model directly for a one-off explanation
        return from(this.chatModel.invoke([new HumanMessage(explainPrompt)])).pipe(
            map(response => {
                // Extract the content from the AI message
                return response.content.toString();
            }),
            catchError(error => {
                console.error('Error generating explanation:', error);
                return throwError(() => new Error(`Failed to generate explanation: ${error.message}`));
            })
        );
    }
}