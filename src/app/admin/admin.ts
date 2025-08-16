import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from '../db.service';  // Your existing service handling sql.js

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin {
  username: string = '';
  password: string = '';
  loginError: string = '';
  loggedIn: boolean = false;

  onLogin(event: Event) {
    event.preventDefault();
    if (this.username === 'daas' && this.password === 'wjkkwjkf') {
      this.loggedIn = true;
      this.loginError = '';
    } else {
      this.loginError = 'Invalid username or password.';
      this.loggedIn = false;
    }
  }

  logout() {
    this.loggedIn = false;
    this.username = '';
    this.password = '';
    this.loginError = '';
  }
}
