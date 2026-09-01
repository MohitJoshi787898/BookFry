'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ShieldCheck, Sparkles } from 'lucide-react';

export function FooterNewsletter() {
  const [emailVal, setEmailVal] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailVal.trim()) return;
    setSubscribed(true);
    setEmailVal('');
  };

  return (
    <div className="rounded-3xl border border-border/80 bg-card p-6 md:p-8 shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 font-sans">
      <div className="flex items-start gap-4">
        <div className="h-12 w-12 rounded-2xl bg-secondary/10 border border-secondary/20 flex items-center justify-center shrink-0 text-secondary shadow-xs">
          <Mail className="h-6 w-6" />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-1.5 text-xs font-black text-foreground">
            <span>Join 100,000+ Book Readers</span>
            <Sparkles className="h-3.5 w-3.5 text-secondary" />
          </div>
          <h4 className="font-serif text-lg font-bold text-foreground">Stay in the Loop for Rare Deals</h4>
          <p className="text-xs text-muted-foreground max-w-sm leading-relaxed font-medium">
            Get exclusive textbook discounts, new book arrivals &amp; campus reading lists delivered to your inbox. Zero spam.
          </p>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {subscribed ? (
          <motion.div
            key="thanks"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-6 py-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-extrabold"
          >
            <ShieldCheck className="h-4 w-4" /> You&apos;re subscribed to BookFry updates! 🎉
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            onSubmit={handleSubscribe}
            className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto shrink-0"
          >
            <input
              type="email"
              required
              value={emailVal}
              onChange={(e) => setEmailVal(e.target.value)}
              placeholder="Enter your student email..."
              className="h-12 px-4 rounded-2xl border border-border/80 bg-background text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-secondary/40 w-full sm:w-72 font-medium"
            />
            <button
              type="submit"
              className="h-12 px-7 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-black text-xs uppercase tracking-wider rounded-2xl transition-all active:scale-95 shadow-md shrink-0"
            >
              Subscribe
            </button>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

export default FooterNewsletter;
