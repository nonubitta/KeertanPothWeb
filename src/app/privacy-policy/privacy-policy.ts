import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-privacy-policy',
  imports: [CommonModule, RouterModule],
  templateUrl: './privacy-policy.html',
  styleUrl: './privacy-policy.scss'
})
export class PrivacyPolicy {
  effectiveDate: string = 'February 8, 2026';
  contactEmail: string = ''; // Configure your contact email here
}
