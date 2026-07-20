'use client';

import React, { useState } from 'react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminDataTable, Column } from '@/components/admin/admin-data-table';
import { useAuthStore } from '@/stores/auth.store';
import { MessageSquare, ShieldAlert, CheckCircle2, AlertCircle } from 'lucide-react';

interface SupportTicket {
  id: string;
  ticketNumber: string;
  userEmail: string;
  subject: string;
  priority: 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
}

const mockTickets: SupportTicket[] = [
  {
    id: '1',
    ticketNumber: 'TICK-801',
    userEmail: 'priya.sharma@iitd.ac.in',
    subject: 'Book dispatch tracking inquiry for Delhi address',
    priority: 'high',
    status: 'open',
    createdAt: '2026-07-20',
  },
  {
    id: '2',
    ticketNumber: 'TICK-802',
    userEmail: 'rahul.verma@du.ac.in',
    subject: 'Seller payout release verification for order BF-ORD-1002',
    priority: 'medium',
    status: 'in_progress',
    createdAt: '2026-07-19',
  },
  {
    id: '3',
    ticketNumber: 'TICK-803',
    userEmail: 'ananya.roy@ku.ac.in',
    subject: 'Request coupon code clarification for competitive exams bundle',
    priority: 'low',
    status: 'resolved',
    createdAt: '2026-07-17',
  },
];

export default function AdminSupportPage() {
  const { user: currentUser } = useAuthStore();
  const isAdmin = currentUser?.roles.includes('admin');

  const [tickets, setTickets] = useState<SupportTicket[]>(mockTickets);

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

  const handleResolve = (id: string) => {
    setTickets(tickets.map((t) => (t.id === id ? { ...t, status: 'resolved' } : t)));
  };

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
      cell: (t) =>
        t.status !== 'resolved' ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleResolve(t.id);
            }}
            className="px-3 py-1 bg-success hover:bg-success/90 text-white text-xs font-bold rounded flex items-center space-x-1 ml-auto transition-colors shadow-sm"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Mark Resolved</span>
          </button>
        ) : (
          <span className="text-[10px] font-bold text-text-muted uppercase">Closed</span>
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
      />
    </AdminLayout>
  );
}
