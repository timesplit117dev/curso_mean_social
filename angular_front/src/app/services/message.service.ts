import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Message } from '../models/message';
import { GLOBAL } from './global';

@Injectable({
  providedIn: 'root',
})
export class MessageServices {
  public url: string;

  constructor(public _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  sendMessage(token: string, message: Message): Observable<any> {
    let params = JSON.stringify(message);
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', token);

    return this._http.post(this.url + 'message', params, { headers: headers });
  }

  getMessages(token: string): Observable<any> {
    let headers = new HttpHeaders()
      .set('Content-Type', 'application/json')
      .set('Authorization', token);

    return this._http.get(this.url + 'messages', { headers: headers });
  }
}
