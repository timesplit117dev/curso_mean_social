import { Component } from '@angular/core';
import { User } from '../../models/user';
import { UserService } from '../../services/user.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  providers: [MessageService],
})
export class RegisterComponent {

  public user: User;
  public status: string;

  constructor(
    private _userService: UserService,
    private _messageService: MessageService
  ) {
    this.status = '';
    this.user = new User('', '', '', '', '', '', 'ROLE_USER', '');
  }

  onSubmit(registerForm: any) {
    this._userService.register(this.user).subscribe({
      next: (response) => {
        if (response.user && response.user._id) {
          this.status = 'success';
          this._messageService.add({
            key: 'confirm',
            severity: 'success',
            summary: 'El usuario se ha registrado correctamente',
            sticky: true,
          });
          registerForm.reset();
        }
      },
      error: (err) => {
        this.status = 'error';
        this._messageService.add({
          key: 'confirm',
          severity: 'error',
          summary: 'No se ha podido registrar el usuario',
          detail: err.error.message,
        });
      }
    });
  }
}
