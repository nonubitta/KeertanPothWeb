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
  detailsInfo:Verse | null = null;
  // Side panel state
  isSidePanelOpen: boolean = false;

  constructor(private dbService: DbService) {}

  async ngOnInit() {
    await this.dbService.initDb();
    this.isDbReady = true;
  }

  // Side panel methods
  toggleSidePanel() {
    this.isSidePanelOpen = !this.isSidePanelOpen;
  }

  closeSidePanel() {
    this.isSidePanelOpen = false;
  }

  // Navigation methods
  navigateToHome() {
    this.closeSidePanel();
    // Add your home navigation logic here
    console.log('Navigate to Home');
  }

  navigateToAbout() {
    this.closeSidePanel();
    // Add your about navigation logic here
    console.log('Navigate to About');
  }

  navigateToSearch() {
    this.closeSidePanel();
    // Add your search navigation logic here
    console.log('Navigate to Search');
  }

  navigateToFavorites() {
    this.closeSidePanel();
    // Add your favorites navigation logic here
    console.log('Navigate to Favorites');
  }

  navigateToSettings() {
    this.closeSidePanel();
    // Add your settings navigation logic here
    console.log('Navigate to Settings');
  }

  navigateToHelp() {
    this.closeSidePanel();
    // Add your help navigation logic here
    console.log('Navigate to Help');
  }

  handleSearch(event: Event) {
    event.preventDefault();
    this.onSearch();
  }

  async onSearch() {
    if (!this.isDbReady || !this.searchText.trim()) {
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
    const query = Queries.getShabadById(item.ShabadID);
    const results = await this.dbService.query(query);
    this.selectedShabad = mapResultsToVerse(results);
    this.detailsInfo = this.selectedShabad[0];
    if (!this.detailsInfo.WriterID) {
      const verse = this.selectedShabad.find(v => v.WriterID != null);
      if (verse) {
        this.detailsInfo.WriterID = verse.WriterID;
        this.detailsInfo.WriterEnglish = verse.WriterEnglish;
      }
    }
    this.showSearchPanel = false;
  }

  closePanel() {
    this.selectedShabad = null;
    this.showSearchPanel = true;
  }
}