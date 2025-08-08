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
  
  //#region Public Properties
  searchMode: string = 'anywhere';
  showSearchPanel: boolean = true;
  searchText: string = '';
  filteredItems: VerseSearchResult[] = [];
  selectedShabad: Verse[] | null = null;
  private isDbReady = false;
  detailsInfo:Verse | null = null;
  showMainKeyboard: boolean = true
  
  // Side panel state
  isSidePanelOpen: boolean = false;
  activeTab: 'links' | 'settings' | 'history' | 'pothi' | null = null;

  // Punjabi Keyboard state
  showKeyboard: boolean = false;
    // Gurmukhi font size
  gurmukhiFontSize: number = 2;

  // English translation font size
  englishFontSize: number = 1.4;

  //#endregion

  //#region Punjabi keyboard layout
  keyboardLayout1 = [
    ['a', 'A', 'e', 's', 'h', 'q', 'Q', 'd', 'D', 'n'],
    ['k', 'K', 'g', 'G', '|', 'p', 'P', 'b', 'B', 'm'],
    ['c', 'C', 'j', 'J', '\\', 'X', 'r', 'l', 'v', 'V'],
    ['t', 'T', 'f', 'F', 'x', 'E', '⎵', '←', '123']
    
  ];
   keyboardLayout2 = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['y', 'Y', 'i', 'I', 'w', 'W', 'u', 'U', 'o', 'O'],
    ['R', 'N', 'M', 'S', '^', 'Z', 'z', '&', '⎵', '←','123']
  ];
  keyboardLayout = this.keyboardLayout1;
  //#endregion

  //#region constructor, onInit
  constructor(private dbService: DbService) {}

  async ngOnInit() {
    await this.dbService.initDb();
    this.isDbReady = true;
  }

  //#endregion

  //#region Side Panels
  
  toggleSidePanel() {
    this.isSidePanelOpen = !this.isSidePanelOpen;
  }

  openSidePanel(tab: 'links' | 'settings' | 'history' | 'pothi') {
    this.activeTab = tab;
    this.isSidePanelOpen = !this.isSidePanelOpen;
    if(!this.isSidePanelOpen) {
      this.activeTab = null;
    }
  }

  closeSidePanel() {
    this.isSidePanelOpen = false;
    this.activeTab = null;
  }

  //#endregion

  //#region Keyboard methods

  toggleKeyboard() {
    this.showKeyboard = !this.showKeyboard;
  }

  hideKeyboard() {
    this.showKeyboard = false;
  }

  onKeyPress(key: string) {
    if (key === '←') {
      // Backspace
      this.searchText = this.searchText.slice(0, -1);
    } else if (key === '') {
      return;
    } else if (key === '⎵') {
      this.searchText += ' '; // Add space
    }else if (key === '⌕') {
      return; // Add space
    }else if (key === '123') {
      if(this.showMainKeyboard) 
        this.keyboardLayout = this.keyboardLayout2;
      else 
        this.keyboardLayout = this.keyboardLayout1; // Switch back to Punjabi layout
      this.showMainKeyboard = !this.showMainKeyboard; 

    }else {
      // Add character
      this.searchText += key;
    }
    // Trigger search after key press
    this.onSearch();
  }

  //#endregion

  //#region Search methods & toggle search and details
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

  //#endregion
}