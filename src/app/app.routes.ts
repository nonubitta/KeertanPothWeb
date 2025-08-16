import { Routes } from '@angular/router';
import { Search } from './search/search';
import { About } from './about/about';
import { Admin } from './admin/admin';

export const routes: Routes = [
  { path: '', component: Search },
  { path: 'about', component: About },
  { path: 'admin', component: Admin }
];
