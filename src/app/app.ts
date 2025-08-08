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
  englishFontSize: number = 1.0;
  transliterationFontSize: number = 1.0;

  showGurmukhi: boolean = true;
  showEnglish: boolean = true;
  showTransliteration: boolean = true;

  // History of selected items
  history: VerseSearchResult[] = [];
  private readonly HISTORY_KEY = 'kpoth-history';
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
    // Load history from localStorage
    const stored = localStorage.getItem(this.HISTORY_KEY);
    if (stored) {
      try {
        this.history = JSON.parse(stored);
      } catch {
        this.history = [];
      }
    }
  }

  //#endregion

  //#region Side Panels
  
  toggleSidePanel() {
    this.isSidePanelOpen = !this.isSidePanelOpen;
  }

  confirmClearHistory() {
    if (confirm('Are you sure you want to clear your history? This action cannot be undone.')) {
      this.history = [];
      localStorage.removeItem(this.HISTORY_KEY);
    }
  }

  openSidePanel(tab: 'links' | 'settings' | 'history' | 'pothi') {
    const prevTab = this.activeTab;
    this.activeTab = tab;
    if(!prevTab)
      this.isSidePanelOpen = !this.isSidePanelOpen;

    if (prevTab && this.activeTab === prevTab && this.isSidePanelOpen) {
      this.isSidePanelOpen = !this.isSidePanelOpen;
      if (!this.isSidePanelOpen) {
        this.activeTab = null; // Close the panel
      }
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
    // Store in history (avoid duplicates by ShabadID)
    if (!this.history.some(h => h.ShabadID === item.ShabadID)) {
      this.history.unshift(item);
      // Limit history length if desired, e.g. 50
      if (this.history.length > 50) this.history.length = 50;
      localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
    }
    this.showSearchPanel = false;
  }

  closePanel() {
    this.selectedShabad = null;
    this.showSearchPanel = true;
  }
  //#endregion

  //#region Presentation mode
  viewMode: 'single' | 'presentation' = 'single';
  popupWindow: Window | null = null;

  // Call this from the template when a verse row is clicked in selectedShabad
  onPresentationVerseClick(verse: Verse) {
    if (this.viewMode === 'presentation') {
      const popupHtml = this.getPresentationHtml(verse);
      if (!this.popupWindow || this.popupWindow.closed) {
        this.popupWindow = window.open('', 'kpoth-presentation', 'width=800,height=600');
      }
      if (this.popupWindow) {
        this.popupWindow.document.open();
        this.popupWindow.document.write(popupHtml);
        this.popupWindow.document.close();
      }
    }
  }

  // Presentation view Gurmukhi font size
  presentationGurmukhiFontSize: number = 3;

  getPresentationHtml(verse: Verse): string {
  console.log(window.location.origin);
    return `
      <html>
      <head>
        <title>Keertan Pothi - Presentation</title>
        <style>
          @font-face {
            font-family: 'Gurakhar';
            src: url('${window.location.origin}/assets/Fonts/GURAKHAR.TTF') format('truetype');
            font-weight: 300;
            font-style: normal;
          }
          body {
            background: #121212;
            color: #fff;
            font-family: 'Segoe UI', sans-serif;
            margin: 0;
            padding: 0;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
          }
          .verse-text {
            font-family: 'Gurakhar', sans-serif;
            font-size: ${this.presentationGurmukhiFontSize}rem;
            margin-bottom: 2rem;
            color: #fff;
            text-align: center;
          }
          .verse-translation {
            font-size: ${this.englishFontSize}rem;
            color: #b0b0b0;
            margin-bottom: 1rem;
            text-align: center;
          }
          .verse-translation.transliteration {
            color: #8ecae6;
            font-size: ${this.transliterationFontSize}rem;
            text-align: center;
          }
        </style>
      </head>
      <body>
        ${this.showGurmukhi ? `<div class="verse-text">${verse.Gurmukhi}</div>` : ''}
        ${this.showEnglish && verse.English ? `<div class="verse-translation">${verse.English}</div>` : ''}
        ${this.showTransliteration && verse.Transliteration ? `<div class="verse-translation transliteration">${verse.Transliteration}</div>` : ''}
      </body>
      </html>
    `;
  }

  //#endregion
}