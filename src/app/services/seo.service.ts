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
    url: string = 'https://keertanpothi.org/'
  ) {

    this.title.setTitle(title);

    this.meta.updateTag({
      name: 'description',
      content: description
    });

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
      name: 'twitter:title',
      content: title
    });

    this.meta.updateTag({
      name: 'twitter:description',
      content: description
    });

    this.meta.updateTag({
      rel: 'canonical',
      href: url
    });
  }
}