'use client';

import React from 'react';
import { ArrowUp, ArrowDown, Edit3, Eye, EyeOff, Layers, ToggleLeft, ToggleRight } from 'lucide-react';
import { SectionData } from '@/components/marketing/section-renderer';

export interface SectionListTableProps {
  sections: SectionData[];
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleEnabled: (id: string, current: boolean) => void;
  onEdit: (section: SectionData) => void;
}

export function SectionListTable({
  sections,
  onMoveUp,
  onMoveDown,
  onToggleEnabled,
  onEdit,
}: SectionListTableProps) {
  if (!sections || sections.length === 0) {
    return (
      <div className="p-8 text-center border border-border/80 rounded-2xl bg-card">
        <p className="text-xs text-muted-foreground italic">No landing page sections found.</p>
      </div>
    );
  }

  return (
    <div className="border border-border/80 bg-card rounded-3xl overflow-hidden shadow-xl font-sans">
      <div className="p-5 border-b border-border/60 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Layers className="h-5 w-5 text-secondary" />
          <h2 className="font-serif text-lg font-bold text-foreground">
            Landing Page Section Architecture &amp; Feature Flags
          </h2>
        </div>
        <span className="text-[10px] font-extrabold uppercase bg-secondary/10 text-secondary px-3 py-1 rounded-full border border-secondary/20">
          {sections.length} Sections Managed
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border/60 bg-muted/40 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
              <th className="py-3 px-4 w-12 text-center">Order</th>
              <th className="py-3 px-4">Section Identifier</th>
              <th className="py-3 px-4">Title &amp; Type</th>
              <th className="py-3 px-4 text-center">Feature Flag (Show / Hide)</th>
              <th className="py-3 px-4 text-center">Reorder</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40 font-medium">
            {sections.map((section, idx) => (
              <tr key={section._id || section.sectionId} className="hover:bg-muted/20 transition-colors">
                <td className="py-3.5 px-4 text-center font-bold text-muted-foreground font-mono">
                  {idx + 1}
                </td>
                <td className="py-3.5 px-4">
                  <span className="font-mono text-[11px] font-bold text-foreground bg-muted/60 px-2 py-0.5 rounded-md border border-border">
                    {section.sectionId}
                  </span>
                </td>
                <td className="py-3.5 px-4">
                  <p className="font-bold text-foreground">{section.title}</p>
                  <span className="text-[10px] uppercase tracking-wider text-secondary font-extrabold">
                    Type: {section.type}
                  </span>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <button
                    onClick={() => onToggleEnabled(section._id!, section.enabled)}
                    title={section.enabled ? "Click to Hide Section" : "Click to Show Section"}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-extrabold border transition-all active:scale-95 shadow-xs ${
                      section.enabled
                        ? 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30 dark:text-emerald-400'
                        : 'bg-muted text-muted-foreground border-border'
                    }`}
                  >
                    {section.enabled ? (
                      <>
                        <ToggleRight className="h-4 w-4 text-emerald-500" />
                        <Eye className="h-3.5 w-3.5" />
                        <span>SHOW (ON)</span>
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                        <EyeOff className="h-3.5 w-3.5" />
                        <span>HIDE (OFF)</span>
                      </>
                    )}
                  </button>
                </td>
                <td className="py-3.5 px-4 text-center">
                  <div className="flex items-center justify-center space-x-1">
                    <button
                      onClick={() => onMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                      aria-label="Move up"
                    >
                      <ArrowUp className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onMoveDown(idx)}
                      disabled={idx === sections.length - 1}
                      className="p-1.5 rounded-lg border border-border bg-background hover:bg-muted text-foreground disabled:opacity-30 disabled:hover:bg-transparent transition-all"
                      aria-label="Move down"
                    >
                      <ArrowDown className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onEdit(section)}
                      className="px-3.5 py-1.5 bg-secondary/10 text-secondary hover:bg-secondary hover:text-white rounded-xl font-bold text-xs border border-secondary/20 transition-all flex items-center space-x-1.5 shadow-xs"
                    >
                      <Edit3 className="h-3.5 w-3.5" />
                      <span>Edit Content</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default SectionListTable;
