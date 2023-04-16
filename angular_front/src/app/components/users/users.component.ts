import { Component, OnInit } from '@angular/core';
import { User } from '../../models/user';
import { Follow } from '../../models/follow';
import { UserService } from '../../services/user.service';
import { FollowService } from '../../services/follow.service';
import { SessionService } from 'src/app/services/session.service';
import { GLOBAL } from '../../services/global';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
  providers: [MessageService],
})
export class UsersComponent implements OnInit{

  public users: User[];
  public follows: any[];
  public followUserOver: string;
  public identity;
  public token;
  public url: string;
  public total: number;

  constructor(
    private _userService: UserService,
    private _followService: FollowService,
    private _sessionService: SessionService,
    private _messageService: MessageService
  ) {
    this.users = [];
    this.follows = [];
    this.followUserOver = '';
    this.identity = this._sessionService.getIdentity();
    this.token = this._sessionService.getToken();
    this.url = GLOBAL.url;
    this.total = 0;
  }

  ngOnInit() {
    this.getUsers();
  }

  getUsers(page: number = 1) {
    this._userService.getUsers(page).subscribe({
      next: (response) => {
        if (!response.users) {
          this._messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No hay usuarios disponibles',
          });
        } else {
          this.users = response.users;
          this.follows = response.following_clean;
          this.total = response.total;
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

  paginatorUsers(event: any) {
    let paginatorPage: number = event.first / event.rows + 1;
    this.getUsers(paginatorPage);
  }

  mouseEnter(user_id: string) {
    this.followUserOver = user_id;
  }

  mouseLeave() {
    this.followUserOver = '0';
  }

  followUser(followed: any) {
    let follow = new Follow('', this.identity._id, followed);

    this._followService.addFollow(this.token, follow).subscribe({
      next: (response) => {
        if (!response.follow) {
          this._messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'No se ha podido seguir al usuario',
          });
        } else {
          this.follows.push(followed);
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

  unfollowUser(followed: any) {
    this._followService.deleteFollow(this.token, followed).subscribe({
      next: (response) => {
        //Si todo sale bien se elimina el usuario del array
        let search = this.follows.indexOf(followed);
        if (search != -1) {
          this.follows.splice(search, 1);
        }
      },
      error: (err) => {
        this._messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se ha podido dejar de seguir al usuario',
        });
      },
    });
  }
}
