import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User } from '../models/user'
import { GLOBAL } from './global';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  public url:string;
  public stats:any;

  constructor(
    public _http: HttpClient,
    public _sessionService: SessionService
  ){
    this.url = GLOBAL.url;
  }

  register(_user: User): Observable<any>{

    let params = JSON.stringify(_user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(this.url+'register', params, {headers:headers});

  }

  login(_user: User, gettoken = false): Observable<any>{

    var data = _user;
    var token = { gettoken:'true' };

    if (gettoken) {
      //Concatenamos objetos, para luego mandarlo como JSON
      data = Object.assign(_user, token);
    }

    let params = JSON.stringify(data);
    let headers = new HttpHeaders().set('Content-Type', 'application/json');

    return this._http.post(this.url+'login', params, {headers:headers});

  }

  getCounters(userId = ''): Observable<any>{

    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this._sessionService.getToken());

    if (userId != '') {
      return this._http.get(this.url+'userCounter/'+userId, {headers:headers});
    }
    else{
      return this._http.get(this.url+'userCounter', {headers:headers});
    }

  }

  updateCounters(userId = null){

    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this._sessionService.getToken());

    if (userId != null) {
      this._http.get(this.url+'userCounter/'+userId, {headers:headers})
        .subscribe({
          next: (response:any) => {
            this._sessionService.newDataEvent('', '', response);
          },
          error: (err) => {
            console.error(err);
          }
        });
    }
    else{
      this._http.get(this.url+'userCounter', {headers:headers})
        .subscribe({
          next: (response:any) => {
            this._sessionService.newDataEvent('', '', response);
          },
          error: (err) => {
            console.error(err);
          }
        });
    }

  }

  updateUser(user: User): Observable<any>{

    let params = JSON.stringify(user);
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this._sessionService.getToken());

    return this._http.put(this.url+'userUpdate/'+user._id, params, {headers:headers});

  }

  getUsers(page = 1): Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this._sessionService.getToken());

    return this._http.get(this.url+'users/'+page, {headers:headers});
  }

  getUser(id:any): Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', this._sessionService.getToken());

    return this._http.get(this.url+'user/'+id, {headers:headers});
  }

}
