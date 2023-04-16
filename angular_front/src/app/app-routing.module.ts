import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { HomeComponent } from './components/home/home.component';
import { UserEditComponent } from './components/user-edit/user-edit.component';
import { UsersComponent } from './components/users/users.component';
import { TimelineComponent } from './components/timeline/timeline.component';
import { ProfileComponent } from './components/profile/profile.component';
import { MessageComponent } from './components/message/message.component';

import { UserGuardService } from './services/user-guard.service';

const routes: Routes = [
  {path: '', component: HomeComponent},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'home', component: HomeComponent},
  {path: 'mis-datos', component: UserEditComponent, canActivate: [UserGuardService]},
  {path: 'gente', component: UsersComponent, canActivate: [UserGuardService]},
  {path: 'timeline', component: TimelineComponent, canActivate: [UserGuardService]},
  {path: 'perfil/:id', component: ProfileComponent, canActivate: [UserGuardService]},
  {path: 'messages', component: MessageComponent, canActivate: [UserGuardService]},
  {path: '**', component: HomeComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
