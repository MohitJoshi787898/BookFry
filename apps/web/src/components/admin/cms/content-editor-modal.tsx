'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, RefreshCw, Plus, Trash2 } from 'lucide-react';
import { SectionData } from '@/components/marketing/section-renderer';

export interface ContentEditorModalProps {
  section: SectionData | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, updatedData: Partial<SectionData>) => void;
  isSaving: boolean;
}

export function ContentEditorModal({
  section,
  isOpen,
  onClose,
  onSave,
  isSaving,
}: ContentEditorModalProps) {
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [content, setContent] = useState<Record<string, any>>({});

  useEffect(() => {
    if (section) {
      setTitle(section.title || '');
      setSubtitle(section.subtitle || '');
      setContent(section.content || {});
    }
  }, [section]);

  if (!isOpen || !section) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(section._id!, {
      title,
      subtitle,
      content,
    });
  };

  const handleContentChange = (key: string, value: unknown) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  // Helper for updating array fields inside content
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateArrayField = (field: string, index: number, key: string, val: any) => {
    const list = [...(content[field] || [])];
    if (!list[index]) list[index] = {};
    list[index] = { ...list[index], [key]: val };
    handleContentChange(field, list);
  };

  const addArrayItem = (field: string, newItem: Record<string, unknown>) => {
    const list = [...(content[field] || []), newItem];
    handleContentChange(field, list);
  };

  const removeArrayItem = (field: string, index: number) => {
    const list = [...(content[field] || [])];
    list.splice(index, 1);
    handleContentChange(field, list);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans animate-in fade-in duration-200">
      <div className="bg-card border border-border/90 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl space-y-6 p-6 sm:p-8">
        <div className="flex items-center justify-between border-b border-border/60 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-secondary tracking-widest">
              Section Architecture: {section.type}
            </span>
            <h3 className="font-serif text-xl font-bold text-foreground">
              Edit Section Details &amp; Nested Elements
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          <div>
            <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
              Section Main Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground font-medium focus:ring-2 focus:ring-secondary/40 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
              Section Subtitle / Description
            </label>
            <textarea
              rows={2}
              value={subtitle}
              onChange={(e) => setSubtitle(e.target.value)}
              className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground font-medium focus:ring-2 focus:ring-secondary/40 focus:outline-none leading-relaxed"
            />
          </div>

          {/* ================= HERO SECTION CONTROLS ================= */}
          {section.type === 'hero' && (
            <div className="space-y-4 pt-2 border-t border-border/60">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-secondary">
                Hero Micro-Copy &amp; Search Controls
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Eyebrow Motto Text
                  </label>
                  <input
                    type="text"
                    value={content.eyebrow || ''}
                    onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Highlight Word
                  </label>
                  <input
                    type="text"
                    value={content.highlightText || ''}
                    onChange={(e) => handleContentChange('highlightText', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Search Panel Heading
                  </label>
                  <input
                    type="text"
                    value={content.searchHeading || ''}
                    onChange={(e) => handleContentChange('searchHeading', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Search Panel Subheading
                  </label>
                  <input
                    type="text"
                    value={content.searchSubheading || ''}
                    onChange={(e) => handleContentChange('searchSubheading', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Search Placeholder Text
                  </label>
                  <input
                    type="text"
                    value={content.searchPlaceholder || ''}
                    onChange={(e) => handleContentChange('searchPlaceholder', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Search Button Label
                  </label>
                  <input
                    type="text"
                    value={content.searchButtonLabel || ''}
                    onChange={(e) => handleContentChange('searchButtonLabel', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Escrow Badge Text
                  </label>
                  <input
                    type="text"
                    value={content.escrowBadge || ''}
                    onChange={(e) => handleContentChange('escrowBadge', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Discount Badge Text
                  </label>
                  <input
                    type="text"
                    value={content.discountBadge || ''}
                    onChange={(e) => handleContentChange('discountBadge', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Primary CTA Label
                  </label>
                  <input
                    type="text"
                    value={content.primaryCtaLabel || ''}
                    onChange={(e) => handleContentChange('primaryCtaLabel', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">
                    Primary CTA Target URL
                  </label>
                  <input
                    type="text"
                    value={content.primaryCtaUrl || ''}
                    onChange={(e) => handleContentChange('primaryCtaUrl', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
              </div>

              {/* Stats array editor */}
              <div className="space-y-2 pt-2 border-t border-border/60">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foreground text-[11px] uppercase tracking-wider text-secondary">
                    Hero Trust Stats ({ (content.stats || []).length })
                  </span>
                  <button
                    type="button"
                    onClick={() => addArrayItem('stats', { value: '10k+', label: 'Metric' })}
                    className="px-2.5 py-0.5 bg-secondary/10 text-secondary rounded-lg font-bold text-[10px] flex items-center gap-1"
                  >
                    <Plus className="h-3 w-3" /> Add Stat
                  </button>
                </div>
                {(content.stats || []).map((st: { value?: string; label?: string }, idx: number) => (
                  <div key={idx} className="grid grid-cols-5 gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Value"
                      value={st.value || ''}
                      onChange={(e) => updateArrayField('stats', idx, 'value', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Label"
                      value={st.label || ''}
                      onChange={(e) => updateArrayField('stats', idx, 'label', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs col-span-3"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayItem('stats', idx)}
                      className="text-danger hover:text-danger/80 p-1 flex justify-center"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= FEATURES BAR NESTED CARDS ================= */}
          {section.type === 'features' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-secondary">
                  Nested Value Proposition Cards ({ (content.items || []).length })
                </h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('items', { title: 'New Feature', description: 'Feature description', badge: 'Badge' })}
                  className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Feature Card
                </button>
              </div>

              {(content.items || []).map((item: { title?: string; description?: string; badge?: string }, idx: number) => (
                <div key={idx} className="p-3 border border-border/70 rounded-2xl bg-background-subtle space-y-2 relative">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Card #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('items', idx)}
                      className="text-danger hover:text-danger/80 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={item.title || ''}
                      onChange={(e) => updateArrayField('items', idx, 'title', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.description || ''}
                      onChange={(e) => updateArrayField('items', idx, 'description', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Badge"
                      value={item.badge || ''}
                      onChange={(e) => updateArrayField('items', idx, 'badge', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= KNOWLEDGE EXCHANGE STEPS ================= */}
          {section.type === 'knowledge_story' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-secondary">
                Knowledge Flow Micro-Copy &amp; Benefit Strip
              </h4>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Eyebrow Tag</label>
                  <input
                    type="text"
                    value={content.eyebrow || ''}
                    onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Save Percent Text</label>
                  <input
                    type="text"
                    value={content.savePercentText || ''}
                    onChange={(e) => handleContentChange('savePercentText', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Earn Percent Text</label>
                  <input
                    type="text"
                    value={content.earnPercentText || ''}
                    onChange={(e) => handleContentChange('earnPercentText', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Eco Text</label>
                  <input
                    type="text"
                    value={content.ecoText || ''}
                    onChange={(e) => handleContentChange('ecoText', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-secondary">
                  Nested Process Steps ({ (content.steps || []).length })
                </h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('steps', { stepNumber: '04', title: 'New Step', description: 'Step description', badge: 'Badge' })}
                  className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Step
                </button>
              </div>

              {(content.steps || []).map((step: { stepNumber?: string; title?: string; description?: string; badge?: string }, idx: number) => (
                <div key={idx} className="p-3 border border-border/70 rounded-2xl bg-background-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Step #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('steps', idx)}
                      className="text-danger hover:text-danger/80 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-4 gap-2">
                    <input
                      type="text"
                      placeholder="No."
                      value={step.stepNumber || ''}
                      onChange={(e) => updateArrayField('steps', idx, 'stepNumber', e.target.value)}
                      className="px-2 py-1.5 border rounded-lg bg-card text-xs font-bold text-center"
                    />
                    <input
                      type="text"
                      placeholder="Title"
                      value={step.title || ''}
                      onChange={(e) => updateArrayField('steps', idx, 'title', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs font-bold col-span-2"
                    />
                    <input
                      type="text"
                      placeholder="Badge"
                      value={step.badge || ''}
                      onChange={(e) => updateArrayField('steps', idx, 'badge', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Description"
                    value={step.description || ''}
                    onChange={(e) => updateArrayField('steps', idx, 'description', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-card text-xs"
                  />
                </div>
              ))}
            </div>
          )}

          {/* ================= CATEGORY GRID ================= */}
          {section.type === 'category_grid' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Eyebrow Tag</label>
                  <input
                    type="text"
                    value={content.eyebrow || ''}
                    onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">See All Link Label</label>
                  <input
                    type="text"
                    value={content.seeAllLabel || ''}
                    onChange={(e) => handleContentChange('seeAllLabel', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-secondary">
                  Nested Category Bookshelves ({ (content.categories || []).length })
                </h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('categories', { title: 'Category Name', subtitle: 'Subtitle', badge: '10k+ Books', href: '/books' })}
                  className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Category
                </button>
              </div>

              {(content.categories || []).map((cat: { title?: string; subtitle?: string; badge?: string; href?: string }, idx: number) => (
                <div key={idx} className="p-3 border border-border/70 rounded-2xl bg-background-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Category #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('categories', idx)}
                      className="text-danger hover:text-danger/80 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={cat.title || ''}
                      onChange={(e) => updateArrayField('categories', idx, 'title', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Subtitle"
                      value={cat.subtitle || ''}
                      onChange={(e) => updateArrayField('categories', idx, 'subtitle', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs"
                    />
                    <input
                      type="text"
                      placeholder="Badge"
                      value={cat.badge || ''}
                      onChange={(e) => updateArrayField('categories', idx, 'badge', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs"
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ================= WHY BOOKFRY PILLARS ================= */}
          {section.type === 'why_us' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Eyebrow Mission Tag</label>
                  <input
                    type="text"
                    value={content.eyebrow || ''}
                    onChange={(e) => handleContentChange('eyebrow', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-muted-foreground mb-1">Trees Saved Value</label>
                  <input
                    type="text"
                    value={content.treesSavedValue || ''}
                    onChange={(e) => handleContentChange('treesSavedValue', e.target.value)}
                    className="w-full px-3 py-2 border rounded-xl bg-background text-xs font-medium"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-secondary">
                  Nested Mission Pillars ({ (content.pillars || []).length })
                </h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('pillars', { title: 'New Pillar', description: 'Pillar description', badge: 'Verified' })}
                  className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Mission Pillar
                </button>
              </div>

              {(content.pillars || []).map((pillar: { title?: string; description?: string; badge?: string }, idx: number) => (
                <div key={idx} className="p-3 border border-border/70 rounded-2xl bg-background-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Pillar #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('pillars', idx)}
                      className="text-danger hover:text-danger/80 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Title"
                      value={pillar.title || ''}
                      onChange={(e) => updateArrayField('pillars', idx, 'title', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Badge"
                      value={pillar.badge || ''}
                      onChange={(e) => updateArrayField('pillars', idx, 'badge', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Description"
                    value={pillar.description || ''}
                    onChange={(e) => updateArrayField('pillars', idx, 'description', e.target.value)}
                    className="w-full p-2 border rounded-lg bg-card text-xs leading-relaxed"
                  />
                </div>
              ))}
            </div>
          )}

          {/* ================= TESTIMONIAL REVIEWS ================= */}
          {section.type === 'testimonials' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-secondary">
                  Nested Student Reviews ({ (content.items || []).length })
                </h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('items', { name: 'Student Name', role: 'Role / University', comment: 'Review comment', rating: 5 })}
                  className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add Review
                </button>
              </div>

              {(content.items || []).map((t: { name?: string; role?: string; comment?: string; rating?: number }, idx: number) => (
                <div key={idx} className="p-3 border border-border/70 rounded-2xl bg-background-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">Review #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('items', idx)}
                      className="text-danger hover:text-danger/80 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      placeholder="Student Name"
                      value={t.name || ''}
                      onChange={(e) => updateArrayField('items', idx, 'name', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs font-bold"
                    />
                    <input
                      type="text"
                      placeholder="Role / University"
                      value={t.role || ''}
                      onChange={(e) => updateArrayField('items', idx, 'role', e.target.value)}
                      className="px-2.5 py-1.5 border rounded-lg bg-card text-xs"
                    />
                  </div>
                  <textarea
                    rows={2}
                    placeholder="Comment"
                    value={t.comment || ''}
                    onChange={(e) => updateArrayField('items', idx, 'comment', e.target.value)}
                    className="w-full p-2 border rounded-lg bg-card text-xs leading-relaxed"
                  />
                </div>
              ))}
            </div>
          )}

          {/* ================= FAQ QUESTIONS ================= */}
          {section.type === 'faq' && (
            <div className="space-y-3 pt-2 border-t border-border/60">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-foreground text-xs uppercase tracking-wider text-secondary">
                  Nested FAQ Items ({ (content.faqs || []).length })
                </h4>
                <button
                  type="button"
                  onClick={() => addArrayItem('faqs', { question: 'Question?', answer: 'Answer content', category: 'General' })}
                  className="px-3 py-1 bg-secondary/10 text-secondary rounded-lg font-bold text-[11px] flex items-center gap-1"
                >
                  <Plus className="h-3 w-3" /> Add FAQ Item
                </button>
              </div>

              {(content.faqs || []).map((faq: { question?: string; answer?: string; category?: string }, idx: number) => (
                <div key={idx} className="p-3 border border-border/70 rounded-2xl bg-background-subtle space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase text-muted-foreground">FAQ #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeArrayItem('faqs', idx)}
                      className="text-danger hover:text-danger/80 p-1"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Question"
                    value={faq.question || ''}
                    onChange={(e) => updateArrayField('faqs', idx, 'question', e.target.value)}
                    className="w-full px-2.5 py-1.5 border rounded-lg bg-card text-xs font-bold"
                  />
                  <textarea
                    rows={2}
                    placeholder="Answer"
                    value={faq.answer || ''}
                    onChange={(e) => updateArrayField('faqs', idx, 'answer', e.target.value)}
                    className="w-full p-2 border rounded-lg bg-card text-xs leading-relaxed"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 border border-border rounded-2xl text-xs font-bold hover:bg-muted"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-secondary hover:bg-secondary/90 text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all flex items-center space-x-2 disabled:opacity-60 shadow-md"
            >
              {isSaving ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{isSaving ? 'Saving...' : 'Save All Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ContentEditorModal;
