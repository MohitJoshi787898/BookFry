'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';

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
    <section
      aria-label="Newsletter Subscription"
      className="py-10 sm:py-14 lg:py-16 bg-card border-t border-border/80 font-sans transition-colors duration-200 overflow-hidden"
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 transition-all">
        
        {/* Premium Newsletter Card — Deep Navy with Radial Light */}
        <div className="relative rounded-3xl bg-primary overflow-hidden shadow-2xl">
          
          {/* Background radial glow mesh */}
          <div
            aria-hidden="true"
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(ellipse at 20% 50%, hsl(20 89% 54% / 0.2) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, hsl(36 100% 50% / 0.12) 0%, transparent 50%)',
            }}
          />

          <div className="relative z-10 px-6 py-10 sm:px-12 sm:py-14 lg:px-16 flex flex-col lg:flex-row items-center gap-8 lg:gap-12">
            
            {/* Left: Headline */}
            <div className="flex-1 space-y-3 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-secondary/20 border border-secondary/30 text-xs font-extrabold uppercase tracking-wider text-secondary">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                <span>Weekly Reading Digest</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-extrabold text-primary-foreground tracking-tight leading-tight">
                Stay in the Literary Loop
              </h2>
              <p className="text-sm text-primary-foreground/70 leading-relaxed font-medium max-w-md mx-auto lg:mx-0">
                Curated book picks, weekly discount drops, campus deal alerts, and early access to rare catalog additions. Zero spam, ever.
              </p>

              {/* Social proof micro-stat */}
              <div className="flex items-center gap-3 justify-center lg:justify-start pt-1">
                <div className="flex -space-x-1.5">
                  {['AS', 'PK', 'RV', 'NM'].map((i) => (
                    <div key={i} className="h-6 w-6 rounded-full bg-secondary/60 border border-primary text-[8px] font-extrabold text-primary-foreground flex items-center justify-center">
                      {i}
                    </div>
                  ))}
                </div>
                <span className="text-xs font-bold text-primary-foreground/60">
                  42,000+ students subscribed
                </span>
              </div>
            </div>

            {/* Right: Email Form */}
            <div className="w-full lg:w-auto lg:min-w-[360px] xl:min-w-[440px]">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="p-5 sm:p-6 bg-primary-foreground/10 rounded-2xl border border-primary-foreground/20 flex items-center gap-3"
                  >
                    <CheckCircle2 className="h-7 w-7 text-secondary shrink-0" />
                    <div>
                      <p className="font-extrabold text-sm text-primary-foreground">You&apos;re on the list!</p>
                      <p className="text-xs text-primary-foreground/60 mt-0.5">Check your inbox for a confirmation email.</p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    onSubmit={handleSubmit}
                    className="space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row gap-2.5">
                      <div className="relative flex-1 min-w-0">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your.email@college.edu"
                          aria-label="Email address for weekly book recommendations"
                          className="w-full h-12 pl-9 pr-4 text-sm rounded-xl bg-primary-foreground/10 text-primary-foreground placeholder:text-primary-foreground/40 border border-primary-foreground/20 focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-all"
                        />
                      </div>
                      <motion.button
                        type="submit"
                        whileTap={{ scale: 0.96 }}
                        className="h-12 px-6 bg-secondary hover:bg-secondary/90 text-secondary-foreground font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                      >
                        <span>Subscribe</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </motion.button>
                    </div>
                    <p className="text-[11px] text-primary-foreground/40 font-medium text-center sm:text-left">
                      By subscribing, you agree to our privacy policy. Unsubscribe anytime.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}

export default NewsletterSection;
