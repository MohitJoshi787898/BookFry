import React from 'react';
import type { Metadata } from 'next';
import { API_BASE_URL } from '@/lib/api-client';
import { Book } from '@bookmarket/types';
import { RoleEmptyState } from '@/components/shared/role-empty-state';
import { BookDetailClientView } from '@/components/shop/book-detail-client-view';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getBook(slug: string): Promise<Book | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/books/${slug}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.success && json.data ? json.data : null;
  } catch (error) {
    console.error(`[SSR getBook] Failed to fetch book ${slug}:`, error);
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    return {
      title: 'Book Not Found • BookFry',
      description: 'The requested textbook listing might have been moved or sold out.',
      robots: { index: false, follow: false },
    };
  }

  const categoryName =
    typeof book.category === 'object' && book.category !== null
      ? (book.category as { name?: string }).name
      : (book.category as string) || 'Textbooks';

  const authorText = book.author ? `by ${book.author}` : '';
  const metaTitle = `${book.title} ${authorText} • Buy & Sell on BookFry`;
  const metaDesc =
    book.description && book.description.length > 20
      ? book.description.slice(0, 155) + '...'
      : `Buy ${book.title} ${authorText}. Verified student copies, campus escrow protection, and peer delivery on BookFry.`;

  const coverImage =
    book.images && book.images.length > 0
      ? typeof book.images[0] === 'string'
        ? book.images[0]
        : (book.images[0] as { url?: string })?.url || '/assets/bookfry/og-image.png'
      : '/assets/bookfry/og-image.png';

  const canonical = `/books/${book.slug || slug}`;

  return {
    title: metaTitle,
    description: metaDesc,
    keywords: ([
      book.title,
      book.author,
      categoryName,
      book.isbn || '',
      'used textbooks',
      'college books India',
      'student book exchange',
      'second hand books',
    ].filter(Boolean) as string[]),
    alternates: {
      canonical,
    },
    openGraph: {
      title: metaTitle,
      description: metaDesc,
      type: 'book',
      url: canonical,
      siteName: 'BookFry',
      images: [
        {
          url: coverImage,
          width: 800,
          height: 1200,
          alt: `${book.title} Cover`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: metaTitle,
      description: metaDesc,
      images: [coverImage],
    },
  };
}

export default async function BookDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const book = await getBook(slug);

  if (!book) {
    return (
      <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12">
        <RoleEmptyState
          title="Book Not Found"
          description="The requested textbook listing might have been moved, sold out, or expired."
          mascotVariant="pointing"
          action={{ label: 'Explore Books', href: '/books' }}
        />
      </main>
    );
  }

  return <BookDetailClientView initialBook={book} slug={slug} />;
}


