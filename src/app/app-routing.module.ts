import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './shared/Guard/auth.guard';
import { GuestGuard } from './shared/Guard/Guest.Guard';
import { ProfileGuard } from './shared/Guard/profile.guard';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'welcome',
    pathMatch: 'full'
  },
  {
    path: 'welcome',
    loadChildren: () => import('./features/welcome/welcome.module').then( m => m.WelcomePageModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./features/login/login.module').then(m => m.LoginPageModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'register',
    loadChildren: () => import('./features/register/register.module').then(m => m.RegisterModule),
    canActivate: [GuestGuard]
  },
  {
    path: 'home',
    loadChildren: () => import('./features/home/home.module').then(m => m.HomePageModule),
    canActivate: [AuthGuard, ProfileGuard]
  },
  {
    path: 'profile',
    loadChildren: () => import('./features/profile/profile.module').then(m => m.ProfilePageModule),
    canActivate: [AuthGuard]
  },
  {
    path: 'chat',
    loadChildren: () => import('./features/chat/chat.module').then(m => m.ChatPageModule),
    canActivate: [AuthGuard, ProfileGuard]
  },
  {
    path: 'chat-conversation/:chatId',
    loadChildren: () => import('./features/chat-conversation/chat-conversation.module').then(m => m.ChatConversationPageModule),
    canActivate: [AuthGuard, ProfileGuard]
  },
  {
    path: '**',
    redirectTo: 'welcome'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })],
  exports: [RouterModule]
})
export class AppRoutingModule {}