import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from './db.service';  // Your existing service handling sql.js
import { Verse, VerseSearchResult } from './verse.model';
import { mapResultsToVerse, mapResultsToVerseSearchResults } from './utils';
import { Queries } from './Queries';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
})

export class App implements OnInit {
  searchMode: string = 'anywhere';
  showSearchPanel: boolean = true;
  searchText: string = '';
  filteredItems: VerseSearchResult[] = [];
  selectedShabad: Verse[] | null = null;
  private isDbReady = false;

  constructor(private dbService: DbService) {}

  async ngOnInit() {
    await this.dbService.initDb();
    this.isDbReady = true;
  }

  async onSearch() {
    
    if (!this.isDbReady || !this.searchText.trim()){// || this.searchText.length < 3) {
      this.filteredItems = [];
      return;
    }
    this.selectedShabad = null;
    this.showSearchPanel = true;
    // Sanitize input if needed to prevent SQL injection — here simple usage
    let asciiSearch = '';
    for (const c of this.searchText) {
      const str = c.charCodeAt(0).toString().padStart(3, '0');
      asciiSearch += str + ',';
    }
    const query = Queries.searchByFirstLetter(asciiSearch, this.searchMode === 'anywhere');
    try {
      const results = await this.dbService.query(query);
      this.filteredItems = mapResultsToVerseSearchResults(results);
    } catch (error) {
      console.error('Error querying the DB:', error);
    }
}

  async onSelectItem(item: VerseSearchResult) {
    const query = `
      SELECT * FROM sggsvw 
      WHERE ShabadId = '${item.ShabadID}' 
    `;
    const results = await this.dbService.query(query);
    this.selectedShabad = mapResultsToVerse(results);
    this.showSearchPanel = false;
  }

  closePanel() {
    this.selectedShabad = null;
    this.showSearchPanel = true;
  }

}