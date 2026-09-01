'use client';

import React, { useState } from 'react';
import { SellerLayout } from '@/components/seller/seller-layout';
import { RoleHero } from '@/components/shared/role-hero';
import { CheckCircle2, Circle, ArrowRight } from 'lucide-react';
import Link from 'next/link';

interface SellerTask {
  id: string;
  title: string;
  description: string;
  category: 'Orders' | 'Leads' | 'Inventory';
  priority: 'high' | 'medium' | 'low';
  completed: boolean;
  actionHref: string;
  actionLabel: string;
}

const initialTasks: SellerTask[] = [
  {
    id: '1',
    title: 'Dispatch Order #ORD-766893 (CLRS Algorithms)',
    description: 'Pack textbook and add DTDC/India Post tracking number for buyer delivery.',
    category: 'Orders',
    priority: 'high',
    completed: false,
    actionHref: '/seller/orders',
    actionLabel: 'Go to Orders',
  },
  {
    id: '2',
    title: 'Reply to Buyer Lead for BD Chaurasia Anatomy',
    description: 'Ananya R. requested details on textbook highlights and condition.',
    category: 'Leads',
    priority: 'high',
    completed: false,
    actionHref: '/seller/requests',
    actionLabel: 'View Lead',
  },
  {
    id: '3',
    title: 'Update Stock for Indian Polity (Laxmikanth)',
    description: 'Currently 1 copy left. Verify if additional copies are available for juniors.',
    category: 'Inventory',
    priority: 'medium',
    completed: true,
    actionHref: '/seller/listings',
    actionLabel: 'Manage Catalog',
  },
  {
    id: '4',
    title: 'List new semester syllabus reference books',
    description: 'List 2 more titles to hit your monthly semester revenue target of ₹10,000.',
    category: 'Inventory',
    priority: 'low',
    completed: false,
    actionHref: '/sell',
    actionLabel: 'List a Book',
  },
];

export default function SellerTasksPage() {
  const [tasks, setTasks] = useState<SellerTask[]>(initialTasks);

  const toggleTask = (id: string) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <SellerLayout>
      <RoleHero
        title="Today's Seller Tasks &amp; Checklist"
        subtitle="Actionable items to fulfill orders on time, close student leads, and maximize your campus textbook sales."
        badgeText="Daily Action Center"
        stats={[
          { label: 'Total Tasks', value: tasks.length, badge: 'Today', isPositive: true },
          { label: 'Completed', value: `${completedCount} Done`, badge: `${Math.round((completedCount / tasks.length) * 100)}%`, isPositive: true },
          { label: 'Urgent Action', value: tasks.filter((t) => !t.completed && t.priority === 'high').length, badge: 'High Priority', isPositive: false },
          { label: 'Checklist Score', value: 'Great', badge: '100% Target', isPositive: true },
        ]}
      />

      <div className="space-y-4 font-sans w-full">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-foreground">
            Action Items ({tasks.filter((t) => !t.completed).length} remaining)
          </h2>
          <span className="text-xs text-muted-foreground font-semibold">
            Click checkbox to mark complete
          </span>
        </div>

        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all shadow-sm flex items-start justify-between gap-4 ${
                task.completed
                  ? 'bg-muted/30 border-border/60 opacity-60'
                  : 'bg-card border-border/80 hover:border-secondary/40'
              }`}
            >
              <div className="flex items-start gap-3.5 min-w-0">
                <button
                  onClick={() => toggleTask(task.id)}
                  className="p-1 text-secondary hover:text-secondary/80 shrink-0 mt-0.5 cursor-pointer"
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark complete'}
                >
                  {task.completed ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 fill-emerald-500/20" />
                  ) : (
                    <Circle className="h-5 w-5 text-muted-foreground hover:text-secondary" />
                  )}
                </button>

                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full border ${
                      task.priority === 'high'
                        ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}>
                      {task.priority} Priority
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      {task.category}
                    </span>
                  </div>

                  <h3 className={`text-xs sm:text-sm font-bold text-foreground ${task.completed ? 'line-through' : ''}`}>
                    {task.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{task.description}</p>
                </div>
              </div>

              <Link
                href={task.actionHref}
                className="px-3.5 py-1.5 rounded-xl bg-secondary/15 hover:bg-secondary text-secondary hover:text-white font-bold text-xs shrink-0 self-end sm:self-center transition-all flex items-center gap-1 active:scale-95 shadow-xs"
              >
                <span>{task.actionLabel}</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </SellerLayout>
  );
}
