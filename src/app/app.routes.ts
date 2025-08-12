import { Routes } from '@angular/router';
import { App } from './app';
import { AboutComponent } from './about.component'; // You need to create this component
import { Search } from './search/search';

export const routes: Routes = [
  { path: '', component: Search },
  { path: 'about', component: AboutComponent }
];
