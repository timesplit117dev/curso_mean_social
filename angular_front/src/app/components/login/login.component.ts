import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { SessionService } from 'src/app/services/session.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  providers: [MessageService],
})
export class LoginComponent {
  public user: User;
  public identity: string;
  public token: string;

  constructor(
    private _router: Router,
    private _userService: UserService,
    private _sessionService: SessionService,
    private _messageService: MessageService
  ) {
    this.identity = '';
    this.token = '';
    this.user = new User('', '', '', '', '', '', 'ROLE_USER', '');
  }

  onSubmit(loginForm: any) {
    this._userService.login(this.user, true).subscribe({
      next: (response) => {
        if (response.token != null) {
          this.token = response.token;
        }

        this.identity = response.user;

        this._sessionService.newDataEvent(this.identity, this.token);

        this.getCounters();
      },
      error: (err) => {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      },
      complete: () => {},
    });
  }

  getCounters() {
    this._userService.getCounters().subscribe({
      next: (response) => {
        this._sessionService.newDataEvent('', '', response);
        this._router.navigate(['/home']);
      },
      error: (err) => {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: err.error.message,
        });
      },
      complete: () => {},
    });
  }
}
