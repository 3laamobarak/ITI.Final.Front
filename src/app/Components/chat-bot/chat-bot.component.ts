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
  apiUrl = `${environment.apiUrl}/chatbot`;

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
    this.http.get<any[]>(`${this.apiUrl}/history`, {
      headers: {
        'Authorization': `Bearer ${this.userService.getToken()}`
      }
    }).subscribe({
      next: (data) => {
        // Convert backend format to frontend format
        this.messages = data.map(msg => ({
          id: msg.id,
          message: msg.message,
          sender: msg.sender as 'User' | 'Bot',
          timestamp: msg.timestamp ? new Date(msg.timestamp) : new Date()
        }));
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error loading chat history:', error);
        this.isLoading = false;
        // Show a user-friendly message
        this.messages = [{
          message: 'Welcome! How can I help you today?',
          sender: 'Bot'
        }];
      }
    });
  }

  sendMessage(): void {
    if (!this.newMessage.trim()) {
      return;
    }

    if (!this.userService.isLoggedIn()) {
      this.messages.push({
        message: 'Please log in to use the chatbot.',
        sender: 'Bot'
      });
      this.scrollToBottom();
      return;
    }

    const userMessage: ChatMessage = {
      message: this.newMessage,
      sender: 'User',
      timestamp: new Date()
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
          sender: 'Bot',
          timestamp: new Date()
        };
        this.messages.push(botMessage);
        this.isLoading = false;
        this.scrollToBottom();
      },
      error: (error) => {
        console.error('Error sending message:', error);
        console.error('Error details:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          error: error.error
        });
        
        let errorMessage = 'Sorry, I encountered an error. Please try again later.';
        
        if (error.status === 400) {
          errorMessage = 'Invalid request. Please try again.';
        } else if (error.status === 401) {
          errorMessage = 'Please log in to continue the conversation.';
        } else if (error.status === 500) {
          errorMessage = 'Server error. Please try again in a moment.';
        } else if (error.status === 0) {
          errorMessage = 'Unable to connect to the server. Please check your internet connection.';
        }
        
        this.messages.push({
          message: errorMessage,
          sender: 'Bot',
          timestamp: new Date()
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