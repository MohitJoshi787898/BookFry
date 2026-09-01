'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { AdminFilterBar } from '@/components/admin/admin-filter-bar';
import { AdminEmptyState } from '@/components/admin/admin-empty-state';
import { useAuthStore } from '@/stores/auth.store';
import {
  Eye,
  Pencil,
  Trash2,
  RefreshCw,
  LifeBuoy,
  MessageSquare,
  Mail,
  User,
} from 'lucide-react';
import {
  AdminModal,
  AdminDetailRow,
  AdminStatBadge,
  AdminDetailSection,
} from '@/components/admin/admin-modal';
import { AdminDangerModal } from '@/components/admin/admin-danger-modal';
import { apiClient } from '@/lib/api-client';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  userEmail: string;
  name: string;
  subject: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

export default function AdminSupportPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');
  const queryClient = useQueryClient();

  const [statusFilter, setStatusFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    subject: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'open' as 'open' | 'in_progress' | 'resolved',
  });

  const { data: tickets = [], isLoading, isError, refetch } = useQuery<SupportTicket[]>({
    queryKey: ['admin-support-tickets'],
    queryFn: () => apiClient('/admin/support-tickets'),
    enabled: !!isAdmin,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/admin/support-tickets/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      setEditModalOpen(false);
      setSelectedTicket(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiClient(`/admin/support-tickets/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      setDeleteModalOpen(false);
      setSelectedTicket(null);
    },
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <AdminEmptyState
          title="Access Restricted"
          description="Super Administrator role required to view and manage customer helpdesk tickets."
          mascotVariant="reading"
        />
      </AdminLayout>
    );
  }

  const rawTickets = tickets || [];
  const filteredTickets = rawTickets.filter((t) => {
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesSearch =
      !searchQuery.trim() ||
      t.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filterChips = [
    { id: '', label: 'All Inquiries', count: rawTickets.length },
    { id: 'open', label: 'Unassigned / Open', count: rawTickets.filter((t) => t.status === 'open').length },
    { id: 'in_progress', label: 'In Progress', count: rawTickets.filter((t) => t.status === 'in_progress').length },
    { id: 'resolved', label: 'Resolved Tickets', count: rawTickets.filter((t) => t.status === 'resolved').length },
  ];

  const columns: Column<SupportTicket>[] = [
    {
      header: 'Ticket Details',
      cell: (t) => (
        <div className="font-sans">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-black uppercase text-secondary bg-secondary/10 px-2 py-0.5 rounded-md border border-secondary/20">
              #{t.ticketNumber}
            </span>
            <p className="font-bold text-foreground line-clamp-1">{t.subject}</p>
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Student: <span className="font-semibold text-foreground">{t.name}</span> ({t.userEmail})
          </p>
        </div>
      ),
    },
    {
      header: 'Priority',
      cell: (t) => {
        const pColors = {
          high: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          medium: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
          low: 'bg-muted text-muted-foreground border-border',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${pColors[t.priority] || pColors.low}`}>
            {t.priority}
          </span>
        );
      },
    },
    {
      header: 'Status',
      cell: (t) => {
        const sColors = {
          open: 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30',
          in_progress: 'bg-sky-500/15 text-sky-600 dark:text-sky-400 border-sky-500/30',
          resolved: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        };
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${sColors[t.status] || sColors.open}`}>
            {t.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (t) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          <button
            onClick={() => { setSelectedTicket(t); setViewModalOpen(true); }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            title="View Ticket"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => {
              setSelectedTicket(t);
              setEditForm({ subject: t.subject, priority: t.priority, status: t.status });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded-xl border border-border/80 bg-card hover:bg-muted text-muted-foreground hover:text-secondary transition-all cursor-pointer"
            title="Edit / Resolve"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => { setSelectedTicket(t); setDeleteModalOpen(true); }}
            className="p-1.5 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all cursor-pointer"
            title="Delete Ticket"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      <AdminHero
        title="Customer Helpdesk & Support"
        subtitle="Manage student fulfillment inquiries, delivery escalations, and payment resolution tickets."
        badgeText="Student Support"
        stats={[
          { label: 'Total Inquiries', value: rawTickets.length, badge: 'Tickets', isPositive: true },
          { label: 'Unassigned / Open', value: rawTickets.filter((t) => t.status === 'open').length, badge: 'Queue', isPositive: false },
          { label: 'Resolved Tickets', value: rawTickets.filter((t) => t.status === 'resolved').length, badge: 'Resolved', isPositive: true },
        ]}
      />

      <AdminFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search ticket ID, student name, or email..."
        filterChips={filterChips}
        activeFilter={statusFilter}
        onFilterSelect={setStatusFilter}
      />

      {isError ? (
        <AdminEmptyState
          title="Support Desk Error"
          description="Failed to retrieve customer support records from the ticketing service."
          mascotVariant="pointing"
          action={{ label: 'Retry Fetch', onClick: () => refetch() }}
        />
      ) : (
        <AdminDataTable
          title="Helpdesk Support Queue"
          subtitle="Manage active customer questions and campus escalations"
          data={filteredTickets}
          columns={columns}
          searchField="subject"
          searchPlaceholder="Search ticket..."
          isLoading={isLoading}
        />
      )}

      {/* VIEW TICKET DETAILS MODAL */}
      {selectedTicket && (
        <AdminModal
          isOpen={viewModalOpen}
          onClose={() => { setViewModalOpen(false); setSelectedTicket(null); }}
          size="lg"
          title={`Ticket #${selectedTicket.ticketNumber}`}
          subtitle={selectedTicket.subject}
          icon={<LifeBuoy className="h-5 w-5 text-secondary" />}
          badge={
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-secondary/15 text-secondary border border-secondary/20">
              {selectedTicket.status.replace('_', ' ')}
            </span>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <a
                href={`mailto:${selectedTicket.userEmail}?subject=Re: [Ticket #${selectedTicket.ticketNumber}] ${selectedTicket.subject}`}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-secondary hover:underline"
              >
                <Mail className="h-3.5 w-3.5" />
                <span>Reply to Student via Email</span>
              </a>
              <button
                onClick={() => { setViewModalOpen(false); setSelectedTicket(null); }}
                className="px-5 py-2.5 bg-secondary text-white text-xs font-extrabold uppercase tracking-wider rounded-2xl hover:bg-secondary/90 shadow-md shadow-secondary/20 cursor-pointer"
              >
                Close
              </button>
            </div>
          }
        >
          <div className="space-y-4 font-sans">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AdminStatBadge label="Priority" value={selectedTicket.priority.toUpperCase()} variant={selectedTicket.priority === 'high' ? 'danger' : 'info'} />
              <AdminStatBadge label="Ticket Status" value={selectedTicket.status.toUpperCase()} variant={selectedTicket.status === 'resolved' ? 'success' : 'warning'} />
              <AdminStatBadge label="Channel" value="Web Portal" variant="default" />
            </div>

            <AdminDetailSection title="Ticket Narrative & Message" icon={<MessageSquare className="h-4 w-4" />}>
              <div className="p-4 bg-card rounded-2xl border border-border/80 space-y-2">
                <p className="text-xs text-foreground leading-relaxed font-medium">
                  {selectedTicket.message}
                </p>
              </div>
            </AdminDetailSection>

            <AdminDetailSection title="Student Contact Information" icon={<User className="h-4 w-4" />}>
              <div className="p-4 bg-muted/30 border border-border/80 rounded-2xl space-y-2">
                <AdminDetailRow label="Student Name" value={selectedTicket.name} />
                <AdminDetailRow label="College Email" value={selectedTicket.userEmail} copyable />
                <AdminDetailRow label="Submitted At" value={selectedTicket.createdAt} />
              </div>
            </AdminDetailSection>
          </div>
        </AdminModal>
      )}

      {/* EDIT / RESOLVE TICKET MODAL */}
      {selectedTicket && (
        <AdminModal
          isOpen={editModalOpen}
          onClose={() => { setEditModalOpen(false); setSelectedTicket(null); }}
          size="md"
          title={`Resolve Ticket #${selectedTicket.ticketNumber}`}
          subtitle="Update priority level or advance ticket status"
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => { setEditModalOpen(false); setSelectedTicket(null); }}
                className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-ticket-form"
                disabled={editMutation.isPending}
                className="px-5 py-2.5 bg-secondary text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-md shadow-secondary/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Ticket</span>
              </button>
            </div>
          }
        >
          <form
            id="edit-ticket-form"
            onSubmit={(e) => {
              e.preventDefault();
              editMutation.mutate({ id: selectedTicket.id, data: editForm });
            }}
            className="space-y-4 text-xs font-sans"
          >
            <div>
              <label className="block text-xs font-bold text-foreground mb-1.5">Subject Line *</label>
              <input
                type="text"
                required
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Priority Level</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-foreground mb-1.5">Resolution Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'open' | 'in_progress' | 'resolved' })}
                  className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
                >
                  <option value="open">Open / Unresolved</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved &amp; Closed</option>
                </select>
              </div>
            </div>
          </form>
        </AdminModal>
      )}

      {/* DELETE DANGER MODAL */}
      {selectedTicket && (
        <AdminDangerModal
          isOpen={deleteModalOpen}
          onClose={() => { setDeleteModalOpen(false); setSelectedTicket(null); }}
          onConfirm={() => deleteMutation.mutate(selectedTicket.id)}
          isPending={deleteMutation.isPending}
          title="Confirm Delete Support Ticket"
          entityName={`Ticket #${selectedTicket.ticketNumber}`}
          description={<span>Are you sure you want to delete helpdesk ticket <strong>#{selectedTicket.ticketNumber}</strong>?</span>}
          impacts={[
            'The conversation thread and ticket history will be permanently erased.',
          ]}
          confirmText="Delete Ticket"
        />
      )}
    </AdminLayout>
  );
}
