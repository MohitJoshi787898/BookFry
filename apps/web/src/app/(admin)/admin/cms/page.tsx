'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { ShieldAlert, Save, Megaphone, HelpCircle, Check, Plus, RefreshCw } from 'lucide-react';

interface CmsData {
  announcementText: string;
  announcementEnabled: boolean;
  announcementLink?: string;
  faqs: { question: string; answer: string; category?: string }[];
}

export default function AdminCMSPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const { data: cmsData } = useQuery<CmsData>({
    queryKey: ['admin-cms'],
    queryFn: () => apiClient('/admin/cms'),
    enabled: !!isAdmin,
  });

  const [announcement, setAnnouncement] = useState('');
  const [faqs, setFaqs] = useState<{ question: string; answer: string }[]>([]);
  const [newQuestion, setNewQuestion] = useState('');
  const [newAnswer, setNewAnswer] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (cmsData) {
      setAnnouncement(cmsData.announcementText || '');
      setFaqs(cmsData.faqs || []);
    }
  }, [cmsData]);

  const updateCmsMutation = useMutation({
    mutationFn: (payload: Partial<CmsData>) =>
      apiClient('/admin/cms', {
        method: 'PATCH',
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-cms'] });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    },
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-16 border border-border/80 bg-card rounded-3xl font-sans space-y-4 shadow-xl my-8">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You must have Administrative privileges to manage homepage banners and CMS content.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    updateCmsMutation.mutate({ announcementText: announcement });
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    const updatedFaqs = [...faqs, { question: newQuestion.trim(), answer: newAnswer.trim() }];
    setFaqs(updatedFaqs);
    updateCmsMutation.mutate({ faqs: updatedFaqs });
    setNewQuestion('');
    setNewAnswer('');
  };

  return (
    <AdminLayout>
      {/* Brand Hero Section Header */}
      <AdminHero
        title="CMS, Banners & FAQ Manager"
        subtitle="Manage top announcement bar text, homepage promo banners, student testimonials, and helpdesk FAQ content."
        badgeText="Storefront Content Engine"
        stats={[
          { label: "Announcement Bar", value: announcement ? "Active" : "Disabled", badge: "Live Banner", isPositive: true },
          { label: "FAQ Entries", value: faqs.length, badge: "Help Center", isPositive: true },
          { label: "CMS Engine Status", value: "Active", badge: "System Online", isPositive: true },
          { label: "Storefront State", value: "Online", badge: "Live Sync", isPositive: true },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 font-sans">
        {/* Top Announcement Bar Manager */}
        <div className="border border-border/80 bg-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-5 h-fit">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h2 className="font-serif text-lg font-bold text-foreground flex items-center space-x-2">
              <Megaphone className="h-5 w-5 text-secondary" />
              <span>Homepage Announcement Bar</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider bg-secondary/10 text-secondary px-2.5 py-1 rounded-full border border-secondary/20">
              Live Banner
            </span>
          </div>

          {savedSuccess && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <Check className="h-4 w-4 shrink-0" />
              <span>Announcement bar text saved successfully!</span>
            </div>
          )}

          <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
            <div>
              <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">
                Active Announcement Text *
              </label>
              <textarea
                rows={3}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                placeholder="e.g. Free Campus Shipping on orders over ₹299! Code: CAMPUSFREE"
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-secondary/40 focus:outline-none leading-relaxed"
              />
            </div>

            <button
              type="submit"
              disabled={updateCmsMutation.isPending}
              className="w-full py-3 bg-[#F26522] hover:bg-[#D64E0F] text-white font-extrabold rounded-2xl transition-all shadow-md shadow-[#F26522]/20 text-xs uppercase tracking-wider flex items-center justify-center space-x-2 active:scale-95 disabled:opacity-60"
            >
              {updateCmsMutation.isPending ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>{updateCmsMutation.isPending ? 'Updating...' : 'Update Homepage Banner'}</span>
            </button>
          </form>
        </div>

        {/* FAQ Accordion Editor */}
        <div className="border border-border/80 bg-card rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-border/60 pb-4">
            <h2 className="font-serif text-lg font-bold text-foreground flex items-center space-x-2">
              <HelpCircle className="h-5 w-5 text-secondary" />
              <span>Frequently Asked Questions (FAQ)</span>
            </h2>
            <span className="text-[10px] font-black uppercase tracking-wider bg-secondary/10 text-secondary px-2.5 py-1 rounded-full border border-secondary/20">
              Help Center
            </span>
          </div>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {faqs.length === 0 ? (
              <p className="text-xs text-muted-foreground italic text-center py-4">No FAQ entries added yet.</p>
            ) : (
              faqs.map((faq, idx) => (
                <div key={idx} className="p-4 border border-border/60 bg-muted/30 rounded-2xl space-y-1 text-xs">
                  <p className="font-bold text-foreground">Q: {faq.question}</p>
                  <p className="text-muted-foreground font-sans leading-relaxed">A: {faq.answer}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddFaq} className="space-y-3 pt-4 border-t border-border/60 text-xs">
            <h4 className="font-bold text-foreground">Add New FAQ Question</h4>
            <input
              type="text"
              required
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question (e.g. Can I list used Engineering books?)"
              className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-secondary/40 focus:outline-none"
            />
            <textarea
              rows={2}
              required
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Answer explanation..."
              className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-medium focus:ring-2 focus:ring-secondary/40 focus:outline-none leading-relaxed"
            />
            <button
              type="submit"
              disabled={updateCmsMutation.isPending}
              className="px-5 py-2.5 bg-[#F26522] hover:bg-[#D64E0F] text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-[#F26522]/20 flex items-center gap-1.5 active:scale-95 disabled:opacity-60"
            >
              <Plus className="h-4 w-4" />
              <span>Add FAQ Item</span>
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
