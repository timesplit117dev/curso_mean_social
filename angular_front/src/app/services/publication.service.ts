import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Subject, Observable } from 'rxjs';
import { Publication } from '../models/publication'
import { GLOBAL } from './global';

@Injectable({
  providedIn: 'root'
})
export class PublicationService {

  private newPub = new Subject();
  public readonly newPubSource$ = this.newPub.asObservable();

  public url:string;

  constructor(public _http: HttpClient) {
    this.url = GLOBAL.url;
  }

  newPubEvent(value: boolean){
    this.newPub.next(value);
  }

  addPublication(token:string, publication:Publication): Observable<any>{
    let params = JSON.stringify(publication);
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    return this._http.post(this.url + 'publication', params, {headers: headers});
  }

  getPublications(token:string, page:number = 1): Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    return this._http.get(this.url + 'publications/' + page, {headers: headers});
  }

  deletePublication(token:string, id:string): Observable<any>{
    let headers = new HttpHeaders().set('Content-Type', 'application/json')
                                   .set('Authorization', token);

    return this._http.delete(this.url + 'deletePublication/' + id, {headers: headers});
  }

}
