'use client';

import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Globe, Check } from 'lucide-react';

export interface SeoData {
  title: string;
  description: string;
  keywords: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  canonicalUrl?: string;
}

export interface SeoEditorTabProps {
  initialSeo?: SeoData;
  onSaveSeo: (data: Partial<SeoData>) => void;
  isSaving: boolean;
}

export function SeoEditorTab({ initialSeo, onSaveSeo, isSaving }: SeoEditorTabProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [keywordsStr, setKeywordsStr] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (initialSeo) {
      setTitle(initialSeo.title || '');
      setDescription(initialSeo.description || '');
      setKeywordsStr((initialSeo.keywords || []).join(', '));
      setOgTitle(initialSeo.ogTitle || '');
      setOgDescription(initialSeo.ogDescription || '');
      setOgImage(initialSeo.ogImage || '');
    }
  }, [initialSeo]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keywords = keywordsStr
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean);

    onSaveSeo({
      title,
      description,
      keywords,
      ogTitle,
      ogDescription,
      ogImage,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="border border-border/80 bg-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6 font-sans">
      <div className="flex items-center justify-between border-b border-border/60 pb-4">
        <h2 className="font-serif text-lg font-bold text-foreground flex items-center space-x-2">
          <Globe className="h-5 w-5 text-secondary" />
          <span>Homepage SEO &amp; Open Graph Metadata</span>
        </h2>
        <span className="text-[10px] font-extrabold uppercase bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20">
          Search &amp; Social Engine
        </span>
      </div>

      {savedSuccess && (
        <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <Check className="h-4 w-4 shrink-0" />
          <span>SEO settings updated successfully! Storefront metadata updated.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <div>
          <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
            Browser Title Tag (&lt;title&gt;) *
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="BookFry • Buy & Sell Books Online"
            className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-medium focus:ring-2 focus:ring-secondary/40 focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
            Meta Description *
          </label>
          <textarea
            rows={3}
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Buy, sell, and discover verified textbooks..."
            className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground font-medium focus:ring-2 focus:ring-secondary/40 focus:outline-none leading-relaxed"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
            SEO Keywords (Comma Separated)
          </label>
          <input
            type="text"
            value={keywordsStr}
            onChange={(e) => setKeywordsStr(e.target.value)}
            placeholder="BookFry, buy used books, sell textbooks, NEET, JEE"
            className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-medium focus:ring-2 focus:ring-secondary/40 focus:outline-none"
          />
        </div>

        <div className="pt-2 border-t border-border/60 space-y-3">
          <h4 className="font-bold text-foreground text-xs">Social Preview (Open Graph)</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                OG Title
              </label>
              <input
                type="text"
                value={ogTitle}
                onChange={(e) => setOgTitle(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                OG Image URL
              </label>
              <input
                type="text"
                value={ogImage}
                onChange={(e) => setOgImage(e.target.value)}
                className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
              />
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full py-3 bg-secondary hover:bg-secondary/90 text-white font-extrabold rounded-2xl transition-all shadow-md text-xs uppercase tracking-wider flex items-center justify-center space-x-2 disabled:opacity-60"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span>{isSaving ? 'Saving SEO Metadata...' : 'Save SEO Metadata'}</span>
        </button>
      </form>
    </div>
  );
}

export default SeoEditorTab;
