import { Routes } from '@angular/router';

import { Search } from './search/search';
import { Admin } from './admin/admin';
import { Dashboard } from './dashboard/dashboard';
import { ManagePothi } from './manage-pothi/manage-pothi';

export const routes: Routes = [
  {
    path: '',
    component: Search,
    title: 'Search Gurbani | Keertan Pothi'
  },
  {
    path: 'dashboard',
    component: Dashboard,
    title: 'Dashboard | Keertan Pothi'
  },
  {
    path: 'pothi',
    component: ManagePothi,
    title: 'Manage Pothi | Keertan Pothi'
  },
  {
    path: 'admin',
    component: Admin,
    title: 'Admin | Keertan Pothi'
  }
];