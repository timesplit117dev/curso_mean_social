import { Injectable } from '@angular/core';
import { SessionService } from './session.service';

@Injectable({
  providedIn: 'root'
})
export class UserGuardService {

  public identity;

  constructor(
    public _sessionService: SessionService
  ) {
    this.identity = this._sessionService.getIdentity();
  }

  canActivate(){
    if(this.identity && this.identity.role != ''){
      return true;
    }else{
      return false;
    }
  }

}
