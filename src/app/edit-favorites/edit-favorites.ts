import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { RouterModule } from '@angular/router';
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
  imports: [CommonModule, DragDropModule, RouterModule],
  templateUrl: './edit-favorites.html',
  styleUrl: './edit-favorites.scss',
  standalone: true
})
export class EditFavorites implements OnInit {
  /** Local storage key used throughout the app for favorites. */
  private readonly FAVORITES_KEY = 'kpoth-favorites';

  /** Array of favorite verses displayed in the UI. */
  favorites: VerseSearchResult[] = [];

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
}
