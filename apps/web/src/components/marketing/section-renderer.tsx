import React from 'react';
import { HeroSection } from './hero-section';
import { FeaturesBar } from './features-bar';
import { QuickFilterBar } from './quick-filter-bar';
import { BookCarousel } from './book-carousel';
import { ExchangeKnowledgeSection } from './exchange-knowledge-section';
import { CategoryGrid } from './category-grid';
import { WhyBookFrySection } from './why-bookfry-section';
import { TestimonialsSection } from './testimonials-section';
import { ReadingJourneyCTA } from './reading-journey-cta';
import { NewsletterSection } from './newsletter-section';
import { FAQSection } from './faq-section';
import { PromotionalBannerSection } from './promotional-banner-section';

export interface SectionData {
  _id?: string;
  sectionId: string;
  type: string;
  title: string;
  subtitle?: string;
  enabled: boolean;
  order: number;
  content: Record<string, unknown>;
}

export interface SectionRendererProps {
  sections: SectionData[];
}

export function SectionRenderer({ sections }: SectionRendererProps) {
  if (!sections || sections.length === 0) return null;

  return (
    <>
      {sections.map((section) => {
        if (!section.enabled) return null;
        const key = section._id || section.sectionId;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const content = (section.content || {}) as Record<string, any>;

        switch (section.type) {
          case 'hero':
            return (
              <HeroSection
                key={key}
                eyebrow={content.eyebrow}
                title={section.title || content.title}
                highlightText={content.highlightText}
                subtitle={section.subtitle || content.subtitle}
                primaryCtaLabel={content.primaryCtaLabel}
                primaryCtaUrl={content.primaryCtaUrl}
                secondaryCtaLabel={content.secondaryCtaLabel}
                secondaryCtaUrl={content.secondaryCtaUrl}
                image={content.image}
                escrowBadge={content.escrowBadge}
                searchHeading={content.searchHeading}
                searchSubheading={content.searchSubheading}
                searchPlaceholder={content.searchPlaceholder}
                searchButtonLabel={content.searchButtonLabel}
                discountBadge={content.discountBadge}
                popularSearchesLabel={content.popularSearchesLabel}
                quickTags={content.quickTags}
                stats={content.stats}
              />
            );

          case 'features':
            return (
              <FeaturesBar
                key={key}
                title={section.title}
                subtitle={section.subtitle}
                items={content.items}
              />
            );

          case 'quick_filter':
            return (
              <QuickFilterBar
                key={key}
              />
            );

          case 'book_carousel':
            return (
              <BookCarousel
                key={key}
                title={section.title}
                eyebrow={content.eyebrow}
                subtitle={section.subtitle}
                initialBooks={content.books}
                href={content.seeAllUrl || '/books'}
                tintBackground={!!content.tintBackground}
              />
            );

          case 'knowledge_story':
            return (
              <ExchangeKnowledgeSection
                key={key}
                eyebrow={content.eyebrow}
                title={section.title || content.title}
                subtitle={section.subtitle || content.subtitle}
                steps={content.steps}
                primaryCtaLabel={content.primaryCtaLabel}
                primaryCtaUrl={content.primaryCtaUrl}
                secondaryCtaLabel={content.secondaryCtaLabel}
                secondaryCtaUrl={content.secondaryCtaUrl}
                savePercentText={content.savePercentText}
                savePercentSubtext={content.savePercentSubtext}
                earnPercentText={content.earnPercentText}
                earnPercentSubtext={content.earnPercentSubtext}
                ecoText={content.ecoText}
                ecoSubtext={content.ecoSubtext}
              />
            );

          case 'category_grid':
            return (
              <CategoryGrid
                key={key}
                eyebrow={content.eyebrow}
                title={section.title || content.title}
                seeAllLabel={content.seeAllLabel}
                seeAllUrl={content.seeAllUrl}
                categories={content.categories}
              />
            );

          case 'why_us':
            return (
              <WhyBookFrySection
                key={key}
                eyebrow={content.eyebrow}
                title={section.title || content.title}
                subtitle={section.subtitle || content.subtitle}
                pillars={content.pillars}
                ecoTag={content.ecoTag}
                sloganQuote={content.sloganQuote}
                treesSavedValue={content.treesSavedValue}
                treesSavedDesc={content.treesSavedDesc}
                verifiedGuaranteeLabel={content.verifiedGuaranteeLabel}
              />
            );

          case 'testimonials':
            return (
              <TestimonialsSection
                key={key}
                eyebrow={content.eyebrow}
                title={section.title || content.title}
                subtitle={section.subtitle || content.subtitle}
                items={content.items}
              />
            );

          case 'cta':
            return (
              <ReadingJourneyCTA
                key={key}
                eyebrow={content.eyebrow}
                title={section.title || content.title}
                subtitle={section.subtitle || content.subtitle}
                slogan={content.slogan}
                primaryCtaLabel={content.primaryCtaLabel}
                primaryCtaUrl={content.primaryCtaUrl}
                secondaryCtaLabel={content.secondaryCtaLabel}
                secondaryCtaUrl={content.secondaryCtaUrl}
                image={content.image}
                ratingTitle={content.ratingTitle}
                ratingSubtext={content.ratingSubtext}
              />
            );

          case 'newsletter':
            return (
              <NewsletterSection
                key={key}
                eyebrow={content.eyebrow}
                title={section.title || content.title}
                subtitle={section.subtitle || content.subtitle}
                inputPlaceholder={content.inputPlaceholder}
                buttonLabel={content.buttonLabel}
                disclaimer={content.disclaimer}
                subscribedStat={content.subscribedStat}
                successTitle={content.successTitle}
                successMessage={content.successMessage}
              />
            );

          case 'faq':
            return (
              <FAQSection
                key={key}
                title={section.title}
                subtitle={section.subtitle}
                faqs={content.faqs}
              />
            );

          case 'banner':
            return (
              <PromotionalBannerSection
                key={key}
                title={section.title}
                subtitle={section.subtitle}
                eyebrow={content.eyebrow}
                ctaLabel={content.ctaLabel}
                ctaUrl={content.ctaUrl}
                badge={content.badge}
                image={content.image}
              />
            );

          default:
            return null;
        }
      })}
    </>
  );
}

export default SectionRenderer;
