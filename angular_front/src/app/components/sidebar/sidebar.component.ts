import { Component, OnInit, OnDestroy } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { GLOBAL } from 'src/app/services/global';
import { Publication } from 'src/app/models/publication';
import { PublicationService } from 'src/app/services/publication.service';
import { SessionService } from 'src/app/services/session.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css'],
  providers: [MessageService],
})
export class SidebarComponent implements OnInit, OnDestroy {
  private sessionSubscription: Subscription | undefined;

  public identity;
  public token;
  public stats;
  public url;
  public publication: Publication;
  public files: Array<File>;
  public filesToUpload: Array<File>;

  constructor(
    private _userService: UserService,
    private _publicationService: PublicationService,
    private _sessionService: SessionService,
    private _messageService: MessageService
  ) {
    this.identity = this._sessionService.getIdentity();
    this.token = this._sessionService.getToken();
    this.stats = this._sessionService.getStats();
    this.url = GLOBAL.url;
    this.publication = new Publication('', '', '', '', this.identity._id);
    this.files = [];
    this.filesToUpload = [];
  }

  ngOnInit() {
    this._userService.updateCounters();
    this.sessionSubscription = this._sessionService.newData$.subscribe({
      next: (data) => {
        this.identity = this._sessionService.getIdentity();
        this.stats = this._sessionService.getStats();
      },
    });
  }

  ngOnDestroy() {
    this.sessionSubscription?.unsubscribe();
  }

  onSubmit(newPubForm: any) {
    this._publicationService
      .addPublication(this.token, this.publication)
      .subscribe({
        next: (response) => {
          if (response.publication) {
            this.publication = response.publication;
            newPubForm.reset();
            this.filesToUpload = [];
            this._userService.updateCounters();
            this._messageService.add({
              severity: 'success',
              summary: 'Publicación creada',
            });
          } else {
            this._messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'No se ha podido crear la publicación',
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
        complete: () => {
          //Lanzamos evento para que se refresque las publicaciones.
          this._publicationService.newPubEvent(true);
        },
      });
  }

  fileChangeEvent(fileInput: any) {
    this.files = [];
    this.filesToUpload[0] = fileInput.files[0];
  }
}
