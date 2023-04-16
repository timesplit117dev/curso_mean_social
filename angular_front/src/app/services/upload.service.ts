import { Injectable } from '@angular/core';
import { GLOBAL } from './global';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class UploadService{

  public url:string;
  public token:any;

  constructor(
    public _http: HttpClient,
    public _sessionService: SessionService
  ){
    this.url = GLOBAL.url;
  }

  uploadFile(userId: string, files: Array<File>){

    let headers = new HttpHeaders().set('Authorization', this._sessionService.getToken());

    var formData:any = new FormData();
    //Añadimos ficheros al formData, el nombre del parametro es image
    for(var i = 0; i < files.length; i++){
      formData.append('image', files[i]);
    }

    return this._http.post(this.url+'userUpload_image/'+userId, formData, {headers:headers});

  }

}
