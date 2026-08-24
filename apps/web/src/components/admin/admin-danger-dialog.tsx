'use client';

import React from 'react';
import { AlertTriangle, Trash2, RefreshCw } from 'lucide-react';
import { AdminDialog } from './admin-dialog';

export interface AdminDangerDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: React.ReactNode;
  entityName?: string;
  impacts?: string[];
  confirmText?: string;
  cancelText?: string;
  isPending?: boolean;
  destructiveActionName?: string;
  reasonPrompt?: {
    label: string;
    placeholder: string;
    value: string;
    onChange: (val: string) => void;
    required?: boolean;
    error?: string | null;
  };
}

export function AdminDangerDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  entityName,
  impacts,
  confirmText = 'Confirm Action',
  cancelText = 'Cancel',
  isPending = false,
  reasonPrompt,
}: AdminDangerDialogProps) {
  return (
    <AdminDialog
      isOpen={isOpen}
      onClose={onClose}
      size="md"
      title={title}
      icon={<AlertTriangle className="h-5 w-5 text-danger" />}
      footer={
        <div className="flex items-center justify-end gap-3 w-full">
          <button
            type="button"
            disabled={isPending}
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-text-secondary hover:text-text-primary hover:bg-muted rounded-xl transition-colors"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isPending || (reasonPrompt?.required && !reasonPrompt.value.trim())}
            onClick={onConfirm}
            className="px-5 py-2 bg-danger hover:bg-danger/90 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all active:scale-95 shadow-sm flex items-center gap-1.5 disabled:opacity-50"
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
      <div className="space-y-4">
        {/* Warning Banner */}
        <div className="p-3.5 bg-danger/10 border border-danger/25 rounded-2xl flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-danger shrink-0 mt-0.5" />
          <div className="text-xs text-danger font-medium leading-relaxed">
            {description}
          </div>
        </div>

        {/* Entity Card */}
        {entityName && (
          <div className="p-3 bg-muted/50 border border-border rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-text-muted">Target Entity:</span>
            <span className="font-bold font-mono text-text-primary">{entityName}</span>
          </div>
        )}

        {/* Consequences Bullet Points */}
        {impacts && impacts.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[11px] font-bold uppercase tracking-wider text-text-muted">
              Operational Impact & Consequences:
            </p>
            <ul className="space-y-1 text-xs text-text-secondary">
              {impacts.map((impact, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-danger shrink-0 mt-1.5" />
                  <span>{impact}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Optional Reason Input */}
        {reasonPrompt && (
          <div className="space-y-1.5 pt-1">
            <label className="block text-xs font-bold text-text-primary">
              {reasonPrompt.label} {reasonPrompt.required && <span className="text-danger">*</span>}
            </label>
            <textarea
              rows={3}
              value={reasonPrompt.value}
              onChange={(e) => reasonPrompt.onChange(e.target.value)}
              placeholder={reasonPrompt.placeholder}
              className="w-full p-2.5 bg-background border border-border rounded-xl text-xs text-text-primary focus:ring-2 focus:ring-danger/30 focus:border-danger outline-none"
            />
            {reasonPrompt.error && (
              <p className="text-xs text-danger font-medium">{reasonPrompt.error}</p>
            )}
          </div>
        )}
      </div>
    </AdminDialog>
  );
}
