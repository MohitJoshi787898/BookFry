'use client';

import React, { useState } from 'react';
import { Mail, CheckCircle2 } from 'lucide-react';

export function NewsletterSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubmitted(true);
      setEmail('');
    }
  };

  return (
    <section className="py-16 bg-surface border-t border-border font-sans">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="bg-brand text-white rounded-xl p-8 sm:p-12 text-center space-y-6 shadow-md relative overflow-hidden">
          <div className="max-w-xl mx-auto space-y-3 relative z-10">
            <Mail className="h-10 w-10 text-accent mx-auto mb-2 opacity-90" />
            <h2 className="font-serif text-3xl font-bold">Stay in the Literary Loop</h2>
            <p className="text-sm text-white/80 leading-relaxed font-sans">
              Subscribe to get curated book recommendations, weekly discount drops, and early access to rare catalog additions. Zero spam.
            </p>
          </div>

          {submitted ? (
            <div className="max-w-md mx-auto p-4 bg-white/10 rounded-md border border-white/20 flex items-center justify-center space-x-2 text-sm font-semibold">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <span>Thank you for subscribing! Check your inbox soon.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 relative z-10">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                aria-label="Email address for weekly book recommendations"
                className="flex-1 px-4 py-3 text-sm rounded-md bg-white text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-accent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-accent text-white font-bold text-xs uppercase tracking-wider rounded-md hover:bg-accent/90 transition-colors shadow shrink-0"
              >
                Subscribe
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
