import React, { cache } from "react";
import { Metadata } from "next";
import { Navbar } from "@/components/shared/navbar";
import { Footer } from "@/components/shared/footer";
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
  const sections = data?.sections || [];

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary transition-colors duration-200">
      <OrganizationJsonLd />
      <WebsiteJsonLd />

      {/* Top Announcement Bar from CMS */}
      {/* {announcement?.enabled && announcement.text && (
        <AnnouncementBar text={announcement.text} link={announcement.link} />
      )} */}

      {/* Sticky Header Navigation */}
      <Navbar />

      {/* Main Dynamic Server-Rendered Sections */}
      <main className="flex-grow">
        <SectionRenderer sections={sections} />
      </main>

      {/* Footer with Brand Slogan */}
      <Footer />
    </div>
  );
}
