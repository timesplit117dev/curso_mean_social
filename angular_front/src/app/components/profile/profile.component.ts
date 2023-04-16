import { Component, OnInit } from '@angular/core';
import { GLOBAL } from 'src/app/services/global';
import { UserService } from 'src/app/services/user.service';
import { SessionService } from 'src/app/services/session.service';
import { MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  providers: [MessageService],
})
export class ProfileComponent implements OnInit {
  public identity;
  public token;
  public url;
  public user;
  public user_stats;

  constructor(
    private _userService: UserService,
    private _sessionService: SessionService,
    private _messageService: MessageService,
    private _router: Router,
    private _route: ActivatedRoute
  ) {
    this.identity = this._sessionService.getIdentity();
    this.token = this._sessionService.getToken();
    this.url = GLOBAL.url;
    this.user = '';
    this.user_stats = '';
  }

  ngOnInit() {
    this._route.params.subscribe((params) => {
      let id = params['id'];
      this.getUser(id);
      this.getStats(id);
    });
  }

  getUser(id: string) {
    this._userService.getUser(id).subscribe({
      next: (response) => {
        if (response.user) {
          this.user = response.user;
        } else {
          this._messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se ha podido cargar el usuario',
          });
        }
      },
      error: (err) => {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
        this._router.navigate(['/perfil', this.identity._id]);
      },
    });
  }

  getStats(id: string) {
    this._userService.getCounters(id).subscribe({
      next: (response) => {
        this.user_stats = response;
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
}
