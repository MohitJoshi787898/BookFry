import { LandingSectionRepository } from './landing.repository';
import { ILandingSectionDocument } from '../../models/landing-section.model';
import { BookListingModel } from '../../models/book-listing.model';
import { BookCatalogModel } from '../../models/book-catalog.model';
import { CmsModel } from '../../models/cms.model';
import { getRedisClient } from '../../config/redis';
import { logger } from '../../utils/logger';

const LANDING_CACHE_KEY = 'landing:public_data';
const LANDING_CACHE_TTL = 3600; // 1 hour TTL in seconds

export class LandingService {
  private repo: LandingSectionRepository;

  constructor() {
    this.repo = new LandingSectionRepository();
  }

  /** Auto-seed default landing page sections if empty */
  async ensureDefaultSectionsExist(): Promise<void> {
    const existing = await this.repo.findAllSections();
    if (existing.length > 0) return;

    const defaults: Partial<ILandingSectionDocument>[] = [
      {
        sectionId: 'hero_main',
        type: 'hero',
        title: 'Books you love. Deals you\'ll adore.',
        subtitle: 'Buy, sell, and discover verified new & used textbooks at unbeatable prices across India.',
        enabled: true,
        order: 0,
        status: 'published',
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
          quickTags: [
            { label: 'Engineering', href: '/books?category=engineering' },
            { label: 'NEET Books', href: '/books?search=NEET' },
            { label: 'JEE Main', href: '/books?search=JEE' },
            { label: 'Class 12', href: '/books?search=Class+12' },
            { label: 'CA Books', href: '/books?search=CA' },
            { label: 'UPSC', href: '/books?search=UPSC' },
            { label: 'Novels', href: '/books?category=fiction' },
          ],
          stats: [
            { value: '50,000+', label: 'Books listed' },
            { value: '₹1.2Cr+', label: 'Student savings' },
            { value: '99.4%', label: 'Quality verified' },
          ],
        },
      },
      {
        sectionId: 'features_bar',
        type: 'features',
        title: 'BookFry Value Propositions',
        subtitle: 'Why thousands of Indian students trust BookFry',
        enabled: true,
        order: 1,
        status: 'published',
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
        status: 'published',
        content: {},
      },
      {
        sectionId: 'trending_reads',
        type: 'book_carousel',
        title: 'Trending Reads',
        subtitle: 'Real-time popular velocity based on student activity & study demands',
        enabled: true,
        order: 3,
        status: 'published',
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
        status: 'published',
        content: {
          eyebrow: 'PEER-TO-PEER STUDENT MARKETPLACE',
          primaryCtaLabel: 'LIST YOUR BOOK NOW',
          primaryCtaUrl: '/sell',
          secondaryCtaLabel: 'BROWSE PRE-OWNED BOOKS',
          secondaryCtaUrl: '/books',
          steps: [
            {
              stepNumber: '01',
              title: 'List Your Book',
              description: 'Snap a photo, enter the ISBN, set your price, and list your book for thousands of campus buyers.',
              badge: 'Fast 1-Min Listing',
            },
            {
              stepNumber: '02',
              title: 'Secure Escrow',
              description: 'We hold the payment safely in escrow until the buyer confirms delivery.',
              badge: 'Zero Fraud Risk',
            },
            {
              stepNumber: '03',
              title: 'Doorstep Pickup & Payout',
              description: 'Our courier partner picks up the book. You get instant payout via UPI or Bank transfer.',
              badge: 'Instant Payout',
            },
          ],
        },
      },
      {
        sectionId: 'gently_used_books',
        type: 'book_carousel',
        title: 'Give Books a Second Life',
        subtitle: 'Massive savings on verified pre-owned textbooks & study materials',
        enabled: true,
        order: 5,
        status: 'published',
        content: {
          eyebrow: 'Gently Pre-Owned',
          selectionStrategy: 'discounted',
          limit: 12,
          seeAllUrl: '/books?discount=30',
          tintBackground: true,
        },
      },
      {
        sectionId: 'category_bookshelves',
        type: 'category_grid',
        title: 'Explore Every Subject',
        subtitle: 'Curated categories for competitive exams, engineering, medical, and literature',
        enabled: true,
        order: 6,
        status: 'published',
        content: {},
      },
      {
        sectionId: 'popular_literature',
        type: 'book_carousel',
        title: 'Popular & Recommended Literature',
        subtitle: 'Highest ranked books curated based on sales, ratings, and student interest',
        enabled: true,
        order: 7,
        status: 'published',
        content: {
          eyebrow: 'Student Favorites',
          selectionStrategy: 'popular',
          limit: 12,
          seeAllUrl: '/books?sort=ratingAvg',
        },
      },
      {
        sectionId: 'why_bookfry',
        type: 'why_us',
        title: 'Why Choose BookFry',
        subtitle: 'Built for students, by readers. Affordable education for everyone.',
        enabled: true,
        order: 8,
        status: 'published',
        content: {
          eyebrow: 'The BookFry Mission',
          pillars: [
            {
              title: 'Affordable Education',
              description: 'No student should pause learning due to expensive textbooks. Get genuine course materials at up to 80% off MRP.',
              badge: 'Up to 80% Off',
            },
            {
              title: 'Verified Student Sellers',
              description: 'Connect directly with senior students, toppers, and verified campus sellers for authentic study notes and books.',
              badge: 'Peer-to-Peer Escrow',
            },
            {
              title: 'Eco Circular Reuse',
              description: 'Every recycled book saves 2.5kg of CO2 and tree paper waste. Read more, spend less, protect our environment.',
              badge: 'Save Trees & Planet',
            },
            {
              title: '100% Escrow Protection',
              description: 'Payments are safely held in escrow until you inspect book condition. Guaranteed 100% money-back refund coverage.',
              badge: 'Zero Risk Guarantee',
            },
          ],
        },
      },
      {
        sectionId: 'testimonials',
        type: 'testimonials',
        title: 'Student & Reader Testimonials',
        subtitle: 'Real experiences from students who saved big on BookFry',
        enabled: true,
        order: 9,
        status: 'published',
        content: {
          eyebrow: 'Campus Community Reviews',
          items: [
            {
              name: 'Aarav Sharma',
              role: 'IIT Delhi Student',
              comment: 'Saved over ₹4,000 on my semester Engineering textbooks! BookFry delivery was super fast.',
              rating: 5,
            },
            {
              name: 'Priya Patel',
              role: 'NEET Aspirant',
              comment: 'Got second-hand NCERT & Biology guides in mint condition. The seller escrow gave me full confidence.',
              rating: 5,
            },
            {
              name: 'Rohan Gupta',
              role: 'CA Final Candidate',
              comment: 'Sold my old Class 12 and Foundation books within 48 hours. Best circular book community in India.',
              rating: 5,
            },
          ],
        },
      },
      {
        sectionId: 'reading_cta',
        type: 'cta',
        title: 'Ready to Start Your Reading Journey?',
        subtitle: 'Join over 50,000+ students buying, selling, and circulating knowledge today.',
        enabled: true,
        order: 10,
        status: 'published',
        content: {
          eyebrow: 'Join 100,000+ Readers & Students Across India',
          primaryCtaLabel: 'Browse All Books',
          primaryCtaUrl: '/books',
          secondaryCtaLabel: 'List a Book for Sale',
          secondaryCtaUrl: '/sell',
        },
      },
      {
        sectionId: 'newsletter',
        type: 'newsletter',
        title: 'Stay Informed on Campus Book Deals',
        subtitle: 'Subscribe to get discount codes & exclusive study material drops in your inbox.',
        enabled: true,
        order: 11,
        status: 'published',
        content: {
          eyebrow: 'Weekly Reading Digest',
          inputPlaceholder: 'your.email@college.edu',
          buttonLabel: 'Subscribe',
          disclaimer: 'By subscribing, you agree to our privacy policy. Unsubscribe anytime.',
        },
      },
      {
        sectionId: 'faq_section',
        type: 'faq',
        title: 'Frequently Asked Questions',
        subtitle: 'Everything you need to know about buying, selling, and shipping on BookFry',
        enabled: true,
        order: 12,
        status: 'published',
        content: {
          eyebrow: 'Help Center & Support',
          faqs: [
            {
              question: 'How does BookFry campus escrow work?',
              answer: 'When a buyer orders a book, payment is safely held in escrow. Once the buyer receives and verifies the book condition, payment is released to the seller.',
              category: 'Buyers & Escrow',
            },
            {
              question: 'How do I sell my used textbooks on BookFry?',
              answer: 'Click "Sell Your Books", scan or enter the book ISBN, upload photos, set your price, and list. When ordered, our courier picks up the book from your doorstep.',
              category: 'Sellers',
            },
            {
              question: 'Are textbooks verified for quality and condition?',
              answer: 'Yes! Every seller provides condition details (New, Like New, Good, Acceptable). Sellers with inaccurate descriptions face account penalties.',
              category: 'Quality & Delivery',
            },
          ],
        },
      },
    ];

