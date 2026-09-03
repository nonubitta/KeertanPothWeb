import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VerseSearchResult, Verse } from '../verse.model';
import { DbService } from '../db.service';
import { Queries } from '../Queries';
import { mapResultsToVerse } from '../utils';

/**
 * Component for editing the list of favorite verses.
 * It loads the favorites from localStorage (key: 'kpoth-favorites')
 * and allows the user to reorder them via drag‑and‑drop. The new order
 * is persisted back to localStorage.
 */
@Component({
  selector: 'app-edit-favorites',
  // Import Angular common directives and CDK drag‑drop module for this standalone component.
  imports: [CommonModule, DragDropModule, RouterModule, FormsModule],
  templateUrl: './edit-favorites.html',
  styleUrl: './edit-favorites.scss',
  standalone: true
})
export class EditFavorites implements OnInit {
  /** Local storage key used throughout the app for favorites. */
  private readonly FAVORITES_KEY = 'kpoth-favorites';

  /** Array of favorite verses displayed in the UI. */
  favorites: VerseSearchResult[] = [];

  /** User-provided Chhakka value for export. */
  chhakka: string = '';

  /** Flag to show Chhakka validation error. */
  showChhakkaError: boolean = false;

  /** Currently selected shabad verses for display on the right panel. */
  selectedShabad: Verse[] = [];

  /** Loading state for shabad fetch. */
  isLoadingShabad: boolean = false;

  /** Error message for shabad fetch. */
  shabadError: string = '';

  /** Index of the favorite that was clicked to open the shabad. */
  selectedFavoriteIndex: number = -1;

  /** Currently selected verse index in the right panel (for highlighting). */
  selectedVerseIndex: number = -1;

  private dbService = inject(DbService);

  ngOnInit(): void {
    const stored = localStorage.getItem(this.FAVORITES_KEY);
    if (stored) {
      try {
        this.favorites = JSON.parse(stored) as VerseSearchResult[];
      } catch {
        this.favorites = [];
      }
    }
  }

  /**
   * Handles the drop event from the CDK drag‑drop list.
   * Reorders the local array and persists the new order.
   */
  onDrop(event: CdkDragDrop<VerseSearchResult[]>): void {
    moveItemInArray(this.favorites, event.previousIndex, event.currentIndex);
    // Persist the reordered list.
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
  }

  /** Export all favorites to a text file with INSERT statements. */
  exportFavorites(): void {
    if (!this.favorites || this.favorites.length === 0) {
      return;
    }
    
    // Validate Chhakka is not empty
    if (!this.chhakka || this.chhakka.trim() === '') {
      this.showChhakkaError = true;
      return;
    }
    
    // Clear error if validation passes
    this.showChhakkaError = false;

    const lines = this.favorites.map((fav, idx) => {
      const verseId = fav.VerseID ?? 0;
      const shabadId = fav.ShabadID ?? 0;
      const sortOrder = (idx + 1) * 10;
      const escapedChhakka = this.chhakka.replace(/'/g, "''");
      return `INSERT INTO AsaDiVaarShabads (VerseID, ShabadID, Source, Chhakka, SortOrder) VALUES (${verseId}, ${shabadId}, 'B', '${escapedChhakka}', ${sortOrder});`;
    }).join('\n');

    const blob = new Blob([lines], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.chhakka}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /** Removes a favorite at the given index and persists the change. */
  removeFavorite(index: number): void {
    if (index >= 0 && index < this.favorites.length) {
      this.favorites.splice(index, 1);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
    }
  }

  /** Moves the favorite at the given index to the top of the list. */
  moveToTop(index: number): void {
    if (index > 0 && index < this.favorites.length) {
      const [item] = this.favorites.splice(index, 1);
      this.favorites.unshift(item);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
    }
  }

  /** Moves the favorite at the given index to the bottom of the list. */
  moveToBottom(index: number): void {
    if (index >= 0 && index < this.favorites.length - 1) {
      const [item] = this.favorites.splice(index, 1);
      this.favorites.push(item);
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
    }
  }

  /** Opens the shabad for the given favorite in the right panel. */
  async openShabad(fav: VerseSearchResult, index: number): Promise<void> {
    if (!fav.ShabadID) {
      this.shabadError = 'No ShabadID available for this favorite.';
      this.selectedShabad = [];
      return;
    }

    // Track which favorite was clicked
    this.selectedFavoriteIndex = index;
    this.selectedVerseIndex = -1;

    this.isLoadingShabad = true;
    this.shabadError = '';
    this.selectedShabad = [];

    try {
      // Ensure database is initialized
      await this.dbService.initDb();
      
      const query = Queries.getShabadById(fav.ShabadID);
      const results = this.dbService.query(query);
      
      if (results && results.length > 0) {
        // Map all verses of the shabad
        this.selectedShabad = mapResultsToVerse(results, true);
      } else {
        this.shabadError = 'Shabad not found.';
      }
    } catch (error) {
      console.error('Error fetching shabad:', error);
      this.shabadError = 'Failed to load shabad. Please try again.';
    } finally {
      this.isLoadingShabad = false;
    }
  }

  /** Handles verse selection in the right panel - updates the favorite's VerseID and content. */
  selectVerse(verse: Verse, verseIndex: number): void {
    if (this.selectedFavoriteIndex < 0 || this.selectedFavoriteIndex >= this.favorites.length) {
      return;
    }

    // Update the favorite with the selected verse's data (only fields that exist in VerseSearchResult)
    const favorite = this.favorites[this.selectedFavoriteIndex];
    favorite.VerseID = verse.ID;
    favorite.ID = verse.ID;
    favorite.Gurmukhi = verse.Gurmukhi;
    favorite.GurmukhiUni = verse.GurmukhiUni;
    favorite.Punjabi = verse.Punjabi;
    favorite.WriterID = verse.WriterID;
    favorite.WriterEnglish = verse.WriterEnglish;
    favorite.RaagID = verse.RaagID;
    favorite.RaagEnglish = verse.RaagEnglish;
    favorite.PageNo = verse.PageNo;
    favorite.SourceID = verse.SourceID;
    favorite.SourceEnglish = verse.SourceEnglish;
    
    // Persist the change
    localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(this.favorites));
    
    // Highlight the selected verse
    this.selectedVerseIndex = verseIndex;
  }

  /** Clears the selected shabad from the right panel. */
  clearShabad(): void {
    this.selectedShabad = [];
    this.shabadError = '';
    this.selectedFavoriteIndex = -1;
    this.selectedVerseIndex = -1;
  }
}
