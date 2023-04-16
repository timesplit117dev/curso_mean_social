import { Component, OnInit, OnDestroy } from '@angular/core';
import { Message } from 'src/app/models/message';
import { SessionService } from 'src/app/services/session.service';
import { MessageServices } from '../../services/message.service';
import { MessageService } from 'primeng/api';
import { io } from 'socket.io-client';
const socket = io('http://localhost:3800', { autoConnect: false });

@Component({
  selector: 'app-message',
  templateUrl: './message.component.html',
  styleUrls: ['./message.component.css'],
  providers: [MessageService],
})
export class MessageComponent implements OnInit, OnDestroy {
  public identity: any;
  public token: any;
  public messages: any;
  public message: Message;

  constructor(
    private _messagesService: MessageServices,
    private _messageService: MessageService,
    private _sessionService: SessionService
  ) {
    this.identity = this._sessionService.getIdentity();
    this.token = this._sessionService.getToken();
    this.message = new Message('', '', '', '', this.identity._id, '');
  }

  ngOnInit() {
    this.getMessages();

    //Conectamos al servidor WS y escuchamos los eventos.
    socket.connect();
    socket.on('connect', () => {});
    socket.emit('session_start', this.identity._id);
    socket.on('newMessageOK', (data) => {
      this.messages.push(data);
    });
    socket.on('newMessageKO', (data) => {
      this._messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: data,
      });
    });
  }

  ngOnDestroy() {
    //Desconectamos y eliminamos los eventos.
    socket.disconnect();
    socket.off('connect');
    socket.off('newMessageOK');
    socket.off('newMessageKO');
  }

  getMessages() {
    this._messagesService.getMessages(this.token).subscribe({
      next: (response) => {
        this.messages = response.messages;
      },
      error: (err) => {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      },
    });
  }

  sendMessage() {
    socket.emit('newMessage', this.token, this.message);
  }
}
