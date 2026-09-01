'use client';

import React, { useState } from 'react';
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { AdminModal } from './admin-modal';

export interface AdminDecisionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  entityName: string;
  entityCategory?: string;
  actionType: 'approve' | 'reject' | 'revision';
  onConfirm: (reason: string, notifyUser: boolean) => void;
  isPending?: boolean;
  presetReasons?: string[];
}

const DEFAULT_REASONS = [
  'Inaccurate or misleading textbook condition description.',
  'Cover photo is blurry, unreadable, or missing critical ISBN details.',
  'Listing price significantly deviates from standard marketplace benchmarks.',
  'Suspected replica or unauthorized photocopy edition.',
  'Duplicate listing already active on the marketplace.',
];

export function AdminDecisionModal({
  isOpen,
  onClose,
  title,
  subtitle,
  entityName,
  entityCategory,
  actionType = 'reject',
  onConfirm,
  isPending = false,
  presetReasons = DEFAULT_REASONS,
}: AdminDecisionModalProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>(presetReasons[0] || '');
  const [customFeedback, setCustomFeedback] = useState('');
  const [notifyUser, setNotifyUser] = useState(true);

  const effectiveReason = customFeedback.trim() || selectedPreset;

  const isApprove = actionType === 'approve';

  return (
    <AdminModal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={title}
      subtitle={subtitle}
      icon={
        isApprove ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-600" />
        ) : (
          <AlertCircle className="h-5 w-5 text-rose-600" />
        )
      }
      footer={
        <div className="flex items-center justify-between w-full">
          <label className="flex items-center gap-2 text-xs text-muted-foreground font-semibold cursor-pointer">
            <input
              type="checkbox"
              checked={notifyUser}
              onChange={(e) => setNotifyUser(e.target.checked)}
              className="rounded border-border text-secondary focus:ring-secondary/20 accent-secondary"
            />
            <span>Send automated email &amp; dashboard notification</span>
          </label>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              disabled={isPending}
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-muted-foreground hover:text-foreground rounded-2xl transition-colors cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isPending || (!isApprove && !effectiveReason)}
              onClick={() => onConfirm(effectiveReason, notifyUser)}
              className={`px-5 py-2.5 text-white rounded-2xl text-xs font-black uppercase tracking-wider transition-all active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer disabled:opacity-40 ${
                isApprove
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              {isPending ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : isApprove ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : (
                <XCircle className="h-3.5 w-3.5" />
              )}
              <span>{isApprove ? 'Approve Submission' : 'Confirm Decision'}</span>
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-4 font-sans">
        {/* Target Entity Snapshot */}
        <div className="p-3.5 rounded-2xl bg-muted/60 border border-border/80 flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Target</span>
            <p className="font-bold text-xs text-foreground truncate">{entityName}</p>
          </div>
          {entityCategory && (
            <span className="px-2.5 py-0.5 rounded-full bg-secondary/15 text-secondary border border-secondary/20 text-[10px] font-black uppercase">
              {entityCategory}
            </span>
          )}
        </div>

        {!isApprove && (
          <>
            {/* Presets Selection */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground">
                Select Pre-Configured Reason:
              </label>
              <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                {presetReasons.map((reason, idx) => (
                  <label
                    key={idx}
                    className={`flex items-start gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-all ${
                      selectedPreset === reason && !customFeedback
                        ? 'bg-secondary/12 border-secondary/30 text-foreground font-semibold'
                        : 'border-border/70 bg-card hover:bg-muted/50 text-muted-foreground'
                    }`}
                  >
                    <input
                      type="radio"
                      name="decision-preset"
                      checked={selectedPreset === reason && !customFeedback}
                      onChange={() => {
                        setSelectedPreset(reason);
                        setCustomFeedback('');
                      }}
                      className="mt-0.5 text-secondary accent-secondary"
                    />
                    <span className="leading-snug">{reason}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Custom Notes / Feedback */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-foreground flex items-center justify-between">
                <span>Or Provide Custom Moderator Feedback:</span>
                <span className="text-[10px] text-muted-foreground font-normal">Optional</span>
              </label>
              <textarea
                rows={3}
                value={customFeedback}
                onChange={(e) => setCustomFeedback(e.target.value)}
                placeholder="Enter specific instructions or corrections for the student/seller..."
                className="w-full p-3 border border-border/80 rounded-2xl bg-background text-foreground text-xs leading-relaxed focus:ring-2 focus:ring-secondary/40 outline-none resize-none"
              />
            </div>
          </>
        )}
      </div>
    </AdminModal>
  );
}

export default AdminDecisionModal;
