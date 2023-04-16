import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { GLOBAL } from './services/global';
import { MenuItem } from 'primeng/api';
import { SessionService } from './services/session.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit, OnDestroy {
  private sessionSubscription: Subscription | undefined;

  public nav: MenuItem[] = [];
  public profile: MenuItem[] = [];

  public title: string;
  public identity: any;
  public url: string;

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _sessionService: SessionService
  ) {
    this.title = 'NGSOCIAL';
    this.url = GLOBAL.url;
  }

  ngOnInit() {
    this.sessionSubscription = this._sessionService.newData$.subscribe({
      next: (data) => {
        this.identity = this._sessionService.getIdentity();
        this.refreshMenuBar();
      },
    });
  }

  ngOnDestroy() {
    this.sessionSubscription?.unsubscribe();
  }

  refreshMenuBar() {
    let identity: boolean = this.identity != null ? true : false;

    if (this.identity != null) {
      this.profile = [
        {
          label: 'Opciones',
          items: [
            {
              label: 'Mi perfil',
              icon: 'pi pi-user',
              routerLink: ['/perfil', this.identity._id],
            },
            {
              label: 'Mis datos',
              icon: 'pi pi-cog',
              routerLink: ['/mis-datos'],
            },
            {
              label: 'Mensajes',
              icon: 'pi pi-envelope',
              routerLink: ['/messages'],
            },
            {
              label: 'Cerrar sesión',
              icon: 'pi pi-sign-out',
              command: () => {
                this.logout();
              },
            },
          ],
        },
      ];
    }

    this.nav = [
      {
        label: 'Login',
        icon: 'pi pi-fw pi-sign-in',
        routerLink: ['/login'],
        visible: !identity,
      },
      {
        label: 'Register',
        icon: 'pi pi-fw pi-user-plus',
        routerLink: ['/register'],
        visible: !identity,
      },
      {
        label: 'Inicio',
        icon: 'pi pi-fw pi-home',
        routerLink: ['/home'],
        visible: identity,
      },
      {
        label: 'Timeline',
        icon: 'pi pi-fw pi-list',
        routerLink: ['/timeline'],
        visible: identity,
      },
      {
        label: 'Gente',
        icon: 'pi pi-fw pi-users',
        routerLink: ['/gente'],
        visible: identity,
      },
      {
        label: 'Mensajes',
        icon: 'pi pi-envelope',
        routerLink: ['/messages'],
        visible: identity,
      },
    ];
  }

  logout() {
    localStorage.clear();
    this.identity = null;
    this._sessionService.newDataEvent();
    this._router.navigate(['/login']);
  }
}
