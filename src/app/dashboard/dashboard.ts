import { Component, OnInit } from '@angular/core';
import { DbService } from '../db.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Verse, VerseSearchResult } from '../verse.model';
import { mapResultsToVerseSearchResults, mapResultsToVerse } from '../utils';
import { Q } from '@angular/cdk/keycodes';
import { Queries } from '../Queries';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
  providers: [DbService]
})
export class Dashboard implements OnInit {
  searchText: string = '';
  filteredItems: VerseSearchResult[] = [];
  selectedShabad: Verse[] | null = null;
  selectedVerseId: number | null = null;
  history: VerseSearchResult[] = [];

  constructor(private dbService: DbService) {}
  ngOnInit(): void {
    this.dbService.initDb();
  }

  async onSearch() {
    if (!this.searchText.trim()) {
      this.filteredItems = [];
      return;
    }
    // Simple search by Gurmukhi text
    const asciiSearch = Array.from(this.searchText).map(c => c.charCodeAt(0).toString().padStart(3, '0')).join(',') + ',';
    const query = Queries.searchByFirstLetterAnywhere(asciiSearch, '');
    const results = await this.dbService.query(query);
    this.filteredItems = mapResultsToVerseSearchResults(results);
  }

  async onSelectItem(item: VerseSearchResult) {
    const query = `SELECT * FROM sggsvw WHERE ShabadId = ${item.ShabadID}`;
    const results = await this.dbService.query(query);
    this.selectedShabad = mapResultsToVerse(results, true);
    this.selectedVerseId = item.ID || (this.selectedShabad && this.selectedShabad[0]?.ID) || null;
    // Add to history (avoid duplicates)
    if (!this.history.some(h => h.ShabadID === item.ShabadID)) {
      this.history.unshift(item);
      if (this.history.length > 50) this.history.length = 50;
    }
  }

  onSelectHistory(item: VerseSearchResult) {
    this.onSelectItem(item);
  }
}
