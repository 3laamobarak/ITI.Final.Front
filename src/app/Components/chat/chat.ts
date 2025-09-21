import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { HubConnection, HubConnectionBuilder } from "@microsoft/signalr";
import { sendMessage } from "@microsoft/signalr/dist/esm/Utils";
import { async } from "rxjs";

@Component({
  selector: 'app-chat',
  templateUrl: './chat.html',
  styleUrls: ['./chat.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class Chat {
  // messages: { sender: string; message: string; timestamp: Date }[] = [];
  // newMessage: string = '';

  // constructor(private chatService: ChatService) {}

  // ngOnInit(): void {
  //   this.chatService.startConnection();
  //   this.chatService.messages$.subscribe(msgs => (this.messages = msgs));
  //   this.chatService.loadHistoricalMessages();
  // }

  // async sendMessage(): Promise<void> {
  //   if (this.newMessage.trim()) {
  //     try {
  //       await this.chatService.sendMessageToAdmin(this.newMessage);
  //       this.newMessage = '';
  //     } catch (err) {
  //       console.error('Failed to send message:', err);
  //     }
  //   }
  // }
  title ='chatappClient';
  private connection : HubConnection;
  public messages: string[] = [];
  public user!: string;
  public message!: string;
  constructor() 
  {
    this.connection = new HubConnectionBuilder()
    .withUrl('http://localhost:5297/chat')
    .build();
  }
  async ngOnInit(){
    this.connection.on('ReceiveMessage',(user:string,message:string)=>{
      const text = `${user} : ${message}`;
      this.messages.push(text);
    });

    try{
      await this.connection.start();
      console.log('Connection started');
    }catch(err){
      console.log('Error while starting connection : '+err);
    }
  }

  async sendMessage(){
    if(!this.user || !this.message) return;
    await this.connection.invoke('SendMessage', this.user, this.message);
    this.message = '';
  }


}
