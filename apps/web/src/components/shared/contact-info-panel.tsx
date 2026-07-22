import React from 'react';
import { Mail, Phone, MapPin, Clock, Twitter, Github, Linkedin, Instagram } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ContactInfoPanelProps {
  className?: string;
}

export function ContactInfoPanel({ className }: ContactInfoPanelProps) {
  const socials = [
    { icon: Twitter, href: 'https://twitter.com/bookfry', label: 'Twitter' },
    { icon: Instagram, href: 'https://instagram.com/bookfry', label: 'Instagram' },
    { icon: Github, href: 'https://github.com/bookfry', label: 'GitHub' },
    { icon: Linkedin, href: 'https://linkedin.com/company/bookfry', label: 'LinkedIn' },
  ];

  return (
    <div
      className={twMerge(
        clsx(
          'p-6 sm:p-8 bg-muted/50 border border-border/60 rounded-xl space-y-6 font-sans',
          className
        )
      )}
    >
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-text-primary">Contact Information</h3>
        <p className="text-xs text-text-secondary leading-relaxed">
          Have questions about shipping, listing used textbooks, or managing payouts? Reach out through any channel below.
        </p>
      </div>

      <div className="space-y-4 text-xs text-text-secondary">
        {/* Support Email */}
        <div className="flex items-start space-x-3.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Mail className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-text-primary text-[11px] uppercase tracking-wider">Email Support</span>
            <a href="mailto:support@bookfry.com" className="text-brand font-semibold hover:underline">
              support@bookfry.com
            </a>
            <p className="text-[10px] text-text-muted mt-0.5">We typically reply within 24 hours.</p>
          </div>
        </div>

        {/* Support Phone */}
        <div className="flex items-start space-x-3.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Phone className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-text-primary text-[11px] uppercase tracking-wider">Call Center</span>
            <a href="tel:+911204567890" className="text-text-primary font-semibold hover:underline">
              +91 (120) 456-7890
            </a>
            <p className="text-[10px] text-text-muted mt-0.5">Mon - Sat: 9:00 AM to 6:00 PM (IST).</p>
          </div>
        </div>

        {/* Office Address */}
        <div className="flex items-start space-x-3.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <MapPin className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-text-primary text-[11px] uppercase tracking-wider">Headquarters</span>
            <p className="text-text-primary font-medium leading-relaxed">
              BookFry HQ, Floor 4, Sector 62, Noida, Uttar Pradesh, 201301
            </p>
          </div>
        </div>

        {/* Working Hours */}
        <div className="flex items-start space-x-3.5">
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <span className="block font-bold text-text-primary text-[11px] uppercase tracking-wider">Office Hours</span>
            <p className="text-text-primary font-medium">9:00 AM - 6:00 PM IST</p>
            <p className="text-[10px] text-text-muted mt-0.5">Support requests are monitored 24/7 online.</p>
          </div>
        </div>
      </div>

      {/* Styled Map Mockup */}
      <div className="relative h-44 w-full bg-surface border border-border/80 rounded-lg overflow-hidden bg-bookshelf-pattern shadow-xs flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-tr from-brand/5 via-transparent to-brand/10 pointer-events-none" />
        <div className="relative p-4 border border-brand/20 bg-surface/95 backdrop-blur-xs rounded-lg text-center space-y-2 z-10 shadow-sm max-w-[220px]">
          <div className="h-6 w-6 rounded-full bg-secondary/15 text-secondary flex items-center justify-center mx-auto">
            <MapPin className="h-3.5 w-3.5" />
          </div>
          <div>
            <h4 className="font-serif text-[11px] font-bold text-text-primary">Noida Campus Hub</h4>
            <p className="text-[9px] text-text-muted">Sector 62, Uttar Pradesh</p>
          </div>
          <a
            href="https://maps.google.com/?q=Noida+Sector+62"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[9px] font-bold text-brand hover:underline"
          >
            Open in Google Maps
          </a>
        </div>
      </div>

      {/* Social Media Link Buttons */}
      <div className="pt-4 border-t border-border/40">
        <h4 className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-3">Follow our journey</h4>
        <div className="flex items-center space-x-2.5">
          {socials.map((soc, idx) => {
            const SocIcon = soc.icon;
            return (
              <a
                key={idx}
                href={soc.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={soc.label}
                className="h-8 w-8 rounded-full border border-border bg-surface text-text-secondary hover:text-brand hover:border-brand hover:scale-105 transition-all flex items-center justify-center shadow-xs"
              >
                <SocIcon className="h-4 w-4" />
              </a>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default ContactInfoPanel;
