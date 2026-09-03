import { Component, inject, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from '../db.service';  // Your existing service handling sql.js
import { NitnemBani, Verse, VerseSearchResult } from '../verse.model';
import { visraamToVishraamArray, mapResultsToVerse, mapResultsToVerseSearchResults, mapVerseToVerseSearchResults } from '../utils';
import { Queries } from '../Queries';
import { Router, RouterModule } from '@angular/router';
import { ActivatedRoute } from '@angular/router';
import { SpeechTestComponent } from '../speech-test.component/speech-test.component';
import { SpeechHelper } from '../speech-helper';
import { SeoService } from '../services/seo.service';
export enum ShabadSource {
  None = 'None',
  Random = 'Random',
  History = 'History',
  Favorites = 'Favorites',
  Search = 'Search',
  SundarGutka = 'SundarGutka'
}
@Component({
  selector: 'app-search',
  imports: [CommonModule, FormsModule, RouterModule, SpeechTestComponent, ],
  templateUrl: './search.html',
  styleUrl: './search.scss'
})
export class Search {

  //#region Public Properties
  searchMode: string = 'anywhere';
  showSearchPanel: boolean = true;
  searchText: string = '';
  filteredItems: VerseSearchResult[] = [];
  selectedShabad: Verse[] | null = null;
  private isDbReady = false;
  detailsInfo:Verse | null = null;
  showMainKeyboard: boolean = true
  selectedVerseId: number | null = null;
  selectedItem: VerseSearchResult | null = null;
  nitnemBani: NitnemBani[] = [];
  shabadSource: ShabadSource = ShabadSource.None;
  // Side panel state
  isSidePanelOpen: boolean = false;
  activeTab: 'random' | 'links' | 'settings' | 'history' | 'pothi' | 'favorites' | null = null;

  // Punjabi Keyboard state
  showKeyboard: boolean = false;
    // Gurmukhi font size
  gurmukhiFontSize: number = 2;
  punjabiFontSize: number = 1.0;
  englishFontSize: number = 1.0;
  transliterationFontSize: number = 1.0;

  showGurmukhi: boolean = true;
  showEnglish: boolean = true;
  showPunjabi: boolean = true;
  showTransliteration: boolean = true;
  // New settings
  showVishraam: boolean = true;
  showLadivaar: boolean = false;

  // History of selected items
  history: VerseSearchResult[] = [];
  private readonly HISTORY_KEY = 'kpoth-history';
  private readonly POTHIS_KEY = 'kpoth-pothis';
  private readonly FAVORITES_KEY = 'kpoth-favorites';
  RoastMessage: string = '';
  showRoastMessage: boolean = false;
  writers: any[] = [];
  selectedWriterId: string = '';
  sources: any[] = [];
  selectedSourceId: string = '';
  searchQuery: string = '';
noResults: boolean = false;
  // Contact modal
  showContactModal: boolean = false;

  // Add Pothi modal
  showAddPothiModal: boolean = false;
  newPothiName: string = '';

  pothis: { name: string, ids: number[] }[] = [];

  // Favorites
  favorites: VerseSearchResult[] = [];

  // Import favorites UI state
  showImportFileInput: boolean = false;

  // Theme
  theme: string = 'navy'; // set blue/navy as default

  // Pin header
  pinHeader: boolean = true;
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
  constructor(private dbService: DbService, private router: Router, 
    private route: ActivatedRoute, private seo: SeoService
  ) {}

  async ngOnInit() {
    
    this.seo.update(
    'Search Gurbani | Keertan Pothi',
    'Search Gurbani from Sri Guru Granth Sahib Ji, Dasam Granth Sahib Ji, Bhai Gurdas Ji and many other Sikh scriptures.',
    'https://keertanpothi.org/'
);  

this.seo.setStructuredData({

  "@context": "https://schema.org",

  "@type": "WebSite",

  "name": "Keertan Pothi",

  "url": "https://keertanpothi.org",

  "description": "Search Gurbani from Sikh scriptures.",

  "potentialAction": {

    "@type": "SearchAction",

    "target": "https://keertanpothi.org/?search={search_term_string}",

    "query-input": "required name=search_term_string"

  }

});
    
    // Load theme from localStorage
    const savedTheme = localStorage.getItem('kpoth-theme');
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('navy'); // set blue/navy as default if not set
    }
    
    const shabadId = this.route.snapshot.queryParamMap.get('shabad');
    await this.dbService.initDb();
    this.isDbReady = true;
    
    try {
      const writersResult = await this.dbService.query(Queries.getWriters());
      this.writers = writersResult;
      const sourcesResult = await this.dbService.query(Queries.getSources());
      this.sources = sourcesResult;
      this.nitnemBani = await this.dbService.query(Queries.getAllBanis());
    } catch (e) {
      this.writers = [];
      this.sources = [];
    }
   
    // Load history from localStorage
    const stored = localStorage.getItem(this.HISTORY_KEY);
    if (stored) {
      try {
        this.history = JSON.parse(stored);
      } catch {
        this.history = [];
      }
    }

    // Load pothis from localStorage
    // const pothisStored = localStorage.getItem(this.POTHIS_KEY);
    // if (pothisStored) {
    //   try {
    //     this.pothis = JSON.parse(pothisStored);
    //   } catch {
    //     this.pothis = [];
    //   }
    // }

    // Load favorites from localStorage
    const favStored = localStorage.getItem(this.FAVORITES_KEY);
    if (favStored) {
      try {
        this.favorites = JSON.parse(favStored);
      } catch {
        this.favorites = [];
      }
    }

    if (shabadId) {
      const result: VerseSearchResult = {
        ShabadID: Number(shabadId)
      };
      this.onSelectItem(result, "NONE");
    }

    // Load pinHeader from localStorage
    const pin = localStorage.getItem('kpoth-pin-header');
    if (pin !== null) {
      this.pinHeader = pin === 'true';
      this.applyPinHeader();
    }
  }

  showRoastMessageFn(message: string) {
    this.RoastMessage = message;
    this.showRoastMessage = true;
    setTimeout(() => {
      this.showRoastMessage = false;
    }, 3000);
  }


  onLogoClick() {
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/']);
    });
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
      this.showRoastMessageFn('History has been cleared');
    }
  }

  confirmClearFavorites() {
   if (confirm('Are you sure you want to clear your favorites? This action cannot be undone.')) {
      this.favorites = [];
      localStorage.removeItem(this.FAVORITES_KEY);
      this.showRoastMessageFn('Favorites have been cleared');
    }
  }

  openEditFavorites() {
    this.router.navigate(['/favorites']);
    this.closeSidePanel();
  }

  openSidePanel(tab: 'random' | 'links' | 'settings' | 'history' | 'pothi' | 'favorites') {
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

  openRandomShabad(shabadId?: number) {
    if(!shabadId) {
      const randomIndex =  Math.floor(Math.random() * (5540 - 40 + 1)) + 40;
      shabadId = randomIndex;
    }
      // Create a new VerseSearchResult and assign ShabadID
      const result: VerseSearchResult = {
        ShabadID: shabadId
      };
    this.onSelectItem(result, "RANDOM");
    this.closeSidePanel();
  }

  async openNitnemBani(baniId: number) {
    const query = Queries.getNitnemBani(baniId);
    const results = await this.dbService.query(query);
    const item: VerseSearchResult = mapVerseToVerseSearchResults(results[0]);
    // Remove the URL update for Nitnem Bani, or use a different param
    this.shabadSource = ShabadSource.SundarGutka;
    this.setSelectedShabad(item, results, { updateUrl: false });
    this.closeSidePanel();
  }

  openContact() {
    this.showContactModal = true;
    this.closeSidePanel();
  }

  closeContactModal() {
    this.showContactModal = false;
  }

  openSundarGutka() {
  
  }

  openQuickSettings() {
    if(this.showEnglish || this.showPunjabi || this.showTransliteration) {
    this.showEnglish = false;
    this.showPunjabi = false;
    this.showTransliteration = false;
    }
    else{
      this.showEnglish = true;
      this.showPunjabi = true;
    }
  }

  shareShabad() {
    // Share the current page using the Web Share API if available
    if (navigator.share) {
      const url = window.location.href;
      navigator.share({
        title: 'Keertan Pothi',
        text: 'Check out this Shabad on Keertan Pothi',
        url: url
      }).catch(() => {});
    } else {
      // Fallback: copy URL to clipboard
      try {
        navigator.clipboard.writeText(window.location.href);
        alert('Link copied to clipboard!');
      } catch {
        alert('Unable to copy link. Please copy the URL manually.');
      }
    }
  }

  // Modal for adding to pothi
  showAddToPothiModal: boolean = false;
  selectedPothiIndex: number | null = null;
  newPothiNameForFav: string = '';

  addToFavorites() {
    if (this.selectedItem && this.selectedItem.Gurmukhi) {
      // Avoid duplicates by ShabadID
      if (!this.favorites.some(f => f.VerseID === this.selectedItem!.VerseID)) {
        this.favorites.unshift(this.selectedItem);
        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
        this.showRoastMessageFn('Shabad added to favorites');
      }
      else {
        this.showRoastMessageFn('Shabad is already in favorites');
      }
    }
  }

  exportFavorites() {
    if (this.favorites.length === 0) {
      this.showRoastMessageFn('No favorites to export');
      return;
    }
    const dataStr = JSON.stringify(this.favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `keertan-pothi-favorites-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    this.showRoastMessageFn('Favorites exported successfully');
  }

  importFavorites(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const importedFavorites = JSON.parse(content);

        if (!Array.isArray(importedFavorites)) {
          this.showRoastMessageFn('Invalid file format: expected an array of favorites');
          return;
        }

        let addedCount = 0;
        const validFavorites: VerseSearchResult[] = [];
        
        for (const fav of importedFavorites) {
          // Validate the favorite has required fields
          if (fav && fav.ShabadID && fav.Gurmukhi) {
            // Avoid duplicates by ShabadID
            if (!this.favorites.some(f => f.ShabadID === fav.ShabadID)) {
              validFavorites.push(fav);
              addedCount++;
            }
          }
        }

        // Prepend the valid favorites in their original order (first in JSON = first in list)
        this.favorites = [...validFavorites, ...this.favorites];

        localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
        this.showRoastMessageFn(`${addedCount} favorite(s) imported successfully`);
      } catch (error) {
        console.error('Error importing favorites:', error);
        this.showRoastMessageFn('Failed to import favorites: invalid JSON file');
      } finally {
        // Reset the input so the same file can be selected again
        input.value = '';
        // Hide the file input UI
        this.showImportFileInput = false;
      }
    };

    reader.onerror = () => {
      this.showRoastMessageFn('Failed to read file');
      input.value = '';
      this.showImportFileInput = false;
    };

    reader.readAsText(file);
  }

  removeFromFavorites(shabadId: number | undefined) {
    if (shabadId === undefined) return;
    if (confirm('Remove this Shabad from favorites?')) {
      this.favorites = this.favorites.filter(f => f.ShabadID !== shabadId);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
      this.showRoastMessageFn('Shabad removed from favorites');
    }
  }

  //#region Pothi management
  openAddPothiModal() {
    this.newPothiName = '';
    this.showAddPothiModal = true;
  }

  closeAddPothiModal() {
    this.showAddPothiModal = false;
  }

  addPothi() {
    if (this.newPothiName.trim()) {
      this.pothis.push({ name: this.newPothiName.trim(), ids: [] });
      localStorage.setItem(this.POTHIS_KEY, JSON.stringify(this.pothis));
      this.closeAddPothiModal();
    }
  }

  // Add selectedVerseId to a pothi (no duplicates)
  addVerseToPothi(pothiIndex: number) {
    if (
      this.pothis[pothiIndex] &&
      this.selectedVerseId != null &&
      !this.pothis[pothiIndex].ids.includes(this.selectedVerseId)
    ) {
      this.pothis[pothiIndex].ids.push(this.selectedVerseId);
      localStorage.setItem(this.POTHIS_KEY, JSON.stringify(this.pothis));
    }
  }

  removeVerseFromPothi(pothiIndex: number, verseId: number) {
    if (this.pothis[pothiIndex]) {
      this.pothis[pothiIndex].ids = this.pothis[pothiIndex].ids.filter(id => id !== verseId);
      localStorage.setItem(this.POTHIS_KEY, JSON.stringify(this.pothis));
    }
  }

  deletePothi(index: number) {
    if (index >= 0 && index < this.pothis.length) {
      if (confirm(`Delete pothi "${this.pothis[index].name}"? This cannot be undone.`)) {
        this.pothis.splice(index, 1);
        localStorage.setItem(this.POTHIS_KEY, JSON.stringify(this.pothis));
      }
    }
  }

    addToPothi() {
    this.selectedPothiIndex = null;
    this.newPothiNameForFav = '';
    this.showAddToPothiModal = true;
  }

  closeAddToPothiModal() {
    this.showAddToPothiModal = false;
  }

  saveShabadToPothi() {
    if (this.selectedVerseId == null) return;

    if (this.selectedPothiIndex !== null && this.selectedPothiIndex >= 0) {
      this.addVerseToPothi(this.selectedPothiIndex);
      this.closeAddToPothiModal();
    } else if (this.newPothiNameForFav.trim()) {
      this.pothis.push({ name: this.newPothiNameForFav.trim(), ids: [this.selectedVerseId] });
      localStorage.setItem(this.POTHIS_KEY, JSON.stringify(this.pothis));
      this.closeAddToPothiModal();
    }
  }

  selectPothi(index: number) {
    this.selectedPothiIndex = index;
  }
  //#endregion

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

  //#region Search methods & toggle search and SelectItem
  handleSearch(event: Event) {
    event.preventDefault();
    this.onSearch();
  }

  async onSearch() {
    if (!this.isDbReady || !this.searchText.trim() || this.searchText.trim().length < 2) {
      this.filteredItems = [];
      this.noResults = false;
      return;
    }
    this.selectedShabad = null;
    this.showSearchPanel = true;
    this.noResults = false;

    // Sanitize input if needed to prevent SQL injection — here simple usage
    let asciiSearch = '';
    for (const c of this.searchText) {
      const str = c.charCodeAt(0).toString().padStart(3, '0');
      asciiSearch += str + ',';
    }

    // Add writer/source filter if selected
    let extraFilters = '';
    if (this.selectedWriterId) {
      extraFilters += ` AND vr.WriterID = '${this.selectedWriterId}' `;
    }
    if (this.selectedSourceId) {
      extraFilters += ` AND vr.SourceID = '${this.selectedSourceId}' `;
    }

    let query: string;
    switch(this.searchMode) {
      case 'mainletters':
      case 'exact':
         query = Queries.searchByFirstLetter(this.searchText, this.searchMode, extraFilters);
        break;
      case 'anywhere':
      case 'start':
         query = Queries.searchByFirstLetter(asciiSearch, this.searchMode, extraFilters);
        break;
      default:
         query = Queries.searchByFirstLetter(asciiSearch, this.searchMode, extraFilters);
        break;
    }

    try {
      const results = await this.dbService.query(query);
      this.filteredItems = mapResultsToVerseSearchResults(results);
      this.noResults = this.filteredItems.length === 0;
      if(this.filteredItems.length === 1){
        this.onSelectItem(this.filteredItems[0], "SEARCH");
      }
    } catch (error) {
      console.error('Error querying the DB:', error);
      this.filteredItems = [];
      this.noResults = true;
    }
  }

  clearSearch() {
    this.searchText = '';
    this.filteredItems = [];
    this.noResults = false;
    // Focus the input after clearing
    const input = document.getElementById('searchText') as HTMLInputElement;
    if (input) {
      input.focus();
    }
  }

  async onSelectItem(item: VerseSearchResult, source: string = "NONE") {
    this.SetShabadSource(source);
    const query = Queries.getShabadById(item.ShabadID);
    const results = await this.dbService.query(query);
    if(!item.Gurmukhi){
      item = mapVerseToVerseSearchResults(results[0]);
    }
    this.setSelectedShabad(item, results);
  }

  async setSelectedShabad(item: VerseSearchResult, results: any[], opts?: { updateUrl?: boolean }) {
    this.selectedShabad = mapResultsToVerse(results, this.showVishraam);
    if(item.ID)
      this.selectedVerseId = item.ID;
    //else{
    //  this.selectedVerseId = this.selectedShabad[0].ID; 
    //}
    this.detailsInfo = { ...this.selectedShabad[0] };
  
    if (!this.detailsInfo.WriterID) {
      const verse = this.selectedShabad.find(v => v.WriterID != null);
      if (verse) {
        this.detailsInfo.WriterID = verse.WriterID;
        this.detailsInfo.WriterEnglish = verse.WriterEnglish;
        if(!item.ID){
          item = mapVerseToVerseSearchResults(verse);
        }
      }
    }
    this.selectedItem = item;
    if(item.Gurmukhi && this.shabadSource !== ShabadSource.SundarGutka){
      // Store in history (avoid duplicates by ShabadID)
      if (!this.history.some(h => h.ShabadID === item.ShabadID)) {
        this.history.unshift(item);
        // Limit history length if desired, e.g. 50
        if (this.history.length > 50) this.history.length = 50;
        localStorage.setItem(this.HISTORY_KEY, JSON.stringify(this.history));
      }
    }
    
    this.showSearchPanel = false;
    
    if (item.ShabadID) {
      if(!opts || opts.updateUrl === true){
        this.router.navigate([], {
          queryParams: { shabad: item.ShabadID },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
      else{
        // Remove shabad param from URL
        this.router.navigate([], {
          queryParams: { shabad: null },
          queryParamsHandling: 'merge',
          replaceUrl: true
        });
      }
    }

    setTimeout(() => {
    const el = document.getElementById('selected-verse');
    if (el) {
      const offset = 60; // pixels from the top
      const top = el.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
      } else {
        console.warn('selected-verse not found in DOM');
      }
    }, 50); // small delay to ensure details section is rendered
  }

  SetShabadSource(source: string) {
    switch(source){
      case 'SEARCH':
        this.shabadSource = ShabadSource.Search;
        break;
      case 'RANDOM':
        this.shabadSource = ShabadSource.Random;
        break;
      case 'SUNDARGUTKA':
        this.shabadSource = ShabadSource.SundarGutka;
        break;
      case 'HISTORY':
        this.shabadSource = ShabadSource.History;
        break;
      case 'FAVORITES':
        this.shabadSource = ShabadSource.Favorites;
        break;
      default:
        this.shabadSource = ShabadSource.None;
    }
  }

  onToggleVishraam() {
    if(!this.showVishraam) {
      this.selectedShabad = visraamToVishraamArray(this.selectedShabad);
    }
    else {
      this.selectedShabad?.forEach(verse => {
        verse.VishramArray = null;
      });
    }
  }

  closePanel() {
    this.selectedShabad = null;
    this.showSearchPanel = true;
  }

  onTranscriptChange(text: string) {
    if (text && text.trim().length > 2) {
      console.log("Transcript received:", text);
      this.searchQuery = text;
      var searchInitials = SpeechHelper.getInitialsFromGurmukhi(text); 
      this.searchText = searchInitials;
      this.searchOnRecord();
    }
  }

  async searchOnRecord(){
    var query: string;
     let asciiSearch = '';
    for (const c of this.searchText) {
      const str = c.charCodeAt(0).toString().padStart(3, '0');
      asciiSearch += str + ',';
    }

    query = Queries.searchByFirstLetter(asciiSearch, this.searchMode, '');

    try {
      const results = await this.dbService.query(query);
      this.filteredItems = mapResultsToVerseSearchResults(results);
      this.noResults = this.filteredItems.length === 0;
      if(this.filteredItems.length === 1){
        this.onSelectItem(this.filteredItems[0], "SEARCH");
      }
    } catch (error) {
      console.error('Error querying the DB:', error);
      this.filteredItems = [];
      this.noResults = true;
    }
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
  presentationGurmukhiFontSize: number = 5;

  getPresentationHtml(verse: Verse): string {
    // Use the current theme's background color for the popup
    let bgColor = "#121212";
    let textColor = "#fff";
    if (this.theme === "navy") {
      bgColor = "#1a2238";
      textColor = "#eaf6fb";
    } else if (this.theme === "blueorange") {
      bgColor = "#003F66";
      textColor = "#eaf6fb";
    } 
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
          background: ${bgColor};
          color: ${textColor};
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
          color: ${textColor};
          text-align: center;
        }
        .translation-english {
          font-size: ${this.englishFontSize + 2}rem;
          color: #fadd7b;
          margin-bottom: 1rem;
          text-align: center;
        }
        .translation-punjabi {
          font-family: 'Gurakhar', sans-serif;
          font-size: ${this.punjabiFontSize + 2}rem;
          margin-bottom: 1rem;
          text-align: center;
          color: #8ecae6;
        }
        .translation-english.transliteration {
          color: #b0b0b0;
          font-size: ${this.transliterationFontSize + 2}rem;
          text-align: center;
        }
        .v{
          color: #f97b4d;
        }
        .y {
          color: #1f991f;
        }
      </style>
    </head>
    <body>
      ${this.showGurmukhi ? `<div class="verse-text">${verse.GurmukhiHtml || ''}</div>` : ''}
      ${this.showEnglish && verse.English ? `<div class="translation-english">${verse.English}</div>` : ''}
      ${this.showPunjabi && verse.Punjabi ? `<div class="translation-punjabi">${verse.Punjabi}</div>` : ''}
      ${this.showTransliteration && verse.Transliteration ? `<div class="translation-english transliteration">${verse.Transliteration}</div>` : ''}
      <script>
        // No escaping needed, innerHTML is used directly in document.write
      </script>
    </body>
    </html>
  `;
  }

  getVishraamClass(vishraamArray: any[], wi: number): string | null {
    const v = vishraamArray?.find(x => x.p === wi);
    if (!v) return null;
    return (v.t && v.t.toLowerCase() === 'v') ? 'main-vishram' : 'secondary-vishram';
  }

  //#endregion

  //#region Theme management
  setTheme(theme: string) {
    const oldTheme = this.theme;
    this.theme = theme;
    const root = document.documentElement;
    root.classList.remove(`theme-${oldTheme}`);
    root.classList.add(`theme-${theme}`);

    // Add more themes here as needed
  }

  // Save theme selection
  onThemeChange(theme: string) {
    this.setTheme(theme);
    localStorage.setItem('kpoth-theme', theme);
    this.closeSidePanel();
  }
  //#endregion

  //#region Ang Search Modal
  showAngModal: boolean = false;
  angInputValue: number | null = null;

  angSources = [
    { value: 'G', label: 'ਸ੍ਰੀ ਗੁਰੂ ਗ੍ਰੰਥ ਸਾਹਿਬ ਜੀ' },
    { value: 'D', label: 'ਦਸਮ ਬਾਣੀ' },
    { value: 'B', label: 'ਭਾਈ ਗੁਰਦਾਸ ਜੀ ਵਾਰਾਂ' },
    { value: 'N', label: 'ਭਾਈ ਨੰਦ ਲਾਲ ਜੀ ਵਾਰਾਂ' },
    { value: 'A', label: 'ਅੰਮ੍ਰਿਤ ਕੀਰਤਨ' },
    { value: 'S', label: 'ਭਾਈ ਗੁਰਦਾਸ ਸਿੰਘ ਜੀ ਵਾਰਾਂ' },
    { value: 'R', label: 'ਰਹਿਤਨਾਮੇ ਅਤੇ ਪੰਥਕ ਲਿਖ਼ਤਾਂ' }
  ];
  angSourceValue: string = 'G';

  onSearchModeChange(mode: string) {
    if (mode === 'ang') {
      this.showAngModal = true;
      this.angInputValue = null;
      this.angSourceValue = this.angSources[0].value;
    } else {
      this.showAngModal = false;
    }
  }

  closeAngModal() {
    this.showAngModal = false;
    this.angInputValue = null;
    if (this.searchMode === 'ang') {
      this.searchMode = 'anywhere';
    }
  }

  async openAng() {
    if (this.angInputValue && Number.isInteger(this.angInputValue) && this.angInputValue > 0) {
      this.showAngModal = false;
      // Query for all verses on this Ang/PageNo and Source
      const query = Queries.getAngByAngNo(this.angInputValue, this.angSourceValue);
      const results = await this.dbService.query(query);
      this.filteredItems = mapResultsToVerse(results);
      this.setSelectedShabad(this.filteredItems[0], this.filteredItems);
    }
    this.searchMode = 'anywhere';
  }
  //#endregion

  //#region Header pinning
  onPinHeaderChange() {
    localStorage.setItem('kpoth-pin-header', this.pinHeader ? 'true' : 'false');
    this.applyPinHeader();
  }

  applyPinHeader() {
    const header = document.querySelector('header.header') as HTMLElement;
    if (header) {
      if (this.pinHeader) {
        header.style.position = 'sticky';
        header.style.top = '0';
        header.style.zIndex = '100';
      } else {
        header.style.position = 'relative';
        header.style.top = '';
        header.style.zIndex = '';
      }
    }
  }

  scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  //#endregion

  moveShabad(moveBy: number) {
    const currentId = this.selectedItem?.ShabadID;
    if (!currentId || currentId <= 1) {
      this.showRoastMessageFn('No previous shabad');
      return;
    }
    const targetId = currentId + moveBy;
    // Reuse existing logic to open a specific shabad id (keeps routing consistent)
    this.openRandomShabad(targetId);
  }

  onCopyVerse(e: ClipboardEvent, verse: Verse) {
    const text = verse?.GurmukhiUni || '';
    try {
      if (e && e.clipboardData) {
        e.clipboardData.setData('text/plain', text);
        e.preventDefault();
        this.showRoastMessageFn('Selected line copied');
        return;
      }
      // Fallback for environments without clipboardData on event
      navigator.clipboard.writeText(text).then(() => {
        this.showRoastMessageFn('Selected line copied');
      }).catch(() => {
        this.showRoastMessageFn('Copy failed');
      });
    } catch {
      this.showRoastMessageFn('Copy failed');
    }
  }

  copyShabadToClipboard() {
    if (!this.selectedShabad || this.selectedShabad.length === 0) {
      this.showRoastMessageFn('No shabad selected');
      return;
    }
    const text = this.selectedShabad
      .map(v => v.GurmukhiUni?.trim() ?? '')
      .filter(x => x.length > 0)
      .join('\n');
    if (!text) {
      this.showRoastMessageFn('Nothing to copy');
      return;
    }
    // Try async clipboard API first
    navigator.clipboard.writeText(text).then(() => {
      this.showRoastMessageFn('Shabad copied');
    }).catch(() => {
      try {
        const ta = document.createElement('textarea');
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.showRoastMessageFn('Shabad copied');
      } catch {
        this.showRoastMessageFn('Copy failed');
      }
    });
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardShortcut(event: KeyboardEvent) {
    // Ctrl + Shift + F to add to favorites
    if (event.ctrlKey && event.shiftKey && event.key === 'F') {
      event.preventDefault();
      this.addToFavorites();
    }
    // Ctrl + Shift + D to focus search bar
    if (event.ctrlKey && event.shiftKey && event.key === 'D') {
      event.preventDefault();
      const searchInput = document.getElementById('searchText') as HTMLInputElement;
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  }
}
