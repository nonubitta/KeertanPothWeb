import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-support',
  imports: [CommonModule, RouterModule],
  templateUrl: './support.html',
  styleUrl: './support.scss'
})
export class Support implements OnInit {
  // Configure these as needed
  appStoreUrl: string = '';
  supportEmail: string = '';

  webVersion: number | null = null;

  get mailtoLink(): string {
    if (!this.supportEmail) return '';
    const subject = encodeURIComponent('Keertan Pothi Support');
    const body = encodeURIComponent('Please describe your issue and steps to reproduce.');
    return `mailto:${this.supportEmail}?subject=${subject}&body=${body}`;
  }

  async ngOnInit(): Promise<void> {
    try {
      const res = await fetch('assets/api/version.json');
      if (res.ok) {
        const json = await res.json();
        this.webVersion = json?.currentVersion ?? null;
      }
    } catch {
      // ignore fetch errors
    }
  }
}
