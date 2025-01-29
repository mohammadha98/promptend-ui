import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = 'https://your-chat-server.com/api';

    constructor(private http: HttpClient) {}

    // Send a message to the chat server
    sendMessage(message: string, chatId?: string): Observable<any> {
        const payload = { message, chatId };
        return this.http.post(`${this.apiUrl}/send-message`, payload);
    }

    // Get messages from the chat server
    getMessages(chatId: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/messages/${chatId}`);
    }

    // Join a chat room
    joinChat(chatId: string, userId: string): Observable<any> {
        const payload = { chatId, userId };
        return this.http.post(`${this.apiUrl}/join-chat`, payload);
    }

    // Leave a chat room
    leaveChat(chatId: string, userId: string): Observable<any> {
        const payload = { chatId, userId };
        return this.http.post(`${this.apiUrl}/leave-chat`, payload);
    }
}