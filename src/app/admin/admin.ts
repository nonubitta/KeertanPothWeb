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
 
  columnChips = [
    { label: 'ShabadID', value: 'ShabadID' },
    { label: 'ID', value: 'ID' },
    { label: 'English', value: 'English' },
    { label: 'Gurmukhi', value: 'Gurmukhi' },
    { label: 'GurmukhiBisram', value: 'GurmukhiBisram' },
    { label: 'GurmukhiUni', value: 'GurmukhiUni' },
    { label: 'WriterID', value: 'WriterID' },
    { label: 'Punjabi', value: 'Punjabi' },
    { label: 'RaagID', value: 'RaagID' },
    { label: 'PageNo', value: 'PageNo' },
    { label: 'LineNo', value: 'LineNo' },
    { label: 'SourceID', value: 'SourceID' },
    { label: 'FirstLetterStr', value: 'FirstLetterStr' },
    { label: 'MainLetters', value: 'MainLetters' },
    { label: 'Bisram', value: 'Bisram' },
    { label: 'Visraam', value: 'Visraam' },
    { label: 'FirstLetterEng', value: 'FirstLetterEng' },
    { label: 'Transliteration', value: 'Transliteration' },
    { label: 'writerenglish', value: 'writerenglish' },
    { label: 'raagenglish', value: 'raagenglish' },
  ];
  selectedColumns: string[] = [];

  toggleColumn(col: string) {
    const idx = this.selectedColumns.indexOf(col);
    if (idx >= 0) {
      this.selectedColumns.splice(idx, 1);
    } else {
      this.selectedColumns.push(col);
    }
    this.updateQueryText();
  }

  updateQueryText() {
    if (this.selectedColumns.length === 0) return;
    // Try to detect table from current queryText, fallback to Verse
    let table = 'Verse';
    const match = this.queryText.match(/from\s+([a-zA-Z0-9_]+)/i);
    if (match && match[1]) {
      table = match[1];
    }
    this.queryText = `SELECT ${this.selectedColumns.join(', ')} FROM ${table} LIMIT 100`;
  }

  setQuery(sql: string) {
    this.queryText = sql;
    // Try to auto-select columns if query matches SELECT ... FROM ... pattern
    const match = sql.match(/select\s+(.+?)\s+from/i);
    if (match && match[1]) {
      const cols = match[1].split(',').map(x => x.trim());
      this.selectedColumns = this.columnChips
        .map(c => c.value)
        .filter(v => cols.includes(v));
    } else {
      this.selectedColumns = [];
    }
  }
}
