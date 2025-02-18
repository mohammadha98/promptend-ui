import { Injectable, Signal, signal, WritableSignal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';
import { ChatHistoryItem } from '../models/message-list.model';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = environment.SERVER_URL;
    private fakeUserID = '67a8a06a76652af2c9e45143';
    private chatHistory: WritableSignal<ChatHistoryItem[]> = signal([
        // {
        //     title: 'Main Conversation Flow',
        //     branches: 0,
        //     status: 'active',
        //     lastUpdated: '2h ago',
        //     branchesDetails: [
        //         { name: 'Technical Clarifications', timeAgo: '2h ago', color: 'blue' },
        //         { name: 'Creative Variations', timeAgo: '1h ago', color: 'purple' }
        //     ]
        // },
    ]);
    constructor(private http: HttpClient) { }

    getChatHistory() {
        return this.chatHistory.asReadonly();
    }
    addChatItem(newItem: ChatHistoryItem) {
        this.chatHistory.update((currentHistory) => [...currentHistory, newItem]);
    }
    addConversation(title: string): Observable<any> {
        const data = {
            userId: this.fakeUserID,
            title
        };
        return this.http.post(`${this.apiUrl}/api/conversations`, data);
    }

    sendMessage(message: string, chatId?: string): Observable<any> {
        const payload = { message, chatId };
        return this.http.post(`${this.apiUrl}/send-message`, payload);
    }


    getMessages(chatId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/messages/${chatId}`);
    }


    joinChat(chatId: string, userId: string): Observable<any> {
        const payload = { chatId, userId };
        return this.http.post(`${this.apiUrl}/join-chat`, payload);
    }


    leaveChat(chatId: string, userId: string): Observable<any> {
        const payload = { chatId, userId };
        return this.http.post(`${this.apiUrl}/leave-chat`, payload);
    }


}