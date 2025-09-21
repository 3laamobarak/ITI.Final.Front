import { Injectable } from '@angular/core';
import { HubConnection, HubConnectionBuilder, HubConnectionState } from '@microsoft/signalr';
import { BehaviorSubject } from 'rxjs';
import { environment } from '../../environments/environment';
import { Auth } from './auth';
import { User } from './user';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private hubConnection!: HubConnection;
  private messagesSubject = new BehaviorSubject<any[]>([]);
  public messages$ = this.messagesSubject.asObservable();

  constructor(private auth: Auth, private user: User) {}

  public async startConnection(): Promise<void> {
    const token = this.user.getToken();
    if (!token) {
      console.error('No token found. Please log in.');
      return;
    }

    console.log('Attempting to connect to SignalR hub at:', environment.apiUrl + '/chathub');
    this.hubConnection = new HubConnectionBuilder()
      .withUrl(`${environment.apiUrl}/chathub`, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.on('ReceiveMessage', (sender: string, message: string, timestamp: string) => {
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, { sender, message, timestamp: new Date(timestamp) }]);
    });

    try {
      await this.hubConnection.start();
      console.log('SignalR connected to', environment.apiUrl + '/chathub');
    } catch (err) {
      console.error('SignalR connection error:', err);
      throw err;
    }
  }

  public async sendMessageToAdmin(message: string): Promise<void> {
    if (!this.hubConnection || this.hubConnection.state !== HubConnectionState.Connected) {
      console.log('SignalR not connected. Attempting to reconnect...');
      try {
        await this.startConnection();
      } catch (err) {
        console.error('Failed to connect to SignalR:', err);
        return;
      }
    }

    let userId: string;
    try {
      userId = await firstValueFrom(this.auth.getHttp().get(`${environment.apiUrl}/profile/me`)).then(
        (profile: any) => profile.id
      );
    } catch (err) {
      console.error('Failed to fetch userId from /profile/me:', err);
      return;
    }

    try {
      await this.hubConnection.invoke('SendMessageToAdmin', userId, message);
      const currentMessages = this.messagesSubject.value;
      this.messagesSubject.next([...currentMessages, { sender: userId, message, timestamp: new Date() }]);
    } catch (err) {
      console.error('Send message error:', err);
    }
  }

  public loadHistoricalMessages(): void {
    this.auth.getHttp().get(`${environment.apiUrl}/api/chat/messages`).subscribe({
      next: (messages: any) => {
        this.messagesSubject.next(messages.map((m: any) => ({ ...m, timestamp: new Date(m.timestamp) })));
      },
      error: (err) => console.error('Load historical messages error:', err)
    });
  }
}
