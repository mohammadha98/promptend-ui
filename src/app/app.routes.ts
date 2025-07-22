import { Routes } from '@angular/router';

export const routes: Routes = [
  { 
    path: '', 
    loadChildren: () => import('./modules/landing/landing.module').then(m => m.LandingModule),
    pathMatch: 'full'
  },
  { 
    path: 'chat', 
    loadComponent: () => import('./modules/chat/components/chat/chat.component').then(c => c.ChatComponent) 
  },
  { 
    path: '**', 
    redirectTo: '' 
  }
];
