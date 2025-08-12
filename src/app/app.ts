import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from './db.service';  // Your existing service handling sql.js
import { Verse, VerseSearchResult } from './verse.model';
import { visraamToVishraamArray, mapResultsToVerse, mapResultsToVerseSearchResults, mapVerseToVerseSearchResults } from './utils';
import { Queries } from './Queries';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './app.html',
})

export class App  {

}