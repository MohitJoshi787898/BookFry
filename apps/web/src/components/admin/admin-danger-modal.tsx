'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { AlertTriangle, Trash2, RefreshCw, ShieldAlert } from 'lucide-react';
import { AdminModal } from './admin-modal';

export interface AdminDangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  entityName?: string;
  entityImage?: string;
  impacts?: string[];
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  requiresTypingConfirmation?: boolean;
  requiredConfirmationText?: string;
}

export function AdminDangerModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  entityName,
  entityImage,
  impacts,
  confirmText = 'Confirm Destructive Action',
  cancelText = 'Cancel',
  isPending = false,
  requiresTypingConfirmation = false,
  requiredConfirmationText = 'CONFIRM',
}: AdminDangerModalProps) {
  const [typedValue, setTypedValue] = useState('');

  const isConfirmed = !requiresTypingConfirmation || typedValue.trim().toUpperCase() === requiredConfirmationText.toUpperCase();

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={title}
      icon={<AlertTriangle className="h-5 w-5 text-rose-500" />}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground rounded-2xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isPending || !isConfirmed}
            onClick={onConfirm}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all active:scale-95 shadow-md shadow-rose-600/20 flex items-center gap-1.5 disabled:opacity-40 cursor-pointer"
          >
            {isPending ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>{confirmText}</span>
          </button>
        </div>
      }
    >
      <div className="space-y-4 font-sans">
        {/* Warning Banner */}
        <div className="p-4 bg-rose-500/12 border border-rose-500/25 rounded-2xl flex items-start gap-3">
          <ShieldAlert className="h-5 w-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
            {description}
          </div>
        </div>

        {/* Entity Card with Image preview if provided */}
        {entityName && (
          <div className="p-3.5 bg-muted/60 border border-border/80 rounded-2xl flex items-center gap-3">
            {entityImage && (
              <div className="relative h-12 w-10 shrink-0 rounded-xl overflow-hidden bg-card border border-border">
                <Image src={entityImage} alt={entityName} fill sizes="40px" className="object-cover" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground block">
                Target Entity
              </span>
              <span className="font-bold text-xs text-foreground truncate block">
                {entityName}
              </span>
            </div>
          </div>
        )}

        {/* Consequences Bullet Points */}
        {impacts && impacts.length > 0 && (
          <div className="space-y-2 p-3.5 rounded-2xl bg-card border border-border/80">
            <p className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">
              Consequences &amp; Downstream Impact:
            </p>
            <ul className="space-y-1.5 text-xs text-muted-foreground font-medium">
              {impacts.map((impact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">•</span>
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Type confirmation security input if high-risk */}
        {requiresTypingConfirmation && (
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-foreground">
              Type <span className="font-mono text-rose-600 font-extrabold">{requiredConfirmationText}</span> to proceed:
            </label>
            <input
              type="text"
              value={typedValue}
              onChange={(e) => setTypedValue(e.target.value)}
              placeholder={requiredConfirmationText}
              className="w-full p-2.5 border border-border/80 rounded-xl bg-background text-foreground text-xs font-mono font-bold focus:ring-2 focus:ring-rose-500/40 outline-none"
            />
          </div>
        )}
      </div>
    </AdminModal>
  );
}

export default AdminDangerModal;
