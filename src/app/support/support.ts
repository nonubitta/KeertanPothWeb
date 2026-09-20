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

  // App store links
  appStoreUrl =
    'https://apps.apple.com/be/app/keertan-pothi/id1538493887';

  playStoreUrl =
    'https://play.google.com/store/apps/details?id=keertan_Pothi.keertan_Pothi&hl=en_US';

  // Support
  supportEmail = 'keertanpothi@gmail.com';

  webVersion: number | null = null;

  get mailtoLink(): string {
    if (!this.supportEmail) {
      return '';
    }

    const subject = encodeURIComponent('Keertan Pothi Support');

    const body = encodeURIComponent(
      'Please describe your issue and steps to reproduce.'
    );

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
      // Ignore version fetch errors.
    }
  }
}