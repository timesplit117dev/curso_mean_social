import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SessionService{

  public identity:any;
  public token:any;
  public stats:any;

  private newData = new BehaviorSubject<boolean>(true);
  public readonly newData$ = this.newData.asObservable();

  newDataEvent(identity:string = '', token:string = '', stats:string = ''){

    if (identity != '' && identity != null){
      this.identity = identity;
      localStorage.setItem('identity', JSON.stringify(this.identity));
    }
    if (token != '' && token != null){
      this.token = token;
      localStorage.setItem('token', this.token);
    }
    if (stats != '' && stats != null){
      this.stats = stats;
      localStorage.setItem('stats', JSON.stringify(this.stats));
    }
    this.newData.next(true);

  }

  getIdentity(){

    let identity = JSON.parse(localStorage.getItem('identity') || 'null');
    if (identity != 'undefined' && identity != null) {
      this.identity = identity;
    }
    else{
      this.identity = null;
    }
    return this.identity;

  }

  getToken(){

    let token = localStorage.getItem('token');
    if (token != 'undefined' && token != null) {
      this.token = token;
    }
    else{
      this.token = null;
    }
    return this.token;

  }

  getStats(){

    let stats = JSON.parse(localStorage.getItem('stats') || 'null');
    if (stats != 'undefined' && stats != null) {
      this.stats = stats;
    }
    else{
      this.stats = null;
    }
    return this.stats;

  }

}
