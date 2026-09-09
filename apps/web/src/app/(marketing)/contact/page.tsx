import React from 'react';
import Link from 'next/link';
import { HelpCircle, ArrowRight } from 'lucide-react';
import { SectionHeader } from '@/components/shared/section-header';
import { ContactForm } from '@/components/marketing/contact-form';
import { ContactInfoPanel } from '@/components/shared/contact-info-panel';
import { FaqAccordion } from '@/components/shared/faq-accordion';

export const metadata = {
  title: 'BookFry • Contact Us & Help Desk',
  description: 'Have a question? Submit a support ticket to our team or browse our FAQs regarding orders, payouts, and listings.',
};

export default function ContactPage() {
  const faqItems = [
    {
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes between 2 to 5 business days across India. If you select the campus hand-off / local pickup option, you can coordinate directly with the seller for an instant pickup on campus.',
    },
    {
      question: 'What is the BookFry return policy?',
      answer: 'We provide a 48-hour escrow protection window. If a book arrives and does not match the condition described by the seller, you can open a dispute in your dashboard within 48 hours for a full refund.',
    },
    {
      question: 'How do payouts work for sellers?',
      answer: 'Once an order is delivered, the payment remains in escrow for 48 hours. If no dispute is raised, the payout is released directly to your linked UPI ID or bank account.',
    },
    {
      question: 'Are shipping costs covered?',
      answer: 'Shipping is completely free on orders above ₹499. For smaller orders, a standard flat fee of ₹49 is charged to cover secure courier handling across partner pincodes.',
    },
  ];

  return (
    <main className="flex-grow w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-12 sm:py-16 space-y-16">
      
      {/* Page Header */}
      <SectionHeader
        title="Contact BookFry Support"
        subtitle="Get in touch with our helpdesk. We typically reply to general inquiries within 24 hours."
        className="mb-8"
      />

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start font-sans">
        
        {/* Contact Form Container (Left 60% / 3 columns) */}
        <div className="lg:col-span-3 order-1">
          <ContactForm />
        </div>

        {/* Info Panel Container (Right 40% / 2 columns) */}
        <div className="lg:col-span-2 order-2">
          <ContactInfoPanel />
        </div>

      </div>

      {/* FAQ Accordion Teaser Strip */}
      <section className="border border-border bg-surface rounded-xl p-6 sm:p-8 shadow-xs font-sans space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h3 className="font-serif text-xl font-bold text-text-primary flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-brand" />
              <span>Looking for a quick answer?</span>
            </h3>
            <p className="text-xs text-text-secondary">
              Read our quick help summaries before submitting a support request.
            </p>
          </div>
          
          <Link
            href="/faq"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand hover:underline"
          >
            <span>Visit Help Center</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="max-w-2xl mx-auto">
          <FaqAccordion items={faqItems} />
        </div>
      </section>

    </main>
  );
}

