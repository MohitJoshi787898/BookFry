'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { MessageSquare, ShieldAlert, CheckCircle2, AlertCircle, Eye, Pencil, Trash2, X, RefreshCw } from 'lucide-react';
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
        <div className="text-center py-16 border border-border bg-surface rounded-md font-sans space-y-4">
          <ShieldAlert className="h-12 w-12 text-danger mx-auto" />
          <h2 className="font-serif text-2xl font-bold text-text-primary">Access Restricted</h2>
        </div>
      </AdminLayout>
    );
  }

  const columns: Column<SupportTicket>[] = [
    {
      header: 'Ticket ID & User',
      cell: (t) => (
        <div className="font-sans">
          <span className="font-mono font-bold text-brand">{t.ticketNumber}</span>
          <p className="text-[11px] text-text-muted">{t.userEmail}</p>
        </div>
      ),
    },
    {
      header: 'Issue Subject',
      cell: (t) => <span className="font-semibold text-text-primary">{t.subject}</span>,
    },
    {
      header: 'Priority',
      cell: (t) => (
        <span
          className={`px-2 py-0.5 border text-[9px] font-bold uppercase rounded ${
            t.priority === 'high'
              ? 'bg-danger/10 text-danger border-danger/20'
              : t.priority === 'medium'
              ? 'bg-warning/10 text-warning border-warning/20'
              : 'bg-background-subtle text-text-secondary border-border'
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
          className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            t.status === 'resolved'
              ? 'bg-success/10 text-success border border-success/20'
              : t.status === 'in_progress'
              ? 'bg-accent/10 text-accent border border-accent/20'
              : 'bg-danger/10 text-danger border border-danger/20'
          }`}
        >
          {t.status === 'resolved' ? (
            <CheckCircle2 className="h-3 w-3" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          <span>{t.status.replace('_', ' ')}</span>
        </span>
      ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (t) => (
        <div className="flex items-center justify-end space-x-1.5 font-sans">
          {/* View Details */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(t);
              setViewModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-brand transition-colors"
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>

          {/* Edit Ticket */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(t);
              setEditForm({ subject: t.subject, priority: t.priority, status: t.status });
              setEditModalOpen(true);
            }}
            className="p-1.5 rounded border border-border bg-surface hover:bg-background-subtle text-text-secondary hover:text-accent transition-colors"
            title="Edit Ticket"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>

          {/* Soft Delete / Resolve Ticket */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setSelectedTicket(t);
              setDeleteModalOpen(true);
            }}
            className="p-1.5 rounded border border-danger/20 bg-danger/10 text-danger hover:bg-danger hover:text-white transition-colors"
            title="Soft Delete Ticket"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <AdminLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border font-sans">
        <div>
          <h1 className="font-serif text-3xl font-bold text-text-primary flex items-center space-x-2">
            <MessageSquare className="h-7 w-7 text-brand" />
            <span>Support Tickets & Campus Helpdesk</span>
          </h1>
          <p className="text-xs text-text-secondary mt-1">
            Resolve buyer & seller inquiries, shipment tracking support, and order dispute tickets.
          </p>
        </div>
      </div>

      <AdminDataTable
        title="Support Ticket Inbox"
        subtitle="Active customer service queries"
        data={tickets}
        columns={columns}
        searchField="subject"
        searchPlaceholder="Search ticket or user..."
        isLoading={isLoading}
      />

      {/* VIEW DETAILS MODAL */}
      {viewModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setViewModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <MessageSquare className="h-6 w-6 text-brand" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Ticket #{selectedTicket.ticketNumber}</h3>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-background-subtle p-3 rounded-lg border border-border space-y-1.5">
                <p><span className="font-bold text-text-muted">User:</span> <span className="font-bold text-text-primary">{selectedTicket.name}</span> ({selectedTicket.userEmail})</p>
                <p><span className="font-bold text-text-muted">Subject:</span> <span className="font-bold text-text-primary">{selectedTicket.subject}</span></p>
                <p><span className="font-bold text-text-muted">Priority:</span> <span className="uppercase font-bold text-danger">{selectedTicket.priority}</span></p>
                <p><span className="font-bold text-text-muted">Status:</span> <span className="uppercase font-bold text-success">{selectedTicket.status}</span></p>
                <p><span className="font-bold text-text-muted">Date:</span> <span className="text-text-primary">{selectedTicket.createdAt}</span></p>
              </div>

              <div>
                <p className="font-bold text-text-muted uppercase text-[10px] mb-1">Message</p>
                <p className="p-3 bg-surface border border-border rounded-lg text-text-primary">{selectedTicket.message}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-border mt-4">
              <button
                onClick={() => setViewModalOpen(false)}
                className="px-4 py-2 bg-brand text-white text-xs font-bold rounded hover:bg-brand-hover"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT TICKET MODAL */}
      {editModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <button
              onClick={() => setEditModalOpen(false)}
              className="absolute top-4 right-4 p-1 rounded-full text-text-muted hover:bg-background-subtle hover:text-text-primary"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Pencil className="h-6 w-6 text-accent" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Edit Ticket #{selectedTicket.ticketNumber}</h3>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                editMutation.mutate({ id: selectedTicket.id, data: editForm });
              }}
              className="space-y-4 text-xs"
            >
              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={editForm.subject}
                  onChange={(e) => setEditForm({ ...editForm, subject: e.target.value })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Priority</label>
                <select
                  value={editForm.priority}
                  onChange={(e) => setEditForm({ ...editForm, priority: e.target.value as 'high' | 'medium' | 'low' })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                >
                  <option value="high">High Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="low">Low Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-text-muted mb-1">Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as 'open' | 'in_progress' | 'resolved' })}
                  className="w-full p-2.5 border border-border rounded bg-background text-text-primary"
                >
                  <option value="open">Open</option>
                  <option value="in_progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 border border-border rounded text-text-primary hover:bg-background-subtle font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editMutation.isPending}
                  className="px-5 py-2 bg-accent text-white font-bold rounded hover:bg-accent/90 flex items-center space-x-1"
                >
                  {editMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SOFT DELETE CONFIRMATION MODAL */}
      {deleteModalOpen && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 font-sans">
          <div className="bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-6 relative">
            <div className="flex items-center space-x-3 border-b border-border pb-4 mb-4">
              <Trash2 className="h-6 w-6 text-danger" />
              <h3 className="font-serif text-lg font-bold text-text-primary">Confirm Soft Delete Ticket</h3>
            </div>

            <p className="text-xs text-text-secondary mb-4">
              Are you sure you want to soft delete / resolve ticket <span className="font-bold text-brand font-mono">{selectedTicket.ticketNumber}</span>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 border border-border rounded text-xs font-bold text-text-primary hover:bg-background-subtle"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteMutation.mutate(selectedTicket.id)}
                disabled={deleteMutation.isPending}
                className="px-5 py-2 bg-danger text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-danger-hover flex items-center space-x-1"
              >
                {deleteMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                <span>Soft Delete Ticket</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
