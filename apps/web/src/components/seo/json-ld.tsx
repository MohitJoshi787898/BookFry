import React from 'react';
import { Book } from '@bookmarket/types';

interface BookJsonLdProps {
  book: Book;
  url: string;
}

export function BookJsonLd({ book, url }: BookJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Book',
    '@id': url,
    url: url,
    name: book.title,
    author: {
      '@type': 'Person',
      name: book.author,
    },
    isbn: book.isbn,
    description: book.description,
    inLanguage: book.language || 'English',
    publisher: {
      '@type': 'Organization',
      name: book.publisher || 'BookFry Marketplace',
    },
    offers: {
      '@type': 'Offer',
      price: book.price.toFixed(2),
      priceCurrency: 'INR',
      availability: book.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      itemCondition:
        book.condition === 'new'
          ? 'https://schema.org/NewCondition'
          : 'https://schema.org/UsedCondition',
    },
    ...(book.images?.[0]?.url && { image: book.images[0].url }),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

interface BreadcrumbJsonLdProps {
  items: Array<{ name: string; item: string }>;
}

export function BreadcrumbJsonLd({ items }: BreadcrumbJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'BookFry',
    url: 'https://bookfry.in',
    logo: 'https://bookfry.in/logo.png',
    slogan: 'क्योंकि.. पढ़ाई रुकनी नहीं चाहिए',
    description: "India's premier digital marketplace for buying, selling, and exchanging new and used books.",
    sameAs: [
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

export function WebsiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'BookFry',
    url: 'https://bookfry.in',
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://bookfry.in/books?search={search_term_string}',
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

