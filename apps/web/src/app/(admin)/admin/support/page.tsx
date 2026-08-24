'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminHero } from '@/components/admin/admin-hero';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { ShieldAlert, CheckCircle2, AlertCircle, Eye, Pencil, Trash2, RefreshCw, LifeBuoy } from 'lucide-react';
import {
  AdminDialog,
  AdminDetailRow,
  AdminStatBadge,
} from '@/components/admin/admin-dialog';
import { AdminDangerDialog } from '@/components/admin/admin-danger-dialog';
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

      {/* VIEW TICKET DETAILS MODAL */}
      {selectedTicket && (
        <AdminDialog
          isOpen={viewModalOpen}
          onClose={() => {
            setViewModalOpen(false);
            setSelectedTicket(null);
          }}
          size="lg"
          title={`Ticket #${selectedTicket.ticketNumber}`}
          subtitle={`Submitted by ${selectedTicket.name} • ${selectedTicket.createdAt}`}
          icon={<LifeBuoy className="h-5 w-5 text-secondary" />}
          badge={
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${
                selectedTicket.status === 'resolved'
                  ? 'bg-success/10 text-success border border-success/20'
                  : selectedTicket.status === 'in_progress'
                  ? 'bg-primary/10 text-primary border border-primary/20'
                  : 'bg-warning/10 text-warning border border-warning/20'
              }`}
            >
              {selectedTicket.status.replace('_', ' ')}
            </span>
          }
          headerActions={
            <button
              onClick={() => {
                setViewModalOpen(false);
                setEditForm({
                  subject: selectedTicket.subject,
                  priority: selectedTicket.priority,
                  status: selectedTicket.status,
                });
                setEditModalOpen(true);
              }}
              className="p-1.5 text-text-muted hover:text-secondary hover:bg-muted rounded-xl transition-all flex items-center gap-1 text-xs font-bold mr-2"
              title="Edit Ticket Parameters"
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Update</span>
            </button>
          }
          footer={
            <div className="flex items-center justify-between w-full">
              <p className="text-xs text-text-muted font-mono">
                Customer: <span className="font-bold text-text-primary">{selectedTicket.userEmail}</span>
              </p>
              <button
                onClick={() => {
                  setViewModalOpen(false);
                  setSelectedTicket(null);
                }}
                className="px-5 py-2 bg-secondary text-secondary-foreground text-xs font-bold rounded-xl hover:bg-secondary/90 shadow-xs"
              >
                Close Ticket
              </button>
            </div>
          }
        >
          <div className="space-y-5">
            {/* Stat Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <AdminStatBadge
                label="Priority Level"
                value={selectedTicket.priority.toUpperCase()}
                variant={
                  selectedTicket.priority === 'high'
                    ? 'danger'
                    : selectedTicket.priority === 'medium'
                    ? 'warning'
                    : 'default'
                }
              />
              <AdminStatBadge
                label="Resolution Status"
                value={selectedTicket.status.replace('_', ' ').toUpperCase()}
                variant={
                  selectedTicket.status === 'resolved'
                    ? 'success'
                    : selectedTicket.status === 'in_progress'
                    ? 'info'
                    : 'warning'
                }
              />
              <AdminStatBadge
                label="Created Date"
                value={selectedTicket.createdAt}
                variant="default"
              />
            </div>

            {/* Requester & Subject Info */}
            <div className="p-4 bg-muted/30 border border-border rounded-2xl space-y-2">
              <AdminDetailRow label="Subject" value={selectedTicket.subject} />
              <AdminDetailRow label="Requester Name" value={selectedTicket.name} />
              <AdminDetailRow label="Email Address" value={selectedTicket.userEmail} copyable />
              <AdminDetailRow label="Ticket Number" value={`#${selectedTicket.ticketNumber}`} copyable />
            </div>

            {/* Message Body */}
            <div>
              <p className="font-bold text-text-muted uppercase text-[11px] tracking-wider mb-1.5">
                Customer Message
              </p>
              <div className="p-4 bg-background border border-border rounded-2xl text-text-primary text-xs leading-relaxed">
                {selectedTicket.message}
              </div>
            </div>
          </div>
        </AdminDialog>
      )}

      {/* EDIT TICKET FORM MODAL */}
      {selectedTicket && (
        <AdminDialog
          isOpen={editModalOpen}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedTicket(null);
          }}
          size="md"
          title={`Update Ticket #${selectedTicket.ticketNumber}`}
          subtitle={`Adjusting priority and resolution progress`}
          icon={<Pencil className="h-5 w-5 text-secondary" />}
          footer={
            <div className="flex items-center justify-end gap-3 w-full">
              <button
                type="button"
                onClick={() => {
                  setEditModalOpen(false);
                  setSelectedTicket(null);
                }}
                className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="edit-ticket-form"
                disabled={editMutation.isPending}
                className="px-5 py-2 bg-secondary text-secondary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-secondary/90 transition-all shadow-xs flex items-center gap-1.5"
              >
                {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Save Changes</span>
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
            className="space-y-4 text-xs"
          >
            <div>
              <label className="block text-xs font-bold text-text-primary mb-1.5">
                Subject Title <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                required
                value={editForm.subject}
                onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Priority Level
                </label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none font-medium"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-text-primary mb-1.5">
                  Lifecycle Status
                </label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'open' | 'in_progress' | 'resolved' })}
                  className="w-full p-2.5 border border-border rounded-xl bg-background text-text-primary text-xs focus:ring-2 focus:ring-secondary/40 outline-none font-medium"
                >
                  <option value="open">Open Inquiry</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </form>
        </AdminDialog>
      )}

      {/* SOFT DELETE TICKET DANGER DIALOG */}
      {selectedTicket && (
        <AdminDangerDialog
          isOpen={deleteModalOpen}
          onClose={() => {
            setDeleteModalOpen(false);
            setSelectedTicket(null);
          }}
          onConfirm={() => deleteMutation.mutate(selectedTicket.id)}
          isPending={deleteMutation.isPending}
          title="Confirm Archive / Soft Delete Ticket"
          entityName={`Ticket #${selectedTicket.ticketNumber}`}
          description={
            <span>
              Are you sure you want to soft delete / archive ticket{' '}
              <strong>#{selectedTicket.ticketNumber}</strong>?
            </span>
          }
          impacts={[
            'The ticket will be removed from the active queue and moved to resolved archive.',
            'Staff assignment and notification listeners on this ticket will be unlinked.',
          ]}
          confirmText="Archive / Soft Delete"
        />
      )}
    </AdminLayout>
  );
}
