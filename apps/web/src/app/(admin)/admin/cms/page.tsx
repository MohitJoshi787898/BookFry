'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { FileText, ShieldAlert, Save, Megaphone, HelpCircle } from 'lucide-react';

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
        <div className="text-center py-16 border border-border bg-surface rounded-md font-sans space-y-4">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
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
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-2">
            <FileText className="h-7 w-7 text-brand" />
            <span>CMS, Banners & FAQ Manager</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Manage top announcement bar text, homepage student testimonials, and help desk FAQ content.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 font-sans">
        {/* Top Announcement Bar Manager */}
        <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-4 h-fit">
          <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2 border-b border-border pb-3">
            <Megaphone className="h-5 w-5 text-brand" />
            <span>Homepage Announcement Bar</span>
          </h2>

          {savedSuccess && (
            <div className="p-3 bg-success/10 border border-success/20 rounded text-xs font-semibold text-success">
              ✓ Announcement bar text saved successfully!
            </div>
          )}

          <form onSubmit={handleSaveBanner} className="space-y-4 text-xs">
            <div>
              <label className="block text-[10px] font-bold uppercase text-text-secondary mb-1">
                Active Announcement Text
              </label>
              <textarea
                rows={3}
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                className="w-full p-2.5 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-brand hover:bg-brand-hover text-white font-bold rounded transition-all shadow text-xs uppercase tracking-wider flex items-center justify-center space-x-1"
            >
              <Save className="h-4 w-4" />
              <span>Update Homepage Banner</span>
            </button>
          </form>
        </div>

        {/* FAQ Accordion Editor */}
        <div className="border border-border bg-surface rounded-md p-6 shadow-sm space-y-6">
          <h2 className="font-serif text-lg font-bold text-text-primary flex items-center space-x-2 border-b border-border pb-3">
            <HelpCircle className="h-5 w-5 text-brand" />
            <span>Frequently Asked Questions (FAQ)</span>
          </h2>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div key={idx} className="p-3 border border-border bg-background rounded-lg space-y-1 text-xs">
                <p className="font-bold text-text-primary">Q: {faq.question}</p>
                <p className="text-text-secondary font-sans">A: {faq.answer}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddFaq} className="space-y-3 pt-4 border-t border-border text-xs">
            <h4 className="font-bold text-text-primary">Add New FAQ Question</h4>
            <input
              type="text"
              required
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              placeholder="Question (e.g. Can I list used Engineering books?)"
              className="w-full p-2 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand"
            />
            <textarea
              rows={2}
              required
              value={newAnswer}
              onChange={(e) => setNewAnswer(e.target.value)}
              placeholder="Answer explanation..."
              className="w-full p-2 border border-border rounded bg-background-subtle text-text-primary focus:ring-2 focus:ring-brand"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-brand text-white font-bold rounded text-xs uppercase tracking-wider"
            >
              Add FAQ Item
            </button>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
