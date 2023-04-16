import { Component, OnDestroy, OnInit } from '@angular/core';
import { Publication } from 'src/app/models/publication';
import { GLOBAL } from 'src/app/services/global';
import { PublicationService } from 'src/app/services/publication.service';
import { SessionService } from 'src/app/services/session.service';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
declare var $: any;

@Component({
  selector: 'app-publications',
  templateUrl: './publications.component.html',
  styleUrls: ['./publications.component.css'],
  providers: [MessageService],
})
export class PublicationsComponent implements OnInit, OnDestroy {
  public identity;
  public token;
  public url;
  public publications: Publication[];
  public total: number;
  public pages: number;
  public page: number;
  public itemsPerPage: number;
  public noMore: boolean;
  private newPubSubscription: Subscription | undefined;

  constructor(
    private _publicationService: PublicationService,
    private _sessionService: SessionService,
    private _messageService: MessageService
  ) {
    this.identity = this._sessionService.getIdentity();
    this.token = this._sessionService.getToken();
    this.url = GLOBAL.url;
    this.publications = [];
    this.total = 0;
    this.pages = 0;
    this.page = 1;
    this.itemsPerPage = 0;
    this.noMore = false;
  }

  ngOnInit() {
    this.getPublications(this.page);
    this.newPubSubscription = this._publicationService.newPubSource$.subscribe({
      next: (value) => {
        if (value) {
          this.page = 1;
          this.getPublications(this.page);
          this._publicationService.newPubEvent(false);
        }
      },
    });
  }

  ngOnDestroy() {
    this.newPubSubscription?.unsubscribe();
  }

  getPublications(page: number, adding = false) {
    this._publicationService.getPublications(this.token, page).subscribe({
      next: (response) => {
        if (response.publications) {
          this.total = response.total;
          this.pages = response.pages;
          this.itemsPerPage = response.itemsPerPage;

          if (!adding) {
            //Para mostrar el botón de ver más
            this.noMore = false;

            this.publications = response.publications;

            //Si hemos llegado al máximo de publicaciones no mostramos botón de ver más
            if (this.publications.length == this.total) {
              this.noMore = true;
            }
          } else {
            var arrayA = this.publications;
            var arrayB = response.publications;
            this.publications = arrayA.concat(arrayB);
            $('html').animate({ scrollTop: $(document).height() }, 800);
          }
        } else {
          this._messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No hay publicaciones',
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

  viewMore() {
    //Si hemos llegado al máximo de publicaciones o si el número de publicaciones
    //que tenemos más el número de publicaciones por página es mayor o igual que el total de publicaciones,
    //entonces ocultamos el botón de ver más
    if (
      this.publications.length == this.total ||
      this.publications.length + this.itemsPerPage >= this.total
    ) {
      this.noMore = true;
    }

    this.page += 1;
    this.getPublications(this.page, true);
  }
}
