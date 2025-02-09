import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = environment.SERVER_URL;
    private fakeUserID = '67a8a06a76652af2c9e45143';
    constructor(private http: HttpClient) { }



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