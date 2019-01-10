import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { FormComponent } from './form/form.component';
import { ProfileComponent } from './profile/profile.component';
import { DashboardComponent } from './dashboard/dashboard.component';

export const AppRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    data: {
      breadcrumb: 'Home'
    },
    children: [
      {
        path: 'profile',
        component: ProfileComponent,
        data: {
          breadcrumb: 'Profile'
        }
      },
      {
        path: 'form',
        component: FormComponent,
        data: {
          breadcrumb: 'Form'
        }
      },
      {
        path: 'dashboard',
        component: DashboardComponent,
        data: {
          breadcrumb: 'Dashboard'
        }
      }
    ]
  },
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: '**', redirectTo: 'home' }
];
