import { Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class SeoService {

  constructor(
    private title: Title,
    private meta: Meta
  ) {}

  update(
    title: string,
    description: string,
    url: string,
    image: string = 'https://keertanpothi.org/assets/images/favicon.png'
  ) {

    this.title.setTitle(title);

    // Standard SEO
    this.meta.updateTag({
      name: 'description',
      content: description
    });

    // Open Graph
    this.meta.updateTag({
      property: 'og:title',
      content: title
    });

    this.meta.updateTag({
      property: 'og:description',
      content: description
    });

    this.meta.updateTag({
      property: 'og:url',
      content: url
    });

    this.meta.updateTag({
      property: 'og:image',
      content: image
    });

    // Twitter
    this.meta.updateTag({
      name: 'twitter:title',
      content: title
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: description
    });

    this.meta.updateTag({
      name: 'twitter:image',
      content: image
    });

    // Canonical
    let canonical = document.querySelector(
      'link[rel="canonical"]'
    ) as HTMLLinkElement | null;

    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }

    canonical.href = url;
  }

  setStructuredData(data: object) {

    const existing = document.getElementById('structured-data');

    if (existing) {
      existing.remove();
    }

    const script = document.createElement('script');

    script.type = 'application/ld+json';

    script.id = 'structured-data';

    script.text = JSON.stringify(data);

    document.head.appendChild(script);
  }

}