    for (const item of defaults) {
      await this.repo.createSection(item);
    }
  }

  /** Helper to resolve real books for a carousel section */
  private async resolveCarouselBooks(content: Record<string, any>): Promise<any[]> {
    const strategy = content.selectionStrategy || 'trending';
    const limit = content.limit || 12;

    let listings: any[] = [];
    if (strategy === 'manual' && Array.isArray(content.manualBookIds) && content.manualBookIds.length > 0) {
      listings = await BookListingModel.find({
        _id: { $in: content.manualBookIds },
        status: 'active',
      })
        .populate('catalogId')
        .limit(limit)
        .exec();
    } else if (strategy === 'discounted') {
      listings = await BookListingModel.find({ status: 'active' })
        .sort({ price: 1 })
        .populate('catalogId')
        .limit(limit)
        .exec();
    } else if (strategy === 'popular') {
      listings = await BookListingModel.find({ status: 'active' })
        .sort({ viewsCount: -1 })
        .populate('catalogId')
        .limit(limit)
        .exec();
    } else {
      listings = await BookListingModel.find({ status: 'active' })
        .sort({ createdAt: -1 })
        .populate('catalogId')
        .limit(limit)
        .exec();
    }

    return listings.map((l: any) => {
      const cat = l.catalogId || {};
      return {
        id: l._id.toString(),
        catalogId: cat._id?.toString() || '',
        title: cat.title || 'Untitled Book',
        author: cat.author || 'Unknown Author',
        isbn: cat.isbn || '',
        publisher: cat.publisher || '',
        category: cat.category || 'general',
        price: l.price,
        originalPrice: l.originalPrice || Math.round(l.price * 1.3),
        condition: l.condition,
        stock: l.stock,
        ratingAvg: cat.ratingAvg || 4.5,
        ratingCount: cat.ratingCount || 10,
        images: cat.images && cat.images.length > 0 ? cat.images : [{ url: cat.coverImage || '/placeholder-book.png' }],
        slug: cat.slug || cat._id?.toString(),
        sellerId: l.sellerId?.toString() || '',
      };
    });
  }

  /** Invalidate and instantly refresh Redis landing page cache */
  async invalidateAndRefreshCache(): Promise<void> {
    const redis = getRedisClient();
    if (!redis) return;

    try {
      await redis.del(LANDING_CACHE_KEY);
      // Fetch fresh compiled payload (bypassing cache) and prime Redis
      const freshData = await this.getPublicLandingData(true);
      await redis.set(LANDING_CACHE_KEY, JSON.stringify(freshData), 'EX', LANDING_CACHE_TTL);
      logger.info('🔄 Redis Landing Page Cache invalidated and refreshed in real-time');
    } catch (error) {
      logger.error('⚠️ Error invalidating/updating Redis landing cache:', error);
    }
  }

  /** Get complete public landing payload with populated section content & SEO (Redis Cached) */
  async getPublicLandingData(skipCache = false) {
    const redis = getRedisClient();

    if (!skipCache && redis) {
      try {
        const cached = await redis.get(LANDING_CACHE_KEY);
        if (cached) {
          logger.info('⚡ Landing page payload served directly from Redis Cache');
          return JSON.parse(cached);
        }
      } catch (error) {
        logger.error('⚠️ Redis cache read error:', error);
      }
    }

    await this.ensureDefaultSectionsExist();

    const [sections, seo, cms] = await Promise.all([
      this.repo.findPublishedSections(),
      this.repo.getSeo(),
      CmsModel.findOne().exec(),
    ]);

    const compiledSections = await Promise.all(
      sections.map(async (sec) => {
        const plain = sec.toObject();
        if (sec.type === 'book_carousel') {
          const books = await this.resolveCarouselBooks(sec.content || {});
          plain.content = { ...(plain.content || {}), books };
        }
        if (sec.type === 'faq' && cms?.faqs) {
          plain.content = { ...(plain.content || {}), faqs: cms.faqs };
        }
        return plain;
      })
    );

    const payload = {
      seo,
      announcement: {
        text: cms?.announcementText || '🎉 Free Shipping on orders over ₹499 across India!',
        enabled: cms?.announcementEnabled ?? true,
        link: cms?.announcementLink || '/books',
      },
      sections: compiledSections,
    };

    if (redis) {
      try {
        await redis.set(LANDING_CACHE_KEY, JSON.stringify(payload), 'EX', LANDING_CACHE_TTL);
        logger.info('💾 Landing page payload cached into Redis memory store');
      } catch (error) {
        logger.error('⚠️ Redis cache write error:', error);
      }
    }

    return payload;
  }

  /** Admin: get all sections (including disabled and draft) */
  async getAllAdminSections() {
    await this.ensureDefaultSectionsExist();
    return this.repo.findAllSections();
  }

  async getAdminSeo() {
    return this.repo.getSeo();
  }

  async updateSeo(data: any) {
    const result = await this.repo.updateSeo(data);
    await this.invalidateAndRefreshCache();
    return result;
  }

  async createSection(data: any) {
    const result = await this.repo.createSection(data);
    await this.invalidateAndRefreshCache();
    return result;
  }

  async updateSection(id: string, data: any) {
    const result = await this.repo.updateSection(id, data);
    await this.invalidateAndRefreshCache();
    return result;
  }

  async deleteSection(id: string) {
    const result = await this.repo.deleteSection(id);
    await this.invalidateAndRefreshCache();
    return result;
  }

  async reorderSections(orders: { id: string; order: number }[]) {
    await this.repo.updateOrders(orders);
    const sections = await this.repo.findAllSections();
    await this.invalidateAndRefreshCache();
    return sections;
  }
}

export default LandingService;
