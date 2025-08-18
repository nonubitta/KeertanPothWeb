import { Routes } from '@angular/router';
import { Search } from './search/search';
import { Admin } from './admin/admin';
import { Dashboard } from './dashboard/dashboard';

export const routes: Routes = [
  { path: '', component: Search },
  { path: 'admin', component: Admin },
  { path: 'dashboard', component: Dashboard }
];
