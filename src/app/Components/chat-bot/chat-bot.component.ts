import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../../Services/user';

interface ChatMessage {
  id?: number;
  message: string;
  sender: 'User' | 'Bot';
  timestamp?: Date;
}

@Component({
  selector: 'app-chat-bot',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './chat-bot.component.html',
  styleUrls: ['./chat-bot.component.css']
})
export class ChatBotComponent implements OnInit {
  isOpen = false;
  newMessage = '';
  messages: ChatMessage[] = [];
  isLoading = false;
  apiUrl = `${environment.apiUrl}/chat`;

  constructor(private http: HttpClient, private userService: User) {}

  ngOnInit(): void {
    this.loadChatHistory();
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
    if (this.isOpen && this.messages.length === 0) {
      this.loadChatHistory();
    }
  }

  loadChatHistory(): void {
    if (!this.userService.isLoggedIn()) return;

    this.isLoading = true;
    this.http.get<ChatMessage[]>(`${this.apiUrl}/history`, {
      headers: {
        'Authorization': `Bearer ${this.userService.getToken()}`
      }
    }).subscribe({
      next: (data) => {
        this.messages = data;
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.isLoading = false;
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || !this.userService.isLoggedIn()) return;

    const userMessage: ChatMessage = {
      message: this.newMessage,
      sender: 'User'
    };

    this.messages.push(userMessage);
    this.isLoading = true;
    const tempMessage = this.newMessage;
    this.newMessage = '';
    this.scrollToBottom();

    this.http.post<{user: string, bot: string}>(`${this.apiUrl}/send`, JSON.stringify(tempMessage), {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.userService.getToken()}`
      }
    }).subscribe({
      next: (response) => {
        const botMessage: ChatMessage = {
          message: response.bot,
          sender: 'Bot'
        };
        this.messages.push(botMessage);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        this.messages.push({
          message: 'Sorry, I encountered an error. Please try again later.',
          sender: 'Bot'
        });
        this.isLoading = false;
        this.scrollToBottom();
      }
    });
  }

  scrollToBottom(): void {
    setTimeout(() => {
      const chatContainer = document.querySelector('.chat-messages');
      if (chatContainer) {
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    }, 100);
  }

  // Quick action buttons
  sendQuickAction(action: string): void {
    this.newMessage = action;
    this.sendMessage();
  }
}