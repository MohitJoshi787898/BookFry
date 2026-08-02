'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { MessageSquare, ShieldAlert, CheckCircle2, AlertCircle, Eye, Pencil, Trash2, X, RefreshCw, Check } from 'lucide-react';
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

  // Modals state
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    subject: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    status: 'open' as 'open' | 'in_progress' | 'resolved',
  });

  const { data: tickets = [], isLoading } = useQuery<SupportTicket[]>({
    queryKey: ['admin-support-tickets'],
    queryFn: () => apiClient('/admin/support-tickets'),
    enabled: !!isAdmin,
  });

  const editMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Record<string, unknown> }) =>
      apiClient(`/admin/support-tickets/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      setEditModalOpen(false);
      setSelectedTicket(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      apiClient(`/admin/support-tickets/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      setDeleteModalOpen(false);
      setSelectedTicket(null);
    },
  });

  if (!isAdmin) {
    return (
      <AdminLayout>
        <div className="text-center py-16 border border-border/80 bg-card rounded-3xl font-sans space-y-4 shadow-xl my-8">
          <ShieldAlert className="h-12 w-12 text-rose-500 mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-foreground">Access Restricted</h2>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            You must have Administrative privileges to view customer support tickets and helpdesk queues.
          </p>
        </div>
      </AdminLayout>
    );
  }

  const openTicketsCount = tickets.filter((t) => t.status === 'open').length;
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length;

  const columns: Column<SupportTicket>[] = [
    {
      header: 'Ticket ID & User',
      cell: (t) => (
        <div className="font-sans">
          <span className="font-mono font-bold text-[#F26522]">{t.ticketNumber}</span>
          <p className="text-[11px] text-muted-foreground font-medium">{t.userEmail}</p>
        </div>
      ),
    },
    {
      header: 'Issue Subject',
      cell: (t) => <span className="font-bold text-foreground text-xs sm:text-sm">{t.subject}</span>,
    },
    {
      header: 'Priority',
      cell: (t) => (
        <span
          className={`px-2.5 py-0.5 border text-[10px] font-black uppercase tracking-wider rounded-full ${
            t.priority === 'high'
              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20'
              : t.priority === 'medium'
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20'
              : 'bg-muted text-muted-foreground border-border/80'
          }`}
        >
          {t.priority}
        </span>
      ),
    },
    {
      header: 'Status',
      cell: (t) => (
        <span
          className={`inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
            t.status === 'resolved'
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : t.status === 'in_progress'
              ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20'
              : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
          }`}
        >
          {t.status === 'resolved' ? (
            <CheckCircle2 className="h-3.5 w-3.5" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5" />
          )}
          <span>{t.status.replace('_', ' ')}</span>
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (t) => (
        <div className="flex items-center justify-end space-x-2 font-sans">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(t);
              setViewModalOpen(true);
            }}
            className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all active:scale-95 shadow-xs"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Edit Ticket */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(t);
              setEditForm({ subject: t.subject, priority: t.priority, status: t.status });
              setEditModalOpen(true);
            }}
            className="p-2 rounded-xl border border-border/80 bg-background hover:bg-muted text-muted-foreground hover:text-secondary transition-all active:scale-95 shadow-xs"
            title="Edit Ticket"
          >
            <Pencil className="h-4 w-4" />
          </button>

          {/* Soft Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(t);
              setDeleteModalOpen(true);
            }}
            className="p-2 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all active:scale-95 shadow-xs"
            title="Soft Delete Ticket"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Brand Hero Section Header */}
      <AdminHero
        title="Support Tickets & Campus Helpdesk"
        subtitle="Resolve buyer & seller inquiries, shipment tracking support, and order dispute tickets across India."
        badgeText="Campus Helpdesk & Resolution"
        stats={[
          { label: "Total Tickets", value: tickets.length, badge: "All Inquiries", isPositive: true },
          { label: "Open Queue", value: openTicketsCount, badge: "Action Required", isPositive: false },
          { label: "In Progress", value: inProgressCount, badge: "Active Resolution", isPositive: true },
          { label: "Resolved", value: resolvedCount, badge: "Completed", isPositive: true },
        ]}
      />

      <div className="rounded-3xl border border-border/80 bg-card p-6 sm:p-8 shadow-xl font-sans">
        <AdminDataTable
          title="Support Ticket Inbox"
          subtitle="Active customer service queries and escalation tickets"
          data={tickets}
          columns={columns}
          searchField="subject"
          searchPlaceholder="Search ticket or user..."
          isLoading={isLoading}
        />
      </div>

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative space-y-4">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border/60 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <MessageSquare className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Ticket #{selectedTicket.ticketNumber}</h3>
                <p className="text-xs text-muted-foreground">Inquiry details</p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-muted/40 p-4 rounded-2xl border border-border/60 space-y-2">
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">User Name:</span>
                  <span className="font-bold text-foreground">{selectedTicket.name}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Email:</span>
                  <span className="text-foreground font-mono">{selectedTicket.userEmail}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Subject:</span>
                  <span className="font-bold text-foreground">{selectedTicket.subject}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Priority:</span>
                  <span className="uppercase font-extrabold text-rose-500">{selectedTicket.priority}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Status:</span>
                  <span className="uppercase font-extrabold text-emerald-500">{selectedTicket.status}</span>
                </p>
                <p className="flex justify-between">
                  <span className="font-bold text-muted-foreground">Date:</span>
                  <span className="text-foreground font-mono">{selectedTicket.createdAt}</span>
                </p>
              </div>

              <div>
                <p className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider mb-1.5">User Message</p>
                <p className="p-4 bg-background border border-border/80 rounded-2xl text-foreground text-xs leading-relaxed">
                  {selectedTicket.message}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-border/60">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-5 py-2.5 bg-[#F26522] text-white text-xs font-bold rounded-2xl hover:bg-[#D64E0F] transition-all shadow-sm active:scale-95"
              >
                Close Inquiry
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TICKET MODAL */}
      {editModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative space-y-4">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border/60 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary">
                <Pencil className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Edit Ticket #{selectedTicket.ticketNumber}</h3>
                <p className="text-xs text-muted-foreground">Update resolution status and priority</p>
              </div>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editMutation.mutate({ id: selectedTicket.id, data: editForm });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">Subject</label>
                <input
                  type="text"
                  required
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  className="w-full px-4 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-medium"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1.5">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'open' | 'in_progress' | 'resolved' })}
                  className="w-full px-3.5 py-2.5 border border-border/80 rounded-2xl bg-background text-foreground text-xs font-medium"
                >
                  <option value="open">Open Inquiry</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2.5 border border-border/80 rounded-2xl text-muted-foreground hover:bg-muted font-bold active:scale-95"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="px-5 py-2.5 bg-secondary hover:bg-[#D64E0F] text-white font-bold rounded-2xl flex items-center space-x-1.5 active:scale-95 shadow-md shadow-secondary/20"
                >
                  {editMutation.isPending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4 font-sans">
          <div className="bg-card border border-border/80 rounded-3xl max-w-md w-full shadow-2xl p-6 sm:p-8 relative space-y-4">
            <div className="flex items-center space-x-3 border-b border-border/60 pb-4">
              <div className="h-10 w-10 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-500">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-foreground">Soft Delete Ticket</h3>
                <p className="text-xs text-muted-foreground">Archive inquiry ticket</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Are you sure you want to soft delete / resolve ticket <span className="font-mono font-bold text-[#F26522]">{selectedTicket.ticketNumber}</span>?
            </p>

            <div className="flex justify-end gap-3 pt-3 border-t border-border/60">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2.5 border border-border/80 rounded-2xl text-xs font-bold text-muted-foreground hover:bg-muted active:scale-95"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedTicket.id)}
                disabled={deleteMutation.isPending}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5 active:scale-95 shadow-md shadow-rose-600/20"
              >
                {deleteMutation.isPending && <RefreshCw className="h-4 w-4 animate-spin" />}
                <span>Delete Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
