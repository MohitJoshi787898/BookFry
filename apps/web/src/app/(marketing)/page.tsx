import React, { cache } from "react";
import { Metadata } from "next";
import {
  SectionRenderer,
  SectionData,
} from "@/components/marketing/section-renderer";
import { OrganizationJsonLd, WebsiteJsonLd } from "@/components/seo/json-ld";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  (process.env.NODE_ENV === "development"
    ? "http://localhost:5000/api/v1"
    : "https://bookfry.onrender.com/api/v1");

export interface LandingPageResponse {
  seo?: {
    title?: string;
    description?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    canonicalUrl?: string;
  };
  announcement?: {
    text: string;
    enabled: boolean;
    link?: string;
  };
  sections: SectionData[];
}

const DEFAULT_SECTIONS: SectionData[] = [
  {
    sectionId: 'hero_main',
    type: 'hero',
    title: "Books you love. Deals you'll adore.",
    subtitle: 'Buy, sell, and discover verified new & used textbooks at unbeatable prices across India.',
    enabled: true,
    order: 0,
    content: {
      eyebrow: 'क्योंकि.. पढ़ाई रुकनी नहीं चाहिए',
      highlightText: 'adore.',
      primaryCtaLabel: 'Buy Books',
      primaryCtaUrl: '/books',
      secondaryCtaLabel: 'Sell Your Books',
      secondaryCtaUrl: '/sell',
      image: '/fox_reading_178491148655455.png',
      escrowBadge: 'Direct Peer-to-Peer Campus Escrow',
      searchHeading: 'Search Millions of Verified Textbooks & Novels',
      searchSubheading: 'Instant Book Finder',
      searchPlaceholder: 'Search Engineering, NEET, UPSC, Novels, or ISBN...',
      searchButtonLabel: 'Search Catalog',
      discountBadge: 'Up to 80% Off Retail Prices',
    },
  },
  {
    sectionId: 'features_bar',
    type: 'features',
    title: 'BookFry Value Propositions',
    subtitle: 'Why thousands of Indian students trust BookFry',
    enabled: true,
    order: 1,
    content: {
      items: [
        { title: 'Up to 80% Off', description: 'On New & Verified Used Textbooks', badge: 'Best Value' },
        { title: 'Express Delivery', description: 'Free Shipping across India over ₹499', badge: 'Pan-India' },
        { title: '100% Quality Checked', description: 'Verified Sellers & Escrow Guarantee', badge: 'Student Safe' },
        { title: '7-Day Easy Returns', description: 'Instant Refunds & Replacement Support', badge: 'Hassle-Free' },
      ],
    },
  },
  {
    sectionId: 'quick_filter_bar',
    type: 'quick_filter',
    title: 'Quick Filter Bar',
    subtitle: 'Browse by subject',
    enabled: true,
    order: 2,
    content: {},
  },
  {
    sectionId: 'trending_reads',
    type: 'book_carousel',
    title: 'Trending Reads',
    subtitle: 'Real-time popular velocity based on student activity & study demands',
    enabled: true,
    order: 3,
    content: {
      eyebrow: 'Trending Velocity',
      selectionStrategy: 'trending',
      limit: 12,
      seeAllUrl: '/books?sort=viewsCount',
    },
  },
  {
    sectionId: 'knowledge_story',
    type: 'knowledge_story',
    title: 'Exchange Knowledge & Keep Books Circulating',
    subtitle: 'Pass down study notes & textbooks to junior batches across India',
    enabled: true,
    order: 4,
    content: {
      eyebrow: 'PEER-TO-PEER STUDENT MARKETPLACE',
      primaryCtaLabel: 'LIST YOUR BOOK NOW',
      primaryCtaUrl: '/sell',
      secondaryCtaLabel: 'BROWSE PRE-OWNED BOOKS',
      secondaryCtaUrl: '/books',
    },
  },
  {
    sectionId: 'why_bookfry',
    type: 'why_bookfry',
    title: 'Why Students & Book Lovers Choose BookFry',
    subtitle: 'India\'s safest, most affordable marketplace for new & used books.',
    enabled: true,
    order: 5,
    content: {},
  },
  {
    sectionId: 'reading_journey_cta',
    type: 'cta',
    title: 'Ready to Start Your Reading Journey?',
    subtitle: 'Join over 50,000 students buying, selling, and circulating textbooks across India.',
    enabled: true,
    order: 6,
    content: {},
  },
  {
    sectionId: 'faq_section',
    type: 'faq',
    title: 'Frequently Asked Questions',
    subtitle: 'Everything you need to know about buying and selling on BookFry',
    enabled: true,
    order: 7,
    content: {},
  },
  {
    sectionId: 'newsletter_section',
    type: 'newsletter',
    title: 'Never Miss a Campus Book Drop',
    subtitle: 'Get curated deals, syllabus discount alerts, and exam prep recommendations in your inbox.',
    enabled: true,
    order: 8,
    content: {},
  },
];

const getLandingData = cache(async (): Promise<LandingPageResponse | null> => {
  try {
    const res = await fetch(`${API_BASE_URL}/landing`, {
      next: { tags: ["landing-page"], revalidate: 60 },
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data || null;
  } catch {
    // Graceful fallback to default landing sections when API is offline or cold-starting
    return null;
  }
});

export async function generateMetadata(): Promise<Metadata> {
  const data = await getLandingData();
  const seo = data?.seo || {};

  const title =
    seo.title || "BookFry • India's Book Marketplace | Buy & Sell Books";
  const description =
    seo.description ||
    "Buy, sell, and discover verified new & used textbooks, entrance exam guides, and novels across India. Save up to 80% with secure student escrow.";
  const ogTitle = seo.ogTitle || title;
  const ogDescription = seo.ogDescription || description;
  const ogImage = seo.ogImage || "/og-image.png";
  const canonicalUrl = seo.canonicalUrl || "https://bookfry.in";

  return {
    title,
    description,
    keywords: seo.keywords || ["BookFry", "buy books India", "sell textbooks"],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      images: [{ url: ogImage }],
      type: "website",
      siteName: "BookFry",
    },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: ogDescription,
      images: [ogImage],
    },
  };
}

export default async function LandingPage() {
  const data = await getLandingData();
  const sections = data?.sections && data.sections.length > 0 ? data.sections : DEFAULT_SECTIONS;

  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      {/* Main Dynamic Server-Rendered Sections */}
      <main className="flex-grow">
        <SectionRenderer sections={sections} />
      </main>
    </>
  );
}

