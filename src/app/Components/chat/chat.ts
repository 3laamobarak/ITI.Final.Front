import { Component, OnInit } from '@angular/core';
import { ChatService } from '../../Services/chat-service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Chat implements OnInit {
  messages: { sender: string; message: string; timestamp: Date }[] = [];
  newMessage: string = '';

  constructor(private chatService: ChatService) {}

  ngOnInit(): void {
    this.chatService.startConnection();
    this.chatService.messages$.subscribe(msgs => (this.messages = msgs));
    this.chatService.loadHistoricalMessages();
  }

  async sendMessage(): Promise<void> {
    if (this.newMessage.trim()) {
      try {
        await this.chatService.sendMessageToAdmin(this.newMessage);
        this.newMessage = '';
      } catch (err) {
        console.error('Failed to send message:', err);
      }
    }
  }
}
