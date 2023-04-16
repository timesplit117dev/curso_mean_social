import { Component } from '@angular/core';
import { GLOBAL } from 'src/app/services/global';
import { User } from '../../models/user';
import { SessionService } from 'src/app/services/session.service';
import { UserService } from '../../services/user.service';
import { UploadService } from 'src/app/services/upload.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-edit',
  templateUrl: './user-edit.component.html',
  styleUrls: ['./user-edit.component.css'],
  providers: [MessageService],
})
export class UserEditComponent{
  public user: User;
  public identity: any;
  public token: any;
  public files: Array<File>;
  public filesToUpload: Array<File>;
  public url: string;

  constructor(
    private _userService: UserService,
    private _uploadService: UploadService,
    private _sessionService: SessionService,
    private _messageService: MessageService
  ) {
    this.user = this._sessionService.getIdentity();
    this.identity = this.user;
    this.token = this._sessionService.getToken();
    this.files = [];
    this.filesToUpload = [];
    this.url = GLOBAL.url;
  }

  onSubmit() {
    this._userService.updateUser(this.user).subscribe({
      next: (response) => {

        this.identity = this.user;
        this._sessionService.newDataEvent(this.identity);

        if (this.filesToUpload.length > 0) {
          this._uploadService
            .uploadFile(this.user._id, this.filesToUpload)
            .subscribe({
              next: (responseUpload: any) => {

                this.user.image = responseUpload.user.image;
                this.identity = this.user;
                this._sessionService.newDataEvent(this.identity);
                this.filesToUpload = [];
                this._messageService.add({
                  severity: 'success',
                  summary: 'Datos actualizados correctamente',
                });

              },
              error: (err) => {

                this._messageService.add({
                  severity: 'error',
                  summary: 'Error',
                  detail: err.error.message,
                });

              },
            });
        } else {

          console.log('ok update user');
          this._messageService.add({
            severity: 'success',
            summary: 'Datos actualizados correctamente',
          });

        }
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

  fileChangeEvent(fileInput: any) {
    this.files = [];
    this.filesToUpload[0] = fileInput.files[0];
  }
}
