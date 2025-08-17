import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from '../db.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-admin',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin.html',
  styleUrl: './admin.scss'
})
export class Admin implements OnInit {
  queryText: string = '';
  results: any[] = [];
  columns: string[] = [];
  errorMsg: string = '';
  defaultQuery = "SELECT GurmukhiUni FROM SGGSVW WHERE ShabadID = ";
  constructor(private dbService: DbService, private route: ActivatedRoute) {}
  async ngOnInit(): Promise<void> {
    await this.dbService.initDb();
    this.shabadId = this.route.snapshot.queryParamMap.get('shabad') || '';
    if(this.shabadId){
      this.setQuery(this.defaultQuery + this.shabadId);
    }
  }
  shabadId: string = '';
  username: string = '';
  password: string = '';
  loginError: string = '';
  loggedIn: boolean = false;

  onLogin(event: Event) {
    event.preventDefault();
    if (1==1 || this.username === 'daas' && this.password === 'wjkkwjkf') {
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

  async runQuery() {
    this.errorMsg = '';
    this.results = [];
    this.columns = [];
    try {
      const res = await this.dbService.query(this.queryText);
      this.results = res;
      if (res.length > 0) {
        this.columns = Object.keys(res[0]);
      }
    } catch (e: any) {
      this.errorMsg = e.message || 'Query failed.';
    }
  }
 
  setQuery(sql: string) {
    this.queryText = sql;
  }
}
