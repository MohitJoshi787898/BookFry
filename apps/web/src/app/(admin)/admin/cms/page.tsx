'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { useAuthStore } from '@/stores/auth.store';
import { apiClient } from '@/lib/api-client';
import { Plus, Layers, Globe } from 'lucide-react';
import { SectionListTable } from '@/components/admin/cms/section-list-table';
import { ContentEditorModal } from '@/components/admin/cms/content-editor-modal';
import { SeoEditorTab } from '@/components/admin/cms/seo-editor-tab';
import { SectionData } from '@/components/marketing/section-renderer';

export default function AdminCMSPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'sections' | 'seo'>('sections');
  const [editingSection, setEditingSection] = useState<SectionData | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const { data: sections = [], isError, refetch } = useQuery<SectionData[]>({
    queryKey: ['admin-landing-sections'],
    queryFn: () => apiClient('/admin/landing/sections'),
    enabled: !!isAdmin,
  });

  const { data: seoData } = useQuery({
    queryKey: ['admin-landing-seo'],
    queryFn: () => apiClient('/admin/landing/seo'),
    enabled: !!isAdmin,
  });

  const reorderMutation = useMutation({
    mutationFn: (payload: { sections: { id: string; order: number }[] }) =>
      apiClient('/admin/landing/reorder', { method: 'PATCH', body: JSON.stringify(payload) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-landing-sections'] }),
  });

  const updateSectionMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<SectionData> }) =>
      apiClient(`/admin/landing/sections/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-landing-sections'] });
      setIsEditorOpen(false);
    },
  });

  const updateSeoMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient('/admin/landing/seo', { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-landing-seo'] }),
  });

  const createSectionMutation = useMutation({
    mutationFn: (data: Record<string, unknown>) =>
      apiClient('/admin/landing/sections', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-landing-sections'] }),
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <AdminEmptyState
          title="Access Restricted"
          description="Super Administrator role required to manage storefront landing page architecture."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const items = [...sections];
    const temp = items[index];
    items[index] = items[index - 1];
    items[index - 1] = temp;
    const reordered = items.map((item, i) => ({ id: item._id!, order: i }));
    reorderMutation.mutate({ sections: reordered });
  };

  const handleMoveDown = (index: number) => {
    if (index === sections.length - 1) return;
    const items = [...sections];
    const temp = items[index];
    items[index] = items[index + 1];
    items[index + 1] = temp;
    const reordered = items.map((item, i) => ({ id: item._id!, order: i }));
    reorderMutation.mutate({ sections: reordered });
  };

  const handleAddCustomBanner = () => {
    const bannerId = `banner_${Date.now()}`;
    createSectionMutation.mutate({
      sectionId: bannerId,
      type: 'banner',
      title: 'Special Campus Book Fair Banner',
      subtitle: 'Limited seasonal book exchange discount and free doorstep delivery',
      enabled: true,
      order: sections.length,
      content: {
        eyebrow: 'Exclusive Offer',
        ctaLabel: 'Explore Deals',
        ctaUrl: '/books',
      },
    });
  };

  return (
    <AdminLayout>
      <AdminHero
        title="Storefront CMS & Banners Architecture"
        subtitle="Complete control over homepage sections, ordering hierarchy, banners, and Next.js SEO metadata."
        badgeText="Dynamic Storefront Engine"
        stats={[
          { label: 'Active Sections', value: sections.filter((s) => s.enabled).length, badge: 'Live On Store', isPositive: true },
          { label: 'Total Modules', value: sections.length, badge: 'Configured', isPositive: true },
          { label: 'SEO Metadata', value: 'Optimized', badge: 'Next.js RSC', isPositive: true },
          { label: 'Storefront CMS', value: 'Active', badge: 'Zero Deploy', isPositive: true },
        ]}
        actions={
          <button
            onClick={handleAddCustomBanner}
            disabled={createSectionMutation.isPending}
            className="px-4 py-2 bg-secondary hover:bg-secondary/90 text-white font-bold rounded-2xl text-xs uppercase tracking-wider transition-all shadow-md shadow-secondary/20 flex items-center space-x-1.5 active:scale-95 disabled:opacity-60 cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Banner</span>
          </button>
        }
      />

      {/* Mode Switcher Tabs */}
      <div className="flex items-center justify-between gap-3 font-sans mb-4">
        <div className="flex items-center space-x-1.5 bg-muted/60 p-1 rounded-2xl border border-border/80">
          <button
            onClick={() => setActiveTab('sections')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'sections'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Layers className="h-4 w-4 text-secondary" />
            <span>Homepage Sections</span>
          </button>
          <button
            onClick={() => setActiveTab('seo')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer ${
              activeTab === 'seo'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Globe className="h-4 w-4 text-secondary" />
            <span>SEO &amp; Social Metadata</span>
          </button>
        </div>
      </div>

      {isError ? (
        <AdminEmptyState
          title="CMS Modules Fetch Error"
          description="Failed to load homepage sections schema."
          mascotVariant="pointing"
          action={{ label: 'Retry CMS Load', onClick: () => refetch() }}
        />
      ) : activeTab === 'sections' ? (
        <SectionListTable
          sections={sections}
          onMoveUp={handleMoveUp}
          onMoveDown={handleMoveDown}
          onToggleEnabled={(id, current) =>
            updateSectionMutation.mutate({ id, data: { enabled: !current } })
          }
          onEdit={(sec) => {
            setEditingSection(sec);
            setIsEditorOpen(true);
          }}
        />
      ) : (
        <SeoEditorTab
          initialSeo={seoData}
          onSaveSeo={(data) => updateSeoMutation.mutate(data)}
          isSaving={updateSeoMutation.isPending}
        />
      )}

      {/* Content Editor Modal */}
      <ContentEditorModal
        section={editingSection}
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        onSave={(id, data) => updateSectionMutation.mutate({ id, data })}
        isSaving={updateSectionMutation.isPending}
      />
    </AdminLayout>
  );
}
