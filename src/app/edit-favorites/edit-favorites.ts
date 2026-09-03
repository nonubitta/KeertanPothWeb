import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VerseSearchResult } from '../verse.model';

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
    a.download = 'favorites_export.txt';
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
}